"""Telegram channel auto-poster for newly published articles."""

from __future__ import annotations

import html
import requests

from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CATEGORIES


def post_to_telegram(
    hook: str,
    blog_url: str,
    bangla_title: str,
    category: str = "tech-news",
    image_url: str | None = None,
) -> str | None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[WARN] Telegram channel not configured, skipping article post.")
        return None

    cat = CATEGORIES.get(category, CATEGORIES["tech-news"])
    hashtags = _get_hashtags(category)
    caption = f"""{cat["emoji"]} <b>{html.escape(bangla_title)}</b>

{html.escape(hook)}

🔗 পুরো গাইড পড়ুন: {html.escape(blog_url)}

{hashtags}"""

    endpoint = "sendPhoto" if image_url else "sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "parse_mode": "HTML",
    }
    if image_url:
        payload["photo"] = image_url
        payload["caption"] = caption[:1000]
    else:
        payload["text"] = caption[:3500]

    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{endpoint}",
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        message_id = (data.get("result") or {}).get("message_id")
        print(f"[Telegram] Posted article: {message_id}")
        return str(message_id) if message_id else None
    except Exception as e:
        print(f"[ERROR] Telegram article post: {e}")
        return None


def _get_hashtags(category: str) -> str:
    tags = {
        "money-making": "#OnlineIncome #Freelancing #BanglaAIHub",
        "ai-tools": "#AITools #Automation #BanglaAIHub",
        "tech-news": "#TechNews #Programming #BanglaAIHub",
        "product-review": "#ProductReview #SaaS #BanglaAIHub",
    }
    return tags.get(category, tags["tech-news"])
