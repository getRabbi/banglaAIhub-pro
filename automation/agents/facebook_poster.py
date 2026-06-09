"""Facebook auto-poster with stronger article captions."""

import time
import requests

from config import FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID, FB_POST_FIRST_COMMENT, CATEGORIES

GRAPH_URL = "https://graph.facebook.com/v19.0"


def post_to_facebook(
    hook: str,
    blog_url: str,
    bangla_title: str,
    category: str = "tech-news",
    image_url: str | None = None,
    social_angle: str = "",
) -> tuple[str | None, str | None]:
    if not FB_PAGE_ACCESS_TOKEN or not FB_PAGE_ID:
        print("[WARN] Facebook not configured, skipping.")
        return None, None

    cat = CATEGORIES.get(category, CATEGORIES["tech-news"])
    hashtags = _get_hashtags(category)
    angle = f"\n\n📌 Angle: {social_angle}" if social_angle else ""

    post_text = f"""{cat["emoji"]} {hook}{angle}

📖 পুরো গাইড পড়ুন 👇
🔗 {blog_url}

আপনার workflow, skill বা income plan-এ এটা কাজে লাগতে পারে কি? Comment করুন।

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
        print(f"[Facebook] Post: {fb_post_id}")
    except Exception as e:
        print(f"[ERROR] FB post: {e}")
        return None, None

    if not FB_POST_FIRST_COMMENT:
        return fb_post_id, None

    time.sleep(3)
    comment_text = f"""👉 পুরো আর্টিকেল: {blog_url}

📌 {bangla_title}

✅ আরও {cat["label"]} guide পেতে পেজ follow করুন।"""

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
        print(f"[Facebook] Comment: {fb_comment_id}")
    except Exception as e:
        print(f"[WARN] FB comment failed: {e}")

    return fb_post_id, fb_comment_id


def _get_hashtags(category: str) -> str:
    base = "#BanglaAIHub"
    cat_tags = {
        "money-making": "#OnlineIncome #Freelancing #SideHustle #Bangladesh",
        "ai-tools": "#AITools #Automation #AIProductivity #BanglaTech",
        "tech-news": "#TechNews #Programming #Developer #BanglaTech",
        "product-review": "#ProductReview #SaaS #NewTool #TechLaunch",
    }
    return f"{base} {cat_tags.get(category, cat_tags['tech-news'])}"
