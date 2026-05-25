"""Blog Publisher - saves generated posts to the live Supabase blog schema."""

import re
from datetime import datetime, timezone

from config import BLOG_BASE_URL
from utils import get_supabase, content_hash, estimate_read_time, detect_category


CATEGORY_SLUG_BY_BLOG_TYPE = {
    "money-making": "ai-business",
    "ai-tools": "ai-automation",
    "tech-news": "ai-research",
    "product-review": "ai-productivity",
}

SOURCE_PLATFORM_BY_SOURCE = {
    "github": "manual",
    "hackernews": "hackernews",
    "producthunt": "producthunt",
    "reddit": "reddit",
    "x": "x",
}


def _missing_column_name(error: Exception) -> str | None:
    message = str(error)
    patterns = [
        r"column blog_posts\.([a-zA-Z0-9_]+) does not exist",
        r"Could not find the '([a-zA-Z0-9_]+)' column",
    ]
    for pattern in patterns:
        match = re.search(pattern, message)
        if match:
            return match.group(1)
    return None


def _insert_blog_post(supabase, record: dict):
    payload = dict(record)
    for _ in range(12):
        try:
            return supabase.table("blog_posts").insert(payload).execute()
        except Exception as e:
            missing = _missing_column_name(e)
            if missing and missing in payload:
                print(f"[WARN] Blog: live schema missing '{missing}', retrying without it.")
                payload.pop(missing, None)
                continue
            raise
    raise RuntimeError("Could not insert blog post after removing unsupported columns.")


def _get_category_id(supabase, category: str) -> str | None:
    slug = CATEGORY_SLUG_BY_BLOG_TYPE.get(category, "ai-research")
    try:
        result = (
            supabase.table("categories")
            .select("id")
            .eq("slug", slug)
            .limit(1)
            .execute()
        )
        if result.data:
            return result.data[0]["id"]
    except Exception as e:
        print(f"[WARN] Category lookup failed for '{slug}': {e}")
    return None


def _ensure_unique_slug(supabase, slug: str) -> str:
    try:
        existing = supabase.table("blog_posts").select("id").eq("slug", slug).execute()
        if existing.data:
            import time

            return f"{slug}-{int(time.time()) % 100000}"
    except Exception as e:
        print(f"[WARN] Slug collision check skipped: {e}")
    return slug


def _ascii_slug(text: str, fallback: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    if not base:
        base = re.sub(r"[^a-z0-9]+", "-", fallback.lower()).strip("-")
    short_hash = content_hash(text or fallback)[:6]
    return f"{base[:80].strip('-')}-{short_hash}" if base else short_hash


def _category_from_tags(tags) -> str:
    if isinstance(tags, list):
        for tag in tags:
            if tag in CATEGORY_SLUG_BY_BLOG_TYPE:
                return tag
    return "tech-news"


def publish_to_blog(original: dict, bangla: dict) -> dict | None:
    supabase = get_supabase()

    slug_source = original.get("repo_name") or original.get("original_title") or bangla["bangla_title"]
    slug = _ensure_unique_slug(supabase, _ascii_slug(slug_source, bangla["bangla_title"]))
    blog_url = f"{BLOG_BASE_URL}/blog/{slug}"
    c_hash = content_hash(original.get("original_body", original.get("original_title", "")))
    category = detect_category(
        original["source"],
        original.get("original_title", ""),
        original.get("original_body", ""),
    )
    read_time = estimate_read_time(bangla["bangla_body"])
    tags = _generate_tags(original, category)
    category_id = _get_category_id(supabase, category)
    published_at = datetime.now(timezone.utc).isoformat()
    body = bangla["bangla_body"]
    hook = bangla["bangla_hook"]
    title = bangla["bangla_title"]
    meta_description = bangla.get("meta_description", hook[:155])

    record = {
        "title": title,
        "slug": slug,
        "excerpt_bn": hook,
        "content_bn": body,
        "reading_time_minutes": read_time,
        "word_count": len(body.split()),
        "meta_title": title[:70],
        "meta_description": meta_description,
        "focus_keyword": (bangla.get("related_keywords") or tags or [category])[0],
        "category_id": category_id,
        "tags": tags,
        "related_tool_ids": [],
        "has_affiliate_links": False,
        "source_platform": SOURCE_PLATFORM_BY_SOURCE.get(original["source"], "manual"),
        "source_url": original.get("source_url", ""),
        "source_title": original.get("original_title", ""),
        "internal_links": [],
        "status": "published",
        "view_count": 0,
        "share_count": 0,
        "published_at": published_at,
    }
    if not category_id:
        record.pop("category_id", None)

    try:
        result = _insert_blog_post(supabase, record)
        if result.data:
            post = result.data[0]
            post["blog_url"] = blog_url
            post["blog_slug"] = post.get("slug", slug)
            post["bangla_title"] = post.get("title", title)
            post["bangla_hook"] = post.get("excerpt_bn", hook)
            post["category"] = category
            post["source"] = original["source"]
            post["read_time_min"] = post.get("reading_time_minutes", read_time)
            post["content_hash"] = c_hash
            print(f"[Blog] Published: {slug}")
            return post
        print("[ERROR] Blog: no data returned")
        return None
    except Exception as e:
        print(f"[ERROR] Blog publish: {e}")
        return None


def _generate_tags(original: dict, category: str) -> list[str]:
    tags = [category]
    source = original.get("source", "")
    if source == "reddit":
        tags.append("reddit-tips")
        sub = original.get("subreddit", "")
        if sub:
            tags.append(f"r-{sub}")
    elif source == "x":
        tags.append("x-trending")
    elif source == "hackernews":
        tags.append("hacker-news")
    elif source == "producthunt":
        tags.append("product-hunt")
        tags.extend(original.get("topics", [])[:2])
    elif source == "github":
        tags.append("github-oss")
        tags.append("open-source")
    return tags


def get_unpublished_to_fb() -> list[dict]:
    supabase = get_supabase()
    try:
        result = (
            supabase.table("blog_posts")
            .select("*")
            .eq("status", "published")
            .order("published_at", desc=True)
            .limit(5)
            .execute()
        )
        posts = result.data or []
        for post in posts:
            slug = post.get("blog_slug") or post.get("slug")
            post["blog_slug"] = slug
            post["bangla_title"] = post.get("bangla_title") or post.get("title")
            post["bangla_hook"] = post.get("bangla_hook") or post.get("excerpt_bn")
            post["category"] = post.get("category") or _category_from_tags(post.get("tags"))
            post["source"] = post.get("source") or post.get("source_platform")
            post["read_time_min"] = post.get("read_time_min") or post.get("reading_time_minutes")
            post["blog_url"] = f"{BLOG_BASE_URL}/blog/{slug}"
        return posts
    except Exception as e:
        print(f"[ERROR] Fetch unpublished: {e}")
        return []


def mark_fb_posted(post_id: int, fb_post_id: str, fb_comment_id: str):
    supabase = get_supabase()
    try:
        supabase.table("social_posts").insert(
            {
                "blog_post_id": post_id,
                "platform": "facebook",
                "post_id": fb_post_id,
                "comment_id": fb_comment_id,
                "status": "posted",
            }
        ).execute()
        print(f"[Blog] Marked social posted: {post_id}")
    except Exception as e:
        print(f"[WARN] Social post status not recorded: {e}")


def increment_view(slug: str):
    """Increment view count for a blog post."""
    supabase = get_supabase()
    try:
        supabase.rpc("increment_view", {"tbl": "blog_posts", "slug_val": slug}).execute()
    except Exception:
        pass
