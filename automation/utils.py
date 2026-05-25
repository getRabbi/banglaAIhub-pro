import hashlib
import re
import unicodedata
import requests
from supabase import create_client, Client
from config import (
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
)


def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def content_hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()


def is_duplicate(supabase: Client, hash_val: str, post: dict | None = None) -> bool:
    def exists_by(field: str, value: str) -> bool:
        try:
            result = (
                supabase.table("blog_posts")
                .select("id")
                .eq(field, value)
                .execute()
            )
            return len(result.data) > 0
        except Exception as e:
            if field in str(e) or "does not exist" in str(e):
                return False
            raise

    try:
        result = (
            supabase.table("blog_posts")
            .select("id")
            .eq("content_hash", hash_val)
            .execute()
        )
        return len(result.data) > 0
    except Exception as e:
        if "content_hash" not in str(e):
            raise

    if not post:
        return False

    source_url = post.get("source_url")
    if source_url and exists_by("source_url", source_url):
        return True

    original_title = post.get("original_title")
    if original_title:
        return exists_by("original_title", original_title)

    return False


def send_telegram(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[WARN] Telegram not configured, skipping.")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        resp = requests.post(
            url,
            json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"},
            timeout=10,
        )
        resp.raise_for_status()
    except Exception as e:
        print(f"[ERROR] Telegram: {e}")


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"[^\w\s\u0980-\u09FF-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip())
    text = re.sub(r"-+", "-", text).strip("-").lower()
    short_hash = hashlib.md5(text.encode()).hexdigest()[:6]
    return f"{text}-{short_hash}" if text else short_hash


def estimate_read_time(text: str) -> int:
    """Estimate reading time in minutes for Bangla text."""
    # Average Bangla reading speed ~200 words/min, but Bangla words are longer
    word_count = len(text.split())
    minutes = max(1, round(word_count / 180))
    return minutes


def detect_category(source: str, title: str, body: str) -> str:
    """Auto-detect content category based on source and keywords."""
    text = (title + " " + body).lower()

    money_keywords = [
        "money", "earn", "income", "hustle", "freelance", "passive",
        "dollar", "revenue", "profit", "business", "client", "gig",
        "আয়", "টাকা", "ফ্রিল্যান্স", "ইনকাম",
    ]
    ai_keywords = [
        "ai", "gpt", "llm", "chatgpt", "claude", "gemini", "model",
        "neural", "machine learning", "deep learning", "prompt",
        "এআই", "কৃত্রিম বুদ্ধিমত্তা",
    ]

    money_score = sum(1 for kw in money_keywords if kw in text)
    ai_score = sum(1 for kw in ai_keywords if kw in text)

    if source == "producthunt":
        return "product-review"
    if money_score > ai_score:
        return "money-making"
    if ai_score > 0:
        return "ai-tools"
    return "tech-news"
