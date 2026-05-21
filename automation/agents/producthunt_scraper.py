"""Product Hunt Scraper — daily top products (AI/productivity/money tools)."""

import requests
from config import PH_API_TOKEN, PH_POSTS_PER_DAY

PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"

QUERY = """
query {
  posts(order: VOTES, first: %d) {
    edges {
      node {
        id
        name
        tagline
        description
        url
        votesCount
        website
        topics {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
}
"""

RELEVANT_TOPICS = {
    "artificial intelligence", "productivity", "marketing", "saas",
    "developer tools", "fintech", "no-code", "automation", "freelance",
    "side project", "money", "income", "ai", "open source",
}


def scrape_producthunt() -> list[dict]:
    if not PH_API_TOKEN:
        print("[WARN] PH token not set, skipping.")
        return []

    headers = {
        "Authorization": f"Bearer {PH_API_TOKEN}",
        "Content-Type": "application/json",
    }
    posts = []

    try:
        resp = requests.post(
            PH_GRAPHQL_URL,
            json={"query": QUERY % (PH_POSTS_PER_DAY * 3)},
            headers=headers,
            timeout=15,
        )
        resp.raise_for_status()
        edges = resp.json().get("data", {}).get("posts", {}).get("edges", [])

        for edge in edges:
            node = edge["node"]
            topics = [
                t["node"]["name"].lower()
                for t in node.get("topics", {}).get("edges", [])
            ]
            is_relevant = any(t in RELEVANT_TOPICS for t in topics)
            if not is_relevant and node["votesCount"] < 100:
                continue

            desc = node.get("description") or node.get("tagline") or ""
            body = (
                f"Product: {node['name']}\n"
                f"Tagline: {node['tagline']}\n"
                f"Description: {desc}\n"
                f"Website: {node.get('website', 'N/A')}\n"
                f"Topics: {', '.join(topics)}\n"
                f"Votes: {node['votesCount']}"
            )
            posts.append({
                "source": "producthunt",
                "source_url": node["url"],
                "original_title": f"{node['name']} — {node['tagline']}",
                "original_body": body,
                "engagement_score": node["votesCount"],
                "topics": topics,
                "niche": "tech",
            })
    except Exception as e:
        print(f"[ERROR] Product Hunt: {e}")

    posts.sort(key=lambda x: x["engagement_score"], reverse=True)
    print(f"[PH] Total: {len(posts)} products")
    return posts[:PH_POSTS_PER_DAY]


if __name__ == "__main__":
    results = scrape_producthunt()
    for p in results[:3]:
        print(f"  [{p['engagement_score']}] {p['original_title'][:60]}")
