"""GitHub open-source scraper - finds useful free repos for content ideas."""

from datetime import datetime, timedelta, timezone
import requests
from config import AUTOMATION_USER_AGENT, GITHUB_FETCH_COUNT, GITHUB_MIN_STARS, GITHUB_TOKEN, GITHUB_TOPICS

GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"


def _headers() -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": AUTOMATION_USER_AGENT,
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def _repo_to_post(repo: dict) -> dict:
    full_name = repo.get("full_name", "")
    description = repo.get("description") or "No description provided."
    topics = repo.get("topics") or []
    language = repo.get("language") or "Mixed"
    stars = repo.get("stargazers_count", 0)
    forks = repo.get("forks_count", 0)
    license_name = ((repo.get("license") or {}).get("name")) or "Open source"
    updated_at = repo.get("updated_at", "")
    url = repo.get("html_url", "")

    body = f"""Repository: {full_name}
Description: {description}
Primary language: {language}
Stars: {stars}
Forks: {forks}
License: {license_name}
Topics: {", ".join(topics[:8])}
Last updated: {updated_at}
URL: {url}

Why it matters:
This is a free/open-source project that can help builders, freelancers, students, and small teams reduce paid SaaS/API dependency. Review practical use cases, setup effort, limits, and Bangladesh-friendly usage ideas.
"""

    return {
        "source": "github",
        "source_url": url,
        "original_title": f"{full_name}: useful open-source tool",
        "original_body": body[:5000],
        "engagement_score": stars + forks,
        "external_url": url,
        "niche": "open-source",
        "repo_name": full_name,
        "repo_language": language,
        "repo_stars": stars,
        "repo_topics": topics,
    }


def scrape_github_repos() -> list[dict]:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=365)).date().isoformat()
    seen = set()
    posts = []

    for topic in GITHUB_TOPICS:
        query = f"topic:{topic} stars:>={GITHUB_MIN_STARS} pushed:>={cutoff}"
        try:
            resp = requests.get(
                GITHUB_SEARCH_URL,
                headers=_headers(),
                params={
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": min(10, GITHUB_FETCH_COUNT),
                },
                timeout=15,
            )
            if resp.status_code == 403:
                print("[WARN] GitHub rate limited, skipping remaining topics.")
                break
            resp.raise_for_status()
            items = resp.json().get("items", [])
        except Exception as e:
            print(f"[ERROR] GitHub topic {topic}: {e}")
            continue

        for repo in items:
            full_name = repo.get("full_name")
            if not full_name or full_name in seen:
                continue
            seen.add(full_name)
            posts.append(_repo_to_post(repo))
            if len(posts) >= GITHUB_FETCH_COUNT:
                break

        if len(posts) >= GITHUB_FETCH_COUNT:
            break

    posts.sort(key=lambda x: x["engagement_score"], reverse=True)
    print(f"[GitHub] Total: {len(posts)} useful open-source repos")
    return posts[:GITHUB_FETCH_COUNT]


if __name__ == "__main__":
    for post in scrape_github_repos()[:5]:
        print(f"  [{post['repo_stars']}] {post['repo_name']}")
