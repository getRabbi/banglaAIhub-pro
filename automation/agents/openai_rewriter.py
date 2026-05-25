"""OpenAI Bangla Rewriter — category-aware translation + hook + related keywords.
Uses OpenAI API (gpt-4o-mini / gpt-4o) instead of Gemini.
"""

import json
import time
import requests
from config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL, REWRITE_PROVIDER

OPENAI_URL = OPENAI_BASE_URL
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

def _extract_line(body: str, label: str) -> str:
    prefix = f"{label}:"
    for line in body.splitlines():
        if line.lower().startswith(prefix.lower()):
            return line.split(":", 1)[1].strip()
    return ""


def _template_rewrite_to_bangla(title: str, body: str, source: str, category: str = "") -> dict:
    """Cost-free fallback writer for open-source/tool discovery posts."""
    repo = _extract_line(body, "Repository") or title.replace(": useful open-source tool", "")
    description = _extract_line(body, "Description") or title
    language = _extract_line(body, "Primary language") or "Mixed"
    stars = _extract_line(body, "Stars") or "N/A"
    license_name = _extract_line(body, "License") or "Open source"
    topics = _extract_line(body, "Topics") or "open source, AI, automation"
    url = _extract_line(body, "URL")

    if source == "github":
        bangla_title = f"{repo}: ফ্রি ওপেন-সোর্স টুল কেন কাজে লাগতে পারে?"
        hook = (
            f"🔥 পেইড টুলের খরচ কমাতে চান? {repo} একটি ওপেন-সোর্স প্রজেক্ট, "
            "যেটা ডেভেলপার, ফ্রিল্যান্সার এবং ছোট টিমের জন্য বাস্তব কাজে লাগতে পারে।"
        )
    else:
        bangla_title = f"{title}: কী জানা দরকার?"
        hook = f"🔥 {title} নিয়ে দ্রুত কিন্তু ব্যবহারযোগ্য বিশ্লেষণ চান? এখানে মূল বিষয়গুলো সহজ বাংলায় দেওয়া হলো।"

    body_bn = f"""আপনি যদি নিয়মিত AI টুল, অটোমেশন বা ডেভেলপার প্রোডাক্ট নিয়ে কাজ করেন, তাহলে শুধু পেইড API বা SaaS-এর উপর নির্ভর করা সব সময় ভালো কৌশল নয়। অনেক সময় একটি ভালো **ওপেন-সোর্স রিপোজিটরি** একই ধরনের কাজ কম খরচে, বেশি নিয়ন্ত্রণে এবং নিজের প্রয়োজন অনুযায়ী কাস্টমাইজ করে করতে সাহায্য করে। আজকের আলোচনার বিষয় হলো **{repo}**।

এই প্রজেক্টের সংক্ষিপ্ত বিবরণ: {description}। প্রাইমারি ভাষা: {language}। GitHub stars: {stars}। লাইসেন্স: {license_name}। সম্পর্কিত টপিক: {topics}।

## কেন এই প্রজেক্ট গুরুত্বপূর্ণ

প্রথম কারণ হলো খরচ। ছোট ব্যবসা, কনটেন্ট টিম, ছাত্র বা ফ্রিল্যান্সারদের জন্য প্রতি মাসে একাধিক paid subscription রাখা কঠিন। ওপেন-সোর্স টুল ব্যবহার করলে আপনি অনেক ক্ষেত্রে নিজের সার্ভার, লোকাল মেশিন বা কম খরচের VPS-এ workflow চালাতে পারেন। এতে শুধু টাকা বাঁচে না, data ownership-ও আপনার হাতে থাকে।

দ্বিতীয় কারণ হলো শেখার সুযোগ। একটি ভালো repository শুধু ব্যবহার করার জিনিস নয়; এটি শেখারও জিনিস। কোড কীভাবে structured, issue কীভাবে manage হচ্ছে, community কীভাবে feature discuss করছে - এগুলো দেখলে একজন developer দ্রুত বাস্তব software engineering skill তৈরি করতে পারে। বাংলাদেশি শিক্ষার্থী বা junior developer-দের জন্য এটা খুবই practical learning path।

## কীভাবে ব্যবহার শুরু করবেন

প্রথমে repository-এর README পড়ুন। installation command, required dependency, example configuration এবং known limitations খেয়াল করুন। তারপর ছোট একটি test project বানিয়ে দেখুন। production কাজের আগে local setup, sample data, error handling এবং update frequency যাচাই করা জরুরি।

যদি project-টি AI বা automation related হয়, তাহলে API key কোথায় লাগছে, local model support আছে কিনা, Docker support আছে কিনা এবং self-host করা যায় কিনা দেখুন। self-hosting থাকলে long-term cost অনেক কমে যেতে পারে। তবে server maintenance, security update এবং backup plan রাখতে হবে।

## বাংলাদেশি ব্যবহারকারীদের জন্য ব্যবহারিক আইডিয়া

ফ্রিল্যান্সাররা client demo বানাতে এমন repo ব্যবহার করতে পারেন। ধরুন আপনি AI chatbot, document search, workflow automation বা content dashboard বানাচ্ছেন - শুরুতে paid tool না কিনে ওপেন-সোর্স ভিত্তিতে prototype বানালে client বুঝতে পারে solution-এর value কী। পরে প্রয়োজন হলে premium API বা managed service যুক্ত করা যায়।

ছোট agency বা startup-ও একইভাবে cost control করতে পারে। basic automation, internal dashboard, analytics, scraping, content planning বা knowledge base-এর জন্য open-source stack ব্যবহার করলে monthly recurring cost কমে। তবে client-facing product হলে reliability, monitoring এবং security অবশ্যই professionalভাবে handle করতে হবে।

## কী কী সীমাবদ্ধতা মাথায় রাখবেন

ওপেন-সোর্স মানেই সবসময় free lunch নয়। অনেক repo experimental হতে পারে, documentation অসম্পূর্ণ হতে পারে, বা maintainer কম active হতে পারে। তাই star count দেখলেই সিদ্ধান্ত নেওয়া ঠিক নয়। শেষ commit কবে হয়েছে, issue response কেমন, security policy আছে কিনা, license commercial use allow করে কিনা - এগুলো যাচাই করতে হবে।

আরেকটি বিষয় হলো support। paid SaaS-এ support team থাকে, কিন্তু open-source project-এ আপনাকে community issue, discussion বা নিজের debugging-এর উপর নির্ভর করতে হতে পারে। তাই mission-critical workflow হলে আগে staging environment-এ test করুন।

## খরচ কমানোর কৌশল

সব জায়গায় OpenAI API ব্যবহার না করে hybrid approach নেওয়া যায়। simple summary, tagging, categorization বা draft outline-এর জন্য template/rule-based automation ব্যবহার করুন। high-value final writing, complex reasoning বা client deliverable-এর জন্য paid model ব্যবহার করুন। এতে quality বজায় থাকে, কিন্তু token cost কমে।

একইভাবে GitHub, Hacker News, Product Hunt, Reddit, documentation এবং community discussion থেকে idea source broad করলে content pipeline এক company বা এক API-এর উপর আটকে থাকে না। এই ধরনের source mix website-কে বেশি resilient করে।

## উপসংহার

**{repo}** এমন একটি প্রজেক্ট যেটা আপনার workflow-এ কাজে লাগতে পারে, বিশেষ করে যদি আপনি free/open-source option দিয়ে শুরু করতে চান। সরাসরি production-এ নেওয়ার আগে README, license, issue activity এবং setup complexity যাচাই করুন। ভালোভাবে test করলে ওপেন-সোর্স টুল আপনার শেখা, prototype, client demo এবং cost control - সব জায়গায় বড় সুবিধা দিতে পারে।

রিপোজিটরি: {url or "GitHub source link দেখুন"}"""

    return {
        "bangla_title": bangla_title[:90],
        "bangla_body": body_bn,
        "bangla_hook": hook,
        "meta_description": f"{repo} ওপেন-সোর্স টুল নিয়ে সহজ Bangla বিশ্লেষণ, ব্যবহার, সীমাবদ্ধতা ও খরচ কমানোর কৌশল।"[:155],
        "related_keywords": [
            "ওপেন সোর্স টুল",
            "ফ্রি AI টুল",
            "GitHub repository",
            "developer tools",
            "automation workflow",
            "self hosted tool",
        ],
    }


def rewrite_to_bangla(title: str, body: str, source: str, category: str = "") -> dict | None:
    """Rewrite English content to Bangla blog post + hook using OpenAI."""
    if REWRITE_PROVIDER in {"template", "fallback", "free"}:
        print("[Writer] Using free template writer.")
        return _template_rewrite_to_bangla(title, body, source, category)

    if not OPENAI_API_KEY:
        print("[WARN] OpenAI API key not set, using free template writer.")
        return _template_rewrite_to_bangla(title, body, source, category)

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
                if REWRITE_PROVIDER == "auto":
                    print("[WARN] OpenAI rate limited, using free template writer.")
                    return _template_rewrite_to_bangla(title, body, source, category)
                retry_after = int(resp.headers.get("Retry-After", RETRY_DELAY * attempt))
                print(f"[OpenAI] Rate limited, retrying in {retry_after}s (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(retry_after)
                continue

            if resp.status_code in {401, 403} and REWRITE_PROVIDER == "auto":
                print(f"[WARN] OpenAI auth failed ({resp.status_code}), using free template writer.")
                return _template_rewrite_to_bangla(title, body, source, category)

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

    if REWRITE_PROVIDER == "auto":
        print(f"[WARN] OpenAI failed after {MAX_RETRIES} attempts, using free template writer: {last_error}")
        return _template_rewrite_to_bangla(title, body, source, category)

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
