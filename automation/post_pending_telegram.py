"""Post latest unposted blog articles to Telegram."""

from __future__ import annotations

from agents.blog_publisher import mark_social_posted
from agents.telegram_poster import post_to_telegram
from utils import get_supabase


BLOG_CATEGORIES = {"money-making", "ai-tools", "tech-news", "product-review"}


def _category_from_post(row: dict) -> str:
    tags = row.get("tags")
    if isinstance(tags, list):
        for tag in tags:
            if tag in BLOG_CATEGORIES:
                return str(tag)
    return row.get("category") or "tech-news"


def _already_posted(supabase, post_id: object) -> bool:
    try:
        result = (
            supabase.table("social_posts")
            .select("id")
            .eq("blog_post_id", post_id)
            .eq("platform", "telegram")
            .limit(1)
            .execute()
        )
        return bool(result.data)
    except Exception as e:
        print(f"[WARN] Telegram duplicate check skipped: {e}")
        return False


def run(limit: int = 1) -> None:
    supabase = get_supabase()
    result = (
        supabase.table("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", desc=True)
        .limit(10)
        .execute()
    )

    posted = 0
    for row in result.data or []:
        if posted >= limit:
            break
        if _already_posted(supabase, row["id"]):
            continue

        slug = row.get("slug") or row.get("blog_slug")
        blog_url = row.get("blog_url") or f"https://banglaaihub.vercel.app/blog/{slug}"
        title = row.get("title") or row.get("bangla_title") or row.get("source_title") or "BanglaAIHub update"
        hook = row.get("excerpt_bn") or row.get("bangla_hook") or row.get("meta_description") or ""
        message_id = post_to_telegram(
            hook=hook,
            blog_url=blog_url,
            bangla_title=title,
            category=_category_from_post(row),
            image_url=row.get("thumbnail_url"),
        )
        if message_id:
            mark_social_posted(row["id"], "telegram", message_id)
            posted += 1
            print(f"[Telegram] Posted pending article: {slug}")

    print(f"[Telegram] Done. posted={posted}")


if __name__ == "__main__":
    run()
