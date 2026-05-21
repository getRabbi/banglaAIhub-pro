"""Telegram Admin Bot — check stats, recent posts, control pipeline."""

import requests
from utils import get_supabase, send_telegram
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CATEGORIES


def get_stats_message() -> str:
    """Generate stats message for Telegram."""
    supabase = get_supabase()

    # Total counts
    result = supabase.table("blog_posts").select(
        "id, category, view_count, source, fb_posted"
    ).eq("blog_published", True).execute()
    posts = result.data or []

    total = len(posts)
    total_views = sum(p.get("view_count", 0) for p in posts)
    fb_done = sum(1 for p in posts if p.get("fb_posted"))

    # Category breakdown
    cat_lines = []
    for key, info in CATEGORIES.items():
        count = sum(1 for p in posts if p.get("category") == key)
        views = sum(p.get("view_count", 0) for p in posts if p.get("category") == key)
        cat_lines.append(f"  {info['emoji']} {info['label']}: {count} posts, {views} views")

    # Source breakdown
    sources = {}
    for p in posts:
        s = p.get("source", "unknown")
        sources[s] = sources.get(s, 0) + 1
    source_lines = [f"  • {k}: {v}" for k, v in sorted(sources.items(), key=lambda x: -x[1])]

    # Top 5 posts
    top = sorted(posts, key=lambda x: x.get("view_count", 0), reverse=True)[:5]

    # Get titles for top posts
    if top:
        top_ids = [p["id"] for p in top]
        top_result = supabase.table("blog_posts").select(
            "id, bangla_title, view_count"
        ).in_("id", top_ids).execute()
        top_map = {p["id"]: p for p in (top_result.data or [])}
    else:
        top_map = {}

    top_lines = []
    for i, p in enumerate(top, 1):
        info = top_map.get(p["id"], {})
        title = info.get("bangla_title", "???")[:40]
        views = p.get("view_count", 0)
        top_lines.append(f"  {i}. {title}... ({views} views)")

    msg = f"""
📊 <b>OpenClaw v3 — Dashboard</b>

📝 Total Posts: <b>{total}</b>
👁 Total Views: <b>{total_views}</b>
📘 FB Posted: <b>{fb_done}</b> / {total}
📈 Avg Views: <b>{total_views // max(total, 1)}</b>

<b>📂 Categories:</b>
{chr(10).join(cat_lines)}

<b>📡 Sources:</b>
{chr(10).join(source_lines)}

<b>🔥 Top 5 Posts:</b>
{chr(10).join(top_lines) if top_lines else "  No posts yet"}
"""
    return msg.strip()


def get_recent_message() -> str:
    """Get last 5 published posts."""
    supabase = get_supabase()
    result = supabase.table("blog_posts").select(
        "bangla_title, blog_url, category, view_count, fb_posted, published_at"
    ).eq("blog_published", True).order(
        "published_at", desc=True
    ).limit(5).execute()

    posts = result.data or []
    if not posts:
        return "📭 No posts published yet."

    lines = ["📰 <b>Recent Posts:</b>\n"]
    for p in posts:
        cat = CATEGORIES.get(p["category"], {})
        emoji = cat.get("emoji", "📝")
        fb = "✅" if p.get("fb_posted") else "⏳"
        title = p["bangla_title"][:45]
        lines.append(
            f"{emoji} <a href=\"{p['blog_url']}\">{title}</a>\n"
            f"   👁 {p['view_count']} views | FB: {fb}"
        )

    return "\n".join(lines)


def handle_command(command: str) -> str:
    """Handle Telegram bot commands."""
    cmd = command.strip().lower()

    if cmd == "/stats":
        return get_stats_message()
    elif cmd == "/recent":
        return get_recent_message()
    elif cmd == "/help":
        return (
            "🤖 <b>OpenClaw Admin Commands:</b>\n\n"
            "/stats — Full dashboard\n"
            "/recent — Last 5 posts\n"
            "/help — Show this message"
        )
    else:
        return f"Unknown command: {cmd}\nType /help for available commands."


def check_and_respond():
    """Poll Telegram for admin commands (call from separate cron or manually)."""
    if not TELEGRAM_BOT_TOKEN:
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    try:
        resp = requests.get(url, params={"limit": 5, "timeout": 1}, timeout=5)
        data = resp.json()

        for update in data.get("result", []):
            msg = update.get("message", {})
            chat_id = str(msg.get("chat", {}).get("id", ""))
            text = msg.get("text", "")

            if chat_id == TELEGRAM_CHAT_ID and text.startswith("/"):
                response = handle_command(text)
                send_telegram(response)

                # Mark as read
                offset = update["update_id"] + 1
                requests.get(url, params={"offset": offset}, timeout=5)

    except Exception as e:
        print(f"[ERROR] Telegram bot poll: {e}")


if __name__ == "__main__":
    # Manual test
    print(handle_command("/stats"))
