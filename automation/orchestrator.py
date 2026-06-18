"""
BanglaAIHub Automation
Pipeline: Scrape sources → deduplicate → write Bangla post → publish → social post → notify.
"""

import sys
import traceback
from datetime import datetime, timedelta, timezone

from config import AUTOMATION_NAME, FB_MIN_POST_INTERVAL_HOURS, FB_POSTS_PER_RUN, POSTS_PER_RUN
from utils import get_supabase, content_hash, is_duplicate, send_telegram, detect_category
from agents import (
    scrape_reddit,
    scrape_x,
    scrape_hackernews,
    scrape_github_repos,
    scrape_producthunt,
    generate_daily_income_topic,
    rewrite_to_bangla,
    publish_to_blog,
    get_unpublished_to_fb,
    get_social_post_wait,
    mark_fb_posted,
    mark_social_posted,
    post_to_facebook,
    post_to_telegram,
    is_publishable,
    check_telegram_commands,
)

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _mark_stale_jobs(supabase) -> None:
    """Recover jobs left as running after a timeout, cancellation, or network failure."""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    try:
        supabase.table("openclaw_jobs").update(
            {
                "status": "failed",
                "completed_at": _utc_now(),
                "error_message": "Marked failed by the next automation run after stale running status.",
            }
        ).eq("status", "running").lt("started_at", cutoff).execute()
    except Exception as e:
        print(f"[WARN] Job stale cleanup skipped: {e}")


def _start_job(supabase) -> int | None:
    try:
        _mark_stale_jobs(supabase)
        result = (
            supabase.table("openclaw_jobs")
            .insert({"job_type": "content_automation", "status": "running", "started_at": _utc_now()})
            .execute()
        )
        if result.data:
            return result.data[0].get("id")
    except Exception as e:
        print(f"[WARN] Job tracking unavailable: {e}")
    return None


def _log_job(supabase, job_id: int | None, level: str, message: str, metadata: dict | None = None) -> None:
    if not job_id:
        return
    try:
        supabase.table("openclaw_job_logs").insert(
            {
                "job_id": job_id,
                "level": level,
                "message": message,
                "metadata": metadata or {},
            }
        ).execute()
    except Exception as e:
        print(f"[WARN] Job log skipped: {e}")


def _finish_job(
    supabase,
    job_id: int | None,
    stats: dict,
    status: str = "completed",
    error_message: str = "",
) -> None:
    if not job_id:
        return
    try:
        supabase.table("openclaw_jobs").update(
            {
                "status": status,
                "completed_at": _utc_now(),
                "stats": stats,
                "error_message": error_message[:500],
            }
        ).eq("id", job_id).execute()
    except Exception as e:
        print(f"[WARN] Job finish update skipped: {e}")


def _run_facebook_drip(supabase, job_id: int | None, stats: dict) -> None:
    print("\n📘 Phase 4: Pending FB...")
    try:
        if FB_POSTS_PER_RUN <= 0:
            stats["fb_skipped"] += 1
            print("  Facebook drip disabled by FB_POSTS_PER_RUN=0")
        else:
            can_post, wait_message = get_social_post_wait("facebook", FB_MIN_POST_INTERVAL_HOURS)
            if not can_post:
                stats["fb_skipped"] += 1
                print(f"  Skipped: {wait_message}")
                _log_job(supabase, job_id, "info", "Facebook drip skipped", {"reason": wait_message})
            else:
                pending_fb_posts = get_unpublished_to_fb(limit=1)
                if not pending_fb_posts:
                    print("  No pending Facebook posts.")
                for post in pending_fb_posts:
                    fb_pid, fb_cid = post_to_facebook(
                        hook=post["bangla_hook"],
                        blog_url=post["blog_url"],
                        bangla_title=post["bangla_title"],
                        category=post.get("category", "tech-news"),
                        image_url=post.get("thumbnail_url"),
                    )
                    if fb_pid:
                        mark_fb_posted(post["id"], fb_pid, fb_cid or "")
                        stats["fb_posted"] += 1
                        _log_job(
                            supabase,
                            job_id,
                            "info",
                            "Facebook drip posted",
                            {"post_id": post.get("id"), "min_interval_hours": FB_MIN_POST_INTERVAL_HOURS},
                        )
                    else:
                        stats["errors"].append(f"Facebook post failed: post_id={post.get('id')}")
                        print(f"  Facebook post failed for post_id={post.get('id')}")
                        _log_job(
                            supabase,
                            job_id,
                            "warn",
                            "Facebook drip post failed",
                            {"post_id": post.get("id"), "min_interval_hours": FB_MIN_POST_INTERVAL_HOURS},
                        )
    except Exception as e:
        print(f"  Pending error: {e}")
        stats["errors"].append(f"Pending FB: {e}")
        _log_job(supabase, job_id, "warn", "Pending Facebook posts failed", {"error": str(e)})


def run_pipeline():
    start = datetime.now()
    stats = {
        "scraped": 0, "dupes": 0, "translated": 0,
        "published": 0, "fb_posted": 0, "fb_skipped": 0, "quality_rejected": 0, "errors": [],
    }

    print("=" * 60)
    print(f"🚀 {AUTOMATION_NAME} — {start.strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)

    supabase = get_supabase()
    job_id = _start_job(supabase)
    _log_job(supabase, job_id, "info", "Automation started", {"posts_per_run": POSTS_PER_RUN})

    # ─── Phase 1: Scrape ───
    print("\n📡 Phase 1: Scraping...")
    all_posts = []
    sources = [
        ("Reddit", scrape_reddit),
        ("X/Twitter", scrape_x),
        ("Hacker News", scrape_hackernews),
        ("GitHub OSS", scrape_github_repos),
        ("Product Hunt", scrape_producthunt),
    ]

    for name, scraper in sources:
        try:
            posts = scraper()
            all_posts.extend(posts)
            print(f"  {name}: {len(posts)}")
            _log_job(supabase, job_id, "info", f"{name}: {len(posts)} posts")
        except Exception as e:
            stats["errors"].append(f"{name}: {e}")
            print(f"  {name}: ERROR — {e}")
            _log_job(supabase, job_id, "warn", f"{name} failed", {"error": str(e)})

    daily_income = generate_daily_income_topic()
    all_posts.append(daily_income)
    print("  Daily income seed: 1")

    stats["scraped"] = len(all_posts)

    if not all_posts:
        msg = f"⚠️ {AUTOMATION_NAME}: No posts scraped. Check credentials."
        print(msg)
        _run_facebook_drip(supabase, job_id, stats)
        send_telegram(msg)
        _finish_job(supabase, job_id, stats, "completed", "No posts scraped.")
        return

    # ─── Phase 2: Dedup & Select ───
    print("\n🔍 Phase 2: Dedup...")
    all_posts.sort(key=lambda x: x.get("engagement_score", 0), reverse=True)

    candidates = []
    candidate_limit = max(POSTS_PER_RUN * 4, POSTS_PER_RUN)
    for post in all_posts:
        body = post.get("original_body", post.get("original_title", ""))
        h = content_hash(body)
        if is_duplicate(supabase, h, post):
            stats["dupes"] += 1
            continue
        candidates.append(post)
        if len(candidates) >= candidate_limit:
            break

    unique = []
    money_post = next(
        (
            post
            for post in candidates
            if detect_category(post["source"], post.get("original_title", ""), post.get("original_body", "")) == "money-making"
        ),
        None,
    )
    if money_post:
        unique.append(money_post)

    for post in candidates:
        if len(unique) >= POSTS_PER_RUN:
            break
        if post is money_post:
            continue
        unique.append(post)

    print(f"  Unique: {len(unique)} | Dupes skipped: {stats['dupes']}")

    if not unique:
        _run_facebook_drip(supabase, job_id, stats)
        send_telegram(f"ℹ️ {AUTOMATION_NAME}: All dupes, no new content.")
        _finish_job(supabase, job_id, stats, "completed", "All candidates were duplicates.")
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
                _log_job(supabase, job_id, "warn", "Translate failed", {"title": post["original_title"][:120]})
                continue
            stats["translated"] += 1
        except Exception as e:
            stats["errors"].append(f"Translate: {e}")
            _log_job(supabase, job_id, "warn", "Translate exception", {"error": str(e)})
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
            _log_job(supabase, job_id, "warn", "Quality rejected", {"grade": grade, "reasons": quality["reasons"][:3]})
            continue

        # Publish
        try:
            published = publish_to_blog(original=post, bangla=bangla)
            if not published:
                stats["errors"].append(f"Publish fail: {bangla['bangla_title'][:30]}")
                _log_job(supabase, job_id, "warn", "Publish failed", {"title": bangla["bangla_title"][:120]})
                continue
            stats["published"] += 1
            _log_job(supabase, job_id, "info", "Post published", {"slug": published.get("blog_slug"), "title": bangla["bangla_title"][:120]})
        except Exception as e:
            stats["errors"].append(f"Publish: {e}")
            _log_job(supabase, job_id, "error", "Publish exception", {"error": str(e)})
            continue

        _log_job(
            supabase,
            job_id,
            "info",
            "Facebook post queued for drip scheduler",
            {"post_id": published.get("id")},
        )

        try:
            tg_id = post_to_telegram(
                hook=bangla["bangla_hook"],
                blog_url=published["blog_url"],
                bangla_title=bangla["bangla_title"],
                category=published.get("category", "tech-news"),
                image_url=published.get("thumbnail_url"),
            )
            if tg_id:
                mark_social_posted(published["id"], "telegram", tg_id)
                _log_job(supabase, job_id, "info", "Telegram posted", {"post_id": published.get("id")})
        except Exception as e:
            stats["errors"].append(f"Telegram post: {e}")
            _log_job(supabase, job_id, "warn", "Telegram post failed", {"error": str(e)})

    # ─── Phase 4: Pending FB posts ───
    _run_facebook_drip(supabase, job_id, stats)

    # ─── Report ───
    elapsed = (datetime.now() - start).total_seconds()
    report = f"""
✅ <b>{AUTOMATION_NAME} — Complete</b>
⏱ {elapsed:.0f}s

📊 Scraped: {stats['scraped']}
🔁 Dupes: {stats['dupes']}
✍️ Translated: {stats['translated']}
🏆 Quality rejected: {stats['quality_rejected']}
📝 Published: {stats['published']}
📘 FB posted: {stats['fb_posted']}
⏳ FB skipped: {stats['fb_skipped']}
❌ Errors: {len(stats['errors'])}
"""
    if stats["errors"]:
        report += "\n⚠️ <b>Errors:</b>\n" + "\n".join(f"• {e}" for e in stats["errors"][:5])

    print(report)
    send_telegram(report)
    _finish_job(supabase, job_id, stats, "completed")

    # ─── Phase 5: Check Telegram admin commands ───
    try:
        check_telegram_commands()
    except Exception:
        pass


if __name__ == "__main__":
    try:
        run_pipeline()
    except Exception:
        err = f"💥 {AUTOMATION_NAME} CRITICAL:\n{traceback.format_exc()}"
        print(err)
        send_telegram(err)
        sys.exit(1)
