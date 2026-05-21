"""Blog Publisher — saves to Supabase with category, read time, related posts."""

from datetime import datetime, timezone
from utils import get_supabase, slugify, content_hash, estimate_read_time, detect_category
from config import BLOG_BASE_URL


def publish_to_blog(original: dict, bangla: dict) -> dict | None:
    supabase = get_supabase()

    slug = slugify(bangla["bangla_title"])
    # Handle slug collision — append timestamp if slug exists
    existing = supabase.table("blog_posts").select("id").eq("blog_slug", slug).execute()
    if existing.data:
        import time
        slug = f"{slug}-{int(time.time()) % 100000}"

    blog_url = f"{BLOG_BASE_URL}/blog/{slug}"
    c_hash = content_hash(
        original.get("original_body", original.get("original_title", ""))
    )
    category = detect_category(
        original["source"],
        original.get("original_title", ""),
        original.get("original_body", ""),
    )
    read_time = estimate_read_time(bangla["bangla_body"])
    tags = _generate_tags(original, category)

    record = {
        "source": original["source"],
        "source_url": original.get("source_url", ""),
        "original_title": original.get("original_title", ""),
        "original_body": (original.get("original_body", ""))[:5000],
        "bangla_title": bangla["bangla_title"],
        "bangla_body": bangla["bangla_body"],
        "bangla_hook": bangla["bangla_hook"],
        "meta_description": bangla.get("meta_description", bangla["bangla_hook"][:155]),
        "related_keywords": bangla.get("related_keywords", []),
        "blog_slug": slug,
        "status": "published",
        "category": category,
        "tags": tags,
        "read_time_min": read_time,
        "engagement_score": original.get("engagement_score", 0),
        "content_hash": c_hash,
        "view_count": 0,
        "fb_posted": False,
        "fb_post_id": None,
        "fb_comment_id": None,
        "published_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        result = supabase.table("blog_posts").insert(record).execute()
        if result.data:
            post = result.data[0]
            post["blog_url"] = blog_url  # computed, not in DB
            print(f"[Blog] ✓ Published: {slug}")
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
    return tags


def get_unpublished_to_fb() -> list[dict]:
    supabase = get_supabase()
    try:
        result = (
            supabase.table("blog_posts")
            .select("*")
            .eq("status", "published")
            .eq("fb_posted", False)
            .order("published_at", desc=True)
            .limit(5)
            .execute()
        )
        posts = result.data or []
        for p in posts:
            p["blog_url"] = f"{BLOG_BASE_URL}/blog/{p['blog_slug']}"
        return posts
    except Exception as e:
        print(f"[ERROR] Fetch unpublished: {e}")
        return []


def mark_fb_posted(post_id: int, fb_post_id: str, fb_comment_id: str):
    supabase = get_supabase()
    try:
        supabase.table("blog_posts").update({
            "fb_posted": True,
            "fb_post_id": fb_post_id,
            "fb_comment_id": fb_comment_id,
        }).eq("id", post_id).execute()
        print(f"[Blog] ✓ Marked FB posted: {post_id}")
    except Exception as e:
        print(f"[ERROR] Update FB status: {e}")


def increment_view(slug: str):
    """Increment view count for a blog post."""
    supabase = get_supabase()
    try:
        supabase.rpc("increment_view", {"tbl": "blog_posts", "slug_val": slug}).execute()
    except Exception:
        pass
