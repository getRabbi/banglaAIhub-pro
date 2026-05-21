"""X / Twitter Scraper — searches both money-making and AI/tech tweets."""

import requests
from config import (
    X_BEARER_TOKEN,
    X_KEYWORDS_MONEY,
    X_KEYWORDS_TECH,
    X_MIN_LIKES,
    X_MAX_RESULTS,
)

SEARCH_URL = "https://api.twitter.com/2/tweets/search/recent"


def _search_tweets(keywords: list[str], niche: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {X_BEARER_TOKEN}"}
    keyword_parts = [f'"{kw}"' for kw in keywords[:5]]
    query = f"({' OR '.join(keyword_parts)}) -is:retweet -is:reply lang:en"

    params = {
        "query": query,
        "max_results": min(X_MAX_RESULTS, 100),
        "tweet.fields": "public_metrics,created_at,author_id,text",
        "expansions": "author_id",
        "user.fields": "username,name",
        "sort_order": "relevancy",
    }

    posts = []
    try:
        resp = requests.get(SEARCH_URL, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        authors = {}
        for user in data.get("includes", {}).get("users", []):
            authors[user["id"]] = user.get("username", "unknown")

        for tweet in data.get("data", []):
            metrics = tweet.get("public_metrics", {})
            likes = metrics.get("like_count", 0)
            if likes < X_MIN_LIKES or len(tweet["text"]) < 80:
                continue

            username = authors.get(tweet["author_id"], "unknown")
            posts.append({
                "source": "x",
                "source_url": f"https://x.com/{username}/status/{tweet['id']}",
                "original_title": f"@{username}: {tweet['text'][:100]}",
                "original_body": tweet["text"],
                "engagement_score": likes + metrics.get("retweet_count", 0) * 2,
                "author": username,
                "niche": niche,
            })
    except Exception as e:
        print(f"[ERROR] X ({niche}): {e}")

    return posts


def scrape_x() -> list[dict]:
    if not X_BEARER_TOKEN:
        print("[WARN] X Bearer Token not set, skipping.")
        return []

    money_posts = _search_tweets(X_KEYWORDS_MONEY, "money")
    tech_posts = _search_tweets(X_KEYWORDS_TECH, "tech")
    all_posts = money_posts + tech_posts
    all_posts.sort(key=lambda x: x["engagement_score"], reverse=True)
    print(f"[X] Total: {len(all_posts)} tweets (money={len(money_posts)}, tech={len(tech_posts)})")
    return all_posts[:15]


if __name__ == "__main__":
    results = scrape_x()
    for p in results[:3]:
        print(f"  [{p['engagement_score']}] {p['original_title'][:60]}")
