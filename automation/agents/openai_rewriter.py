"""OpenAI Bangla Rewriter — category-aware translation + hook + related keywords.
Uses OpenAI API (gpt-4o-mini / gpt-4o) instead of Gemini.
"""

import json
import time
import requests
from config import OPENAI_API_KEY, OPENAI_MODEL

OPENAI_URL = "https://api.openai.com/v1/chat/completions"
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

SYSTEM_PROMPT = """তুমি একজন expert Bangla content writer এবং SEO specialist। তোমার কাজ হলো English content কে Bangla তে rewrite করা — শুধু translate না, পুরো natural Bangla blog post বানানো।

তোমাকে JSON format এ return করতে হবে:

1. "bangla_title": SEO-friendly Bangla title (catchy, click-worthy, 50-70 chars)
2. "bangla_body": Full blog post in Bangla (1500-2500 words)
   - শুরুতে একটা engaging intro paragraph
   - Proper headings (## format) — minimum 3-4 sections
   - Practical tips এবং actionable advice
   - Bangladesh context add করো (bKash, Nagad, BD freelancing platforms, local examples)
   - Bold important points **এভাবে**
   - শেষে "উপসংহার" section with key takeaways
   - Engaging, conversational tone — "আপনি" ব্যবহার করো
3. "bangla_hook": Facebook hook — ২-৩ লাইনের engaging teaser
   - Curiosity gap রাখবে — full info দেবে না
   - Emoji use করো (🔥💰🚀 etc.)
   - Question দিয়ে শুরু করো if possible
   - Example: "🔥 আপনি কি জানেন ঘরে বসে প্রতিদিন ৫০০-১০০০ টাকা আয় করা সম্ভব? একটা সিম্পল method আছে যেটা..."
4. "meta_description": SEO meta description in Bangla (120-155 chars)
5. "related_keywords": Array of 5-8 related Bangla search keywords for internal linking

IMPORTANT:
- Response MUST be valid JSON only — no markdown backticks, no extra text
- Content should feel ORIGINAL, not a translation
- Make it practical for Bangladeshi audience
- Use simple, conversational Bangla"""


def rewrite_to_bangla(title: str, body: str, source: str, category: str = "") -> dict | None:
    """Rewrite English content to Bangla blog post + hook using OpenAI."""
    if not OPENAI_API_KEY:
        print("[ERROR] OpenAI API key not set!")
        return None

    category_hint = ""
    if category == "money-making":
        category_hint = "এটা অনলাইন আয়/money making related content। Bangladesh এর context এ practical tips দাও।"
    elif category == "ai-tools":
        category_hint = "এটা AI tools related content। Tool এর features, use cases, এবং কিভাবে Bangladeshi users ব্যবহার করতে পারবে সেটা বলো।"
    elif category == "product-review":
        category_hint = "এটা একটা নতুন product/tool review। Features, pricing, pros/cons cover করো।"
    else:
        category_hint = "এটা tech/programming related content।"

    user_prompt = f"""Category: {category}
{category_hint}

Source: {source}
Original Title: {title}

Original Content:
{body[:4500]}

এই content টা Bangla তে rewrite করো। JSON format এ return করো:
{{"bangla_title": "...", "bangla_body": "...", "bangla_hook": "...", "meta_description": "...", "related_keywords": [...]}}"""

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.8,
        "max_tokens": 4096,
        "response_format": {"type": "json_object"},
    }

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(
                OPENAI_URL,
                headers=headers,
                json=payload,
                timeout=120,
            )

            # Rate limit — wait and retry
            if resp.status_code == 429:
                retry_after = int(resp.headers.get("Retry-After", RETRY_DELAY * attempt))
                print(f"[OpenAI] Rate limited, retrying in {retry_after}s (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(retry_after)
                continue

            # Server error — retry
            if resp.status_code >= 500:
                print(f"[OpenAI] Server error {resp.status_code}, retrying (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY * attempt)
                continue

            resp.raise_for_status()
            data = resp.json()

            # Extract content
            choices = data.get("choices", [])
            if not choices:
                print(f"[WARN] OpenAI returned no choices (attempt {attempt})")
                time.sleep(RETRY_DELAY)
                continue

            message = choices[0].get("message", {})
            text = message.get("content", "").strip()

            # Check for refusal
            refusal = message.get("refusal")
            if refusal:
                print(f"[WARN] OpenAI refused: {refusal}")
                return None

            # Clean markdown fences if present despite response_format
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0]

            result = json.loads(text.strip())

            # Validate required fields
            required = ["bangla_title", "bangla_body", "bangla_hook"]
            for field in required:
                if field not in result or not result[field]:
                    print(f"[ERROR] OpenAI missing field: {field}")
                    return None

            # Defaults for optional fields
            result.setdefault("meta_description", result["bangla_hook"][:155])
            result.setdefault("related_keywords", [])

            # Log token usage
            usage = data.get("usage", {})
            total_tokens = usage.get("total_tokens", 0)
            print(f"[OpenAI] ✓ {result['bangla_title'][:50]} ({total_tokens} tokens)")

            return result

        except json.JSONDecodeError as e:
            print(f"[ERROR] OpenAI JSON parse (attempt {attempt}): {e}")
            last_error = e
            time.sleep(RETRY_DELAY)
        except requests.exceptions.Timeout:
            print(f"[ERROR] OpenAI timeout (attempt {attempt})")
            last_error = "Timeout"
            time.sleep(RETRY_DELAY * attempt)
        except Exception as e:
            print(f"[ERROR] OpenAI API (attempt {attempt}): {e}")
            last_error = e
            time.sleep(RETRY_DELAY)

    print(f"[ERROR] OpenAI failed after {MAX_RETRIES} attempts: {last_error}")
    return None


if __name__ == "__main__":
    test = rewrite_to_bangla(
        title="How I Made $500/month with a Simple Side Hustle",
        body="I started selling digital templates on Etsy. First month was slow but by month 3 I was making consistent sales. Here are my tips: 1. Research trending niches 2. Use Canva for design 3. Price competitively 4. Promote on Pinterest.",
        source="reddit",
        category="money-making",
    )
    if test:
        print(f"Title: {test['bangla_title']}")
        print(f"Hook: {test['bangla_hook']}")
        print(f"Body length: {len(test['bangla_body'])} chars")
