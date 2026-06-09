"""Facebook auto-poster with photo-first captions and low-link posting."""

from __future__ import annotations

import hashlib
import re

import requests

from agents.image_finder import find_blog_image
from config import (
    CATEGORIES,
    FB_DIRECT_LINK_EVERY,
    FB_LINK_STRATEGY,
    FB_PAGE_ACCESS_TOKEN,
    FB_PAGE_ID,
    FB_POST_FIRST_COMMENT,
)

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

    include_direct_link = _should_include_direct_link(blog_url)
    image_url = image_url or _fallback_image_url(bangla_title, category)
    post_text = _build_caption(
        hook=hook,
        blog_url=blog_url,
        bangla_title=bangla_title,
        category=category,
        social_angle=social_angle,
        include_direct_link=include_direct_link,
    )

    try:
        if image_url:
            fb_post_id = _post_photo(image_url, post_text)
        else:
            fb_post_id = _post_feed(post_text, blog_url if include_direct_link else "")
        if not fb_post_id:
            print("[ERROR] FB post: no ID")
            return None, None
        print(f"[Facebook] Post: {fb_post_id}")
    except Exception as e:
        print(f"[ERROR] FB post: {e}")
        return None, None

    if not FB_POST_FIRST_COMMENT:
        return fb_post_id, None

    fb_comment_id = _post_first_comment(fb_post_id, bangla_title, blog_url, category)
    return fb_post_id, fb_comment_id


def _post_photo(image_url: str, caption: str) -> str | None:
    resp = requests.post(
        f"{GRAPH_URL}/{FB_PAGE_ID}/photos",
        data={
            "url": image_url,
            "caption": caption,
            "access_token": FB_PAGE_ACCESS_TOKEN,
        },
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("post_id") or data.get("id")


def _post_feed(message: str, blog_url: str = "") -> str | None:
    payload = {
        "message": message,
        "access_token": FB_PAGE_ACCESS_TOKEN,
    }
    if blog_url:
        payload["link"] = blog_url

    resp = requests.post(
        f"{GRAPH_URL}/{FB_PAGE_ID}/feed",
        data=payload,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("id")


def _post_first_comment(fb_post_id: str, bangla_title: str, blog_url: str, category: str) -> str | None:
    cat = CATEGORIES.get(category, CATEGORIES["tech-news"])
    comment_text = f"""পুরো আর্টিকেল: {blog_url}

{bangla_title}

আরও {cat["label"]} guide পেতে page follow করুন."""

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
        return fb_comment_id
    except Exception as e:
        print(f"[WARN] FB comment failed: {e}")
        return None


def _build_caption(
    hook: str,
    blog_url: str,
    bangla_title: str,
    category: str,
    social_angle: str,
    include_direct_link: bool,
) -> str:
    cat = CATEGORIES.get(category, CATEGORIES["tech-news"])
    title = _compact_text(bangla_title, 120)
    hook_text = _compact_text(hook, 420)
    lead = _category_lead(category)
    bullets = _category_bullets(category)
    angle = _compact_text(social_angle, 160)
    cta = _direct_cta(blog_url) if include_direct_link else _soft_cta(title)

    lines = [
        f"{cat['emoji']} {title}",
        "",
        hook_text,
        "",
        lead,
    ]

    if angle:
        lines.extend(["", f"কেন এখন matter করে: {angle}"])

    lines.extend(
        [
            "",
            "এই post save করে রাখুন, কারণ guide-এ আছে:",
            f"- {bullets[0]}",
            f"- {bullets[1]}",
            f"- {bullets[2]}",
            "",
            "আপনার workflow, skill plan বা income idea-তে এটা কাজে লাগতে পারে কি?",
            "Comment-এ আপনার use case লিখুন.",
            "",
            cta,
            "",
            _get_hashtags(category),
        ]
    )

    return "\n".join(line for line in lines if line is not None).strip()


def _direct_cta(blog_url: str) -> str:
    return f"পুরো guide পড়ুন: {blog_url}"


def _soft_cta(title: str) -> str:
    return (
        "পুরো guide পড়তে:\n"
        "1. BanglaAIHub website open করুন\n"
        f"2. Search করুন: {title}\n"
        "3. অথবা Telegram channel-এর latest update দেখুন"
    )


def _should_include_direct_link(blog_url: str) -> bool:
    strategy = FB_LINK_STRATEGY.lower()
    if strategy in {"always", "direct"}:
        return True
    if strategy in {"balanced", "rotate", "every_n"}:
        digest = int(hashlib.sha256(blog_url.encode("utf-8")).hexdigest(), 16)
        return digest % FB_DIRECT_LINK_EVERY == 0
    return False


def _fallback_image_url(title: str, category: str) -> str | None:
    try:
        image = find_blog_image(title=title, category=category)
        return image.get("url")
    except Exception as e:
        print(f"[WARN] Facebook fallback image failed: {e}")
        return None


def _compact_text(value: str, limit: int) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3].rstrip() + "..."


def _category_lead(category: str) -> str:
    leads = {
        "money-making": "Online income নিয়ে hype অনেক, কিন্তু কাজের plan দরকার. এই guide সেই practical দিকটাই ধরেছে.",
        "ai-tools": "নতুন AI tool দেখলেই signup করার আগে use case, cost আর workflow fit বোঝা জরুরি.",
        "tech-news": "Tech update useful তখনই, যখন সেটা skill, product বা client work-এ কী বদলাবে বোঝা যায়.",
        "product-review": "Tool review মানে শুধু feature list নয়. আসল প্রশ্ন হলো, এটা আপনার কাজে value দেবে কি না.",
    }
    return leads.get(category, leads["tech-news"])


def _category_bullets(category: str) -> tuple[str, str, str]:
    bullets = {
        "money-making": (
            "কোন কাজ দিয়ে শুরু করা realistic",
            "client-facing offer কীভাবে বানাবেন",
            "কোথায় risk আছে এবং কীভাবে avoid করবেন",
        ),
        "ai-tools": (
            "tool-টা কোন workflow-এ fit করে",
            "free/low-cost test করার practical way",
            "blind hype avoid করার checklist",
        ),
        "tech-news": (
            "update-টার practical impact",
            "developer/freelancerদের জন্য next step",
            "শেখার বা experiment করার angle",
        ),
        "product-review": (
            "কার জন্য tool-টা useful",
            "কোথায় limitation থাকতে পারে",
            "try করার আগে কী check করবেন",
        ),
    }
    return bullets.get(category, bullets["tech-news"])


def _get_hashtags(category: str) -> str:
    base = "#BanglaAIHub"
    cat_tags = {
        "money-making": "#OnlineIncome #Freelancing #SideHustle #Bangladesh",
        "ai-tools": "#AITools #Automation #AIProductivity #BanglaTech",
        "tech-news": "#TechNews #Programming #Developer #BanglaTech",
        "product-review": "#ProductReview #SaaS #NewTool #TechLaunch",
    }
    return f"{base} {cat_tags.get(category, cat_tags['tech-news'])}"
