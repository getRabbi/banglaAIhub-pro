"""Backfill thumbnails and broad categories for existing blog posts."""

from __future__ import annotations

from agents.blog_publisher import CATEGORY_SLUG_BY_BLOG_TYPE, _missing_column_name
from agents.image_finder import find_blog_image
from utils import detect_category, get_supabase


def _category_from_tags(tags: object) -> str:
    if isinstance(tags, list):
        for tag in tags:
            if tag in CATEGORY_SLUG_BY_BLOG_TYPE:
                return str(tag)
    return "tech-news"


def _replace_category_tag(tags: object, category: str) -> list[str]:
    clean = [str(tag) for tag in tags] if isinstance(tags, list) else []
    clean = [tag for tag in clean if tag not in CATEGORY_SLUG_BY_BLOG_TYPE]
    return [category, *clean]


def _category_id_by_blog_type(supabase) -> dict[str, object]:
    result = supabase.table("categories").select("id,slug").execute()
    by_slug = {row["slug"]: row["id"] for row in result.data or []}
    return {
        blog_type: by_slug.get(category_slug)
        for blog_type, category_slug in CATEGORY_SLUG_BY_BLOG_TYPE.items()
    }


def _update_blog_post(supabase, post_id: object, payload: dict) -> bool:
    data = dict(payload)
    for _ in range(10):
        if not data:
            return False
        try:
            supabase.table("blog_posts").update(data).eq("id", post_id).execute()
            return True
        except Exception as e:
            missing = _missing_column_name(e)
            if missing and missing in data:
                data.pop(missing, None)
                continue
            raise
    return False


def run(limit: int = 100) -> None:
    supabase = get_supabase()
    category_ids = _category_id_by_blog_type(supabase)
    result = (
        supabase.table("blog_posts")
        .select("*")
        .order("published_at", desc=True)
        .limit(limit)
        .execute()
    )

    updated = 0
    image_updates = 0
    category_updates = 0

    for row in result.data or []:
        title = row.get("title") or row.get("bangla_title") or row.get("source_title") or ""
        body = row.get("content_bn") or row.get("bangla_body") or row.get("source_title") or ""
        source = row.get("source") or row.get("source_platform") or "manual"
        current_category = row.get("category") or _category_from_tags(row.get("tags"))
        detected_category = detect_category(source, row.get("source_title") or title, body)
        category = detected_category if current_category != detected_category else current_category
        payload: dict = {}

        if not row.get("thumbnail_url"):
            image = find_blog_image(title=title, category=category, query_hint=title)
            if image.get("url"):
                payload.update(
                    {
                        "thumbnail_url": image["url"],
                        "thumbnail_alt": image.get("alt") or title,
                        "og_image_url": image["url"],
                    }
                )
                image_updates += 1

        if category != current_category:
            payload["tags"] = _replace_category_tag(row.get("tags"), category)
            payload["category"] = category
            category_id = category_ids.get(category)
            if category_id:
                payload["category_id"] = category_id
            category_updates += 1

        if payload and _update_blog_post(supabase, row["id"], payload):
            updated += 1
            print(f"[Backfill] Updated {row.get('slug') or row.get('blog_slug') or row['id']}")

    print(
        f"[Backfill] Done. updated={updated}, images={image_updates}, categories={category_updates}"
    )


if __name__ == "__main__":
    run()
