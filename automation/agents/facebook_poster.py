"""Facebook Auto-Poster — hook in body + link + first comment with link."""

import time
import requests
from config import FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID, CATEGORIES

GRAPH_URL = "https://graph.facebook.com/v19.0"


def post_to_facebook(
    hook: str,
    blog_url: str,
    bangla_title: str,
    category: str = "tech-news",
) -> tuple[str | None, str | None]:
    if not FB_PAGE_ACCESS_TOKEN or not FB_PAGE_ID:
        print("[WARN] Facebook not configured, skipping.")
        return None, None

    cat = CATEGORIES.get(category, CATEGORIES["tech-news"])
    emoji = cat["emoji"]
    label = cat["label"]

    # ─── Main Post ───
    hashtags = _get_hashtags(category)
    post_text = f"""{emoji} {hook}

📖 পুরো আর্টিকেল পড়ুন 👇
🔗 {blog_url}

{hashtags}"""

    try:
        resp = requests.post(
            f"{GRAPH_URL}/{FB_PAGE_ID}/feed",
            data={
                "message": post_text,
                "link": blog_url,
                "access_token": FB_PAGE_ACCESS_TOKEN,
            },
            timeout=15,
        )
        resp.raise_for_status()
        fb_post_id = resp.json().get("id")
        if not fb_post_id:
            print("[ERROR] FB post: no ID")
            return None, None
        print(f"[Facebook] ✓ Post: {fb_post_id}")
    except Exception as e:
        print(f"[ERROR] FB post: {e}")
        return None, None

    # ─── First Comment ───
    time.sleep(3)

    comment_text = f"""👉 পুরো আর্টিকেল পড়ুন: {blog_url}

📌 {bangla_title}

✅ আরো {label} টিপস পেতে পেজ ফলো করুন! 🔔"""

    fb_comment_id = None
    try:
        resp = requests.post(
            f"{GRAPH_URL}/{fb_post_id}/comments",
            data={
                "message": comment_text,
                "access_token": FB_PAGE_ACCESS_TOKEN,
            },
            timeout=15,
        )
        resp.raise_for_status()
        fb_comment_id = resp.json().get("id")
        print(f"[Facebook] ✓ Comment: {fb_comment_id}")
    except Exception as e:
        print(f"[WARN] FB comment failed: {e}")

    return fb_post_id, fb_comment_id


def _get_hashtags(category: str) -> str:
    base = "#BanglaAIHub"
    cat_tags = {
        "money-making": "#অনলাইনআয় #SideHustle #ফ্রিল্যান্সিং #OnlineIncome #আয়",
        "ai-tools": "#AITools #কৃত্রিমবুদ্ধিমত্তা #ChatGPT #AI #টেকনোলজি",
        "tech-news": "#TechNews #টেকনিউজ #Programming #Developer",
        "product-review": "#ProductReview #NewTool #SaaS #TechLaunch",
    }
    return f"{base} {cat_tags.get(category, cat_tags['tech-news'])}"
