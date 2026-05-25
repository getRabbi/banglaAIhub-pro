"""Find useful article images with Unsplash and safe curated fallbacks."""

from __future__ import annotations

import hashlib
import requests

from config import CONTENT_IMAGE_PROVIDER, UNSPLASH_ACCESS_KEY

UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"

FALLBACK_IMAGES = {
    "ai-tools": [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    ],
    "tech-news": [
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    ],
    "money-making": [
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80",
    ],
    "product-review": [
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    ],
}

CATEGORY_QUERY = {
    "ai-tools": "artificial intelligence software dashboard",
    "tech-news": "programming code developer workstation",
    "money-making": "freelance business finance laptop",
    "product-review": "software product interface laptop",
}


def find_blog_image(title: str, category: str, query_hint: str = "") -> dict:
    query = _image_query(title, category, query_hint)
    if CONTENT_IMAGE_PROVIDER == "unsplash" and UNSPLASH_ACCESS_KEY:
        image = _search_unsplash(query)
        if image:
            return image

    return _fallback_image(title, category, query)


def _image_query(title: str, category: str, query_hint: str) -> str:
    if query_hint:
        return query_hint[:90]
    return f"{CATEGORY_QUERY.get(category, CATEGORY_QUERY['tech-news'])} {title[:45]}".strip()


def _search_unsplash(query: str) -> dict | None:
    try:
        resp = requests.get(
            UNSPLASH_SEARCH_URL,
            headers={
                "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
                "Accept-Version": "v1",
            },
            params={
                "query": query,
                "orientation": "landscape",
                "content_filter": "high",
                "per_page": 1,
            },
            timeout=12,
        )
        resp.raise_for_status()
        results = resp.json().get("results") or []
        if not results:
            return None

        photo = results[0]
        _track_unsplash_download(photo)
        user = photo.get("user") or {}
        alt = photo.get("alt_description") or photo.get("description") or query
        return {
            "url": (photo.get("urls") or {}).get("regular"),
            "alt": f"{alt} - photo by {user.get('name', 'Unsplash')}",
            "source": (photo.get("links") or {}).get("html", ""),
        }
    except Exception as e:
        print(f"[WARN] Unsplash image lookup failed: {e}")
        return None


def _track_unsplash_download(photo: dict):
    download_location = (photo.get("links") or {}).get("download_location")
    if not download_location:
        return
    try:
        requests.get(
            download_location,
            headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
            timeout=6,
        )
    except Exception:
        pass


def _fallback_image(title: str, category: str, query: str) -> dict:
    images = FALLBACK_IMAGES.get(category, FALLBACK_IMAGES["tech-news"])
    digest = int(hashlib.md5((title + category).encode()).hexdigest(), 16)
    url = images[digest % len(images)]
    return {
        "url": url,
        "alt": f"{query} illustration",
        "source": "curated-unsplash-fallback",
    }
