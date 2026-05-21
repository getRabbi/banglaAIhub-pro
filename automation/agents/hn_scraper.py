"""Hacker News Scraper — fetches top stories, filters by relevance."""

import requests
from config import (
    HN_TOP_STORIES_URL,
    HN_ITEM_URL,
    HN_MIN_SCORE,
    HN_FETCH_COUNT,
    HN_RELEVANT_KEYWORDS,
)


def _is_relevant(title: str, url: str = "") -> bool:
    text = (title + " " + url).lower()
    return any(kw in text for kw in HN_RELEVANT_KEYWORDS)


def _fetch_item(item_id: int) -> dict | None:
    try:
        resp = requests.get(HN_ITEM_URL.format(item_id), timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return None


def _fetch_article_body(url: str, title: str) -> str:
    """Try to fetch article body from URL for richer content."""
    try:
        resp = requests.get(
            url,
            timeout=10,
            headers={"User-Agent": "OpenClaw/3.0 (content aggregator)"},
        )
        resp.raise_for_status()
        # Extract text between <p> tags (simple extraction)
        import re
        paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", resp.text, re.DOTALL | re.IGNORECASE)
        # Clean HTML tags from paragraphs
        clean = []
        for p in paragraphs[:10]:
            text = re.sub(r"<[^>]+>", "", p).strip()
            if len(text) > 50:
                clean.append(text)
        if clean:
            return f"{title}\n\n" + "\n\n".join(clean[:5])
    except Exception:
        pass
    return f"{title}\n\nSource: {url}"


def scrape_hackernews() -> list[dict]:
    posts = []
    try:
        resp = requests.get(HN_TOP_STORIES_URL, timeout=10)
        resp.raise_for_status()
        story_ids = resp.json()[:HN_FETCH_COUNT]
    except Exception as e:
        print(f"[ERROR] HN top stories: {e}")
        return []

    for sid in story_ids:
        item = _fetch_item(sid)
        if not item or item.get("type") != "story":
            continue
        if (item.get("score", 0) < HN_MIN_SCORE):
            continue

        title = item.get("title", "")
        url = item.get("url", "")

        if not _is_relevant(title, url):
            continue

        # For HN, body is often a URL. We'll fetch the title + any text
        hn_text = item.get("text", "")
        if hn_text:
            body = hn_text
        elif url:
            body = _fetch_article_body(url, title)
        else:
            body = title
        hn_url = f"https://news.ycombinator.com/item?id={sid}"

        posts.append({
            "source": "hackernews",
            "source_url": hn_url,
            "original_title": title,
            "original_body": body[:5000],
            "engagement_score": item.get("score", 0),
            "external_url": url,
            "niche": "tech",
        })

    posts.sort(key=lambda x: x["engagement_score"], reverse=True)
    print(f"[HN] Total: {len(posts)} relevant stories")
    return posts[:10]


if __name__ == "__main__":
    results = scrape_hackernews()
    for p in results[:5]:
        print(f"  [{p['engagement_score']}] {p['original_title'][:60]}")
