"""
OpenClaw v4 — Orchestrator
Pipeline: Scrape (Reddit+X+HN+PH) → Dedup → Translate → Blog → Facebook → Notify
"""

import sys
import traceback
from datetime import datetime

from config import POSTS_PER_RUN
from utils import get_supabase, content_hash, is_duplicate, send_telegram, detect_category
from agents import (
    scrape_reddit,
    scrape_x,
    scrape_hackernews,
    scrape_producthunt,
    rewrite_to_bangla,
    publish_to_blog,
    get_unpublished_to_fb,
    mark_fb_posted,
    post_to_facebook,
    is_publishable,
    check_telegram_commands,
)

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def run_pipeline():
    start = datetime.now()
    stats = {
        "scraped": 0, "dupes": 0, "translated": 0,
        "published": 0, "fb_posted": 0, "quality_rejected": 0, "errors": [],
    }

    print("=" * 60)
    print(f"🚀 OpenClaw v4 — {start.strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)

    supabase = get_supabase()

    # ─── Phase 1: Scrape ───
    print("\n📡 Phase 1: Scraping...")
    all_posts = []
    sources = [
        ("Reddit", scrape_reddit),
        ("X/Twitter", scrape_x),
        ("Hacker News", scrape_hackernews),
        ("Product Hunt", scrape_producthunt),
    ]

    for name, scraper in sources:
        try:
            posts = scraper()
            all_posts.extend(posts)
            print(f"  {name}: {len(posts)}")
        except Exception as e:
            stats["errors"].append(f"{name}: {e}")
            print(f"  {name}: ERROR — {e}")

    stats["scraped"] = len(all_posts)

    if not all_posts:
        msg = "⚠️ OpenClaw v4: No posts scraped. Check credentials."
        print(msg)
        send_telegram(msg)
        return

    # ─── Phase 2: Dedup & Select ───
    print("\n🔍 Phase 2: Dedup...")
    all_posts.sort(key=lambda x: x.get("engagement_score", 0), reverse=True)

    unique = []
    for post in all_posts:
        body = post.get("original_body", post.get("original_title", ""))
        h = content_hash(body)
        if is_duplicate(supabase, h, post):
            stats["dupes"] += 1
            continue
        unique.append(post)
        if len(unique) >= POSTS_PER_RUN:
            break

    print(f"  Unique: {len(unique)} | Dupes skipped: {stats['dupes']}")

    if not unique:
        send_telegram("ℹ️ OpenClaw v4: All dupes, no new content.")
        return

    # ─── Phase 3: Translate + Publish + FB ───
    print("\n✍️ Phase 3: Process...")

    for i, post in enumerate(unique, 1):
        print(f"\n  [{i}/{len(unique)}] {post['original_title'][:50]}...")

        category = detect_category(
            post["source"],
            post.get("original_title", ""),
            post.get("original_body", ""),
        )

        # Translate
        try:
            bangla = rewrite_to_bangla(
                title=post["original_title"],
                body=post.get("original_body", ""),
                source=post["source"],
                category=category,
            )
            if not bangla:
                stats["errors"].append(f"Translate fail: {post['original_title'][:30]}")
                continue
            stats["translated"] += 1
        except Exception as e:
            stats["errors"].append(f"Translate: {e}")
            continue

        # Quality gate
        publishable, quality = is_publishable(bangla)
        grade = quality["grade"]
        qscore = quality["score"]
        print(f"    Quality: {grade} ({qscore}/100)")
        if not publishable:
            stats["quality_rejected"] += 1
            reasons = ", ".join(quality["reasons"][:3])
            print(f"    ❌ Rejected: {reasons}")
            stats["errors"].append(f"Quality reject ({grade}): {bangla['bangla_title'][:25]}")
            continue

        # Publish
        try:
            published = publish_to_blog(original=post, bangla=bangla)
            if not published:
                stats["errors"].append(f"Publish fail: {bangla['bangla_title'][:30]}")
                continue
            stats["published"] += 1
        except Exception as e:
            stats["errors"].append(f"Publish: {e}")
            continue

        # Facebook
        try:
            fb_pid, fb_cid = post_to_facebook(
                hook=bangla["bangla_hook"],
                blog_url=published["blog_url"],
                bangla_title=bangla["bangla_title"],
                category=published.get("category", "tech-news"),
            )
            if fb_pid:
                mark_fb_posted(published["id"], fb_pid, fb_cid or "")
                stats["fb_posted"] += 1
        except Exception as e:
            stats["errors"].append(f"FB: {e}")

    # ─── Phase 4: Pending FB posts ───
    print("\n📘 Phase 4: Pending FB...")
    try:
        for post in get_unpublished_to_fb()[:2]:
            fb_pid, fb_cid = post_to_facebook(
                hook=post["bangla_hook"],
                blog_url=post["blog_url"],
                bangla_title=post["bangla_title"],
                category=post.get("category", "tech-news"),
            )
            if fb_pid:
                mark_fb_posted(post["id"], fb_pid, fb_cid or "")
                stats["fb_posted"] += 1
    except Exception as e:
        print(f"  Pending error: {e}")

    # ─── Report ───
    elapsed = (datetime.now() - start).total_seconds()
    report = f"""
✅ <b>OpenClaw v4 — Complete</b>
⏱ {elapsed:.0f}s

📊 Scraped: {stats['scraped']}
🔁 Dupes: {stats['dupes']}
✍️ Translated: {stats['translated']}
🏆 Quality rejected: {stats['quality_rejected']}
📝 Published: {stats['published']}
📘 FB posted: {stats['fb_posted']}
❌ Errors: {len(stats['errors'])}
"""
    if stats["errors"]:
        report += "\n⚠️ <b>Errors:</b>\n" + "\n".join(f"• {e}" for e in stats["errors"][:5])

    print(report)
    send_telegram(report)

    # ─── Phase 5: Check Telegram admin commands ───
    try:
        check_telegram_commands()
    except Exception:
        pass


if __name__ == "__main__":
    try:
        run_pipeline()
    except Exception:
        err = f"💥 OpenClaw v4 CRITICAL:\n{traceback.format_exc()}"
        print(err)
        send_telegram(err)
        sys.exit(1)
