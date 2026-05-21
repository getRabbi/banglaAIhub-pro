"""Reddit Scraper — supports both money-making and tech/AI subreddits."""

import praw
from config import (
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_USER_AGENT,
    REDDIT_SUBREDDITS_MONEY,
    REDDIT_SUBREDDITS_TECH,
    REDDIT_MIN_UPVOTES,
    REDDIT_POSTS_PER_SUB,
    REDDIT_TIME_FILTER,
)


def scrape_reddit() -> list[dict]:
    if not REDDIT_CLIENT_ID or not REDDIT_CLIENT_SECRET:
        print("[WARN] Reddit credentials not set, skipping.")
        return []

    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT,
    )

    all_subs = REDDIT_SUBREDDITS_MONEY + REDDIT_SUBREDDITS_TECH
    posts = []

    for sub_name in all_subs:
        try:
            subreddit = reddit.subreddit(sub_name)
            for post in subreddit.top(
                time_filter=REDDIT_TIME_FILTER,
                limit=REDDIT_POSTS_PER_SUB * 2,
            ):
                if post.score < REDDIT_MIN_UPVOTES:
                    continue
                if not post.is_self or len(post.selftext or "") < 100:
                    continue

                niche = (
                    "money" if sub_name in REDDIT_SUBREDDITS_MONEY else "tech"
                )
                posts.append({
                    "source": "reddit",
                    "source_url": f"https://reddit.com{post.permalink}",
                    "original_title": post.title,
                    "original_body": post.selftext[:5000],
                    "engagement_score": post.score,
                    "subreddit": sub_name,
                    "niche": niche,
                })
            print(f"[Reddit] r/{sub_name} ✓")
        except Exception as e:
            print(f"[ERROR] Reddit r/{sub_name}: {e}")

    posts.sort(key=lambda x: x["engagement_score"], reverse=True)
    print(f"[Reddit] Total: {len(posts)} posts")
    return posts[:20]


if __name__ == "__main__":
    results = scrape_reddit()
    for p in results[:3]:
        print(f"  [{p['engagement_score']}] {p['original_title'][:60]}")
