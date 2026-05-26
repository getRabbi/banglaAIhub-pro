"""SEO-focused Bangla writer with OpenAI first and a strong free fallback."""

import json
import re
import time
import requests

from config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL, REWRITE_PROVIDER

OPENAI_URL = OPENAI_BASE_URL
MAX_RETRIES = 3
RETRY_DELAY = 5

SYSTEM_PROMPT = """তুমি BanglaAIHub-এর senior editor, SEO strategist এবং social media copywriter।
তোমার কাজ English source থেকে এমন Bangla article বানানো যেটা useful, modern, search-friendly এবং social share-worthy।

Return valid JSON only with these keys:
{
  "bangla_title": "SEO title, 45-75 chars, clear benefit",
  "bangla_body": "900-1600 word Bangla article using ## headings, bullets, practical examples, Bangladesh context, FAQ",
  "bangla_hook": "2-3 line social hook with curiosity and clear benefit",
  "meta_description": "120-155 char Bangla meta description",
  "related_keywords": ["5-8 search keywords"],
  "image_query": "short English image search query",
  "social_angle": "one-line social positioning"
}

Editorial rules:
- Do not write generic filler. Explain who should care, why now, how to use it, risks, and next steps.
- Make it useful for Bangladeshi freelancers, founders, students, developers, creators, and small teams.
- Keep claims grounded in the source. Do not invent pricing, features, or guarantees.
- Use a confident but not spammy tone. Hype is allowed only when backed by a practical reason.
- Include a quick answer section, actionable checklist, limitations, and FAQ.
- Use **bold** for key terms and `##` headings.
- Avoid wall-of-text: keep paragraphs short, add blank lines between sections, and use bullets when listing steps.
- Include one compact markdown table when it helps compare tools, use cases, risks, or action steps.
- Add internal-style section labels such as "Quick answer", "কীভাবে শুরু করবেন", "সুবিধা/ঝুঁকি", and "FAQ" so the web renderer can build a readable article.
"""


def _extract_line(body: str, label: str) -> str:
    prefix = f"{label}:"
    for line in body.splitlines():
        if line.lower().startswith(prefix.lower()):
            return line.split(":", 1)[1].strip()
    return ""


def _clean_title(title: str) -> str:
    title = re.sub(r"\s+", " ", title).strip()
    return title[:110]


def _keywords_for(category: str, source: str) -> list[str]:
    if category == "money-making":
        return ["অনলাইন আয়", "ফ্রিল্যান্সিং", "AI দিয়ে আয়", "side hustle", "Bangladesh freelancing"]
    if category == "product-review":
        return ["AI tool review", "নতুন SaaS", "productivity tool", "ফ্রি টুল", "Bangla review"]
    if source == "github":
        return ["open source tool", "GitHub repo", "self hosted AI", "developer tools", "free AI tools"]
    if category == "ai-tools":
        return ["AI tools", "automation workflow", "ChatGPT alternative", "AI productivity", "Bangla AI guide"]
    return ["tech news", "developer guide", "programming", "startup technology", "Bangla tech"]


def _image_query_for(category: str, title: str, source: str) -> str:
    base = {
        "money-making": "freelance business finance laptop Bangladesh",
        "ai-tools": "artificial intelligence software dashboard laptop",
        "product-review": "software product interface laptop workspace",
        "tech-news": "developer coding workstation programming",
    }.get(category, "technology laptop workspace")
    if source == "github":
        base = "open source software developer code laptop"
    return f"{base} {title[:35]}".strip()


def _github_template(title: str, body: str, category: str) -> dict:
    repo = _extract_line(body, "Repository") or title.replace(": useful open-source tool", "")
    description = _extract_line(body, "Description") or "একটি open-source developer project"
    language = _extract_line(body, "Primary language") or "Mixed"
    stars = _extract_line(body, "Stars") or "N/A"
    forks = _extract_line(body, "Forks") or "N/A"
    license_name = _extract_line(body, "License") or "Open source"
    topics = _extract_line(body, "Topics") or "AI, automation, developer tools"
    url = _extract_line(body, "URL") or "GitHub repository"

    bangla_title = f"{repo}: ফ্রি ওপেন-সোর্স টুলের বাস্তব ব্যবহার গাইড"
    hook = (
        f"🚀 পেইড টুলের খরচ কমিয়ে নিজের workflow বানাতে চান?\n"
        f"{repo} এমন একটি open-source project যেটা ঠিকভাবে ব্যবহার করলে শেখা, automation আর client demo-তে কাজে লাগতে পারে।"
    )

    body_bn = f"""আপনি যদি AI tool, automation, coding workflow বা client project নিয়ে কাজ করেন, তাহলে সব সমস্যার সমাধান paid SaaS দিয়ে করা সবসময় smart decision নয়। অনেক সময় একটি ভালো **open-source repository** কম খরচে prototype বানাতে, self-host করতে এবং নিজের use case অনুযায়ী customize করতে বেশি কাজে লাগে। আজকের spotlight: **{repo}**।

> Quick answer: {repo} তাদের জন্য বেশি useful যারা ready-made paid tool কেনার আগে low-cost, customizable এবং learning-friendly option test করতে চান।

| বিষয় | কী দেখবেন |
|---|---|
| Best fit | freelancer, developer, small agency, founder |
| Use case | prototype, automation, client demo, learning |
| Risk | setup effort, security, maintenance |
| Next step | README পড়ে ছোট test project চালান |

## এই repo-টা কী এবং কেন trend-worthy

{description}

GitHub signal অনুযায়ী এই project-এর stars প্রায় **{stars}**, forks **{forks}**, primary language **{language}**, license **{license_name}**। Topics: {topics}। এগুলো perfect quality guarantee করে না, কিন্তু project discovery করার সময় এগুলো useful signal। বেশি star মানেই blind trust না; বরং community interest আছে কিনা সেটা বোঝার একটা starting point।

## কারা ব্যবহার করলে সবচেয়ে বেশি লাভবান হবে

- **Freelancer:** client demo বা MVP দ্রুত বানাতে।
- **Student/developer:** real-world architecture, issue, PR এবং documentation শেখার জন্য।
- **Small agency:** repetitive task automate করে monthly SaaS cost কমাতে।
- **Founder:** paid API কেনার আগে idea validate করতে।

বাংলাদেশের context-এ যারা Upwork/Fiverr client-এর জন্য chatbot, internal dashboard, document search, scraping workflow, content automation বা AI assistant বানান, তাদের জন্য এমন repo অনেক সময় shortcut না, বরং **strategic starting point**।

## কীভাবে শুরু করবেন: practical checklist

1. README পড়ে installation, Docker support এবং environment variables বুঝুন।
2. License commercial use allow করে কিনা দেখুন।
3. শেষ commit, open issues এবং maintainer activity চেক করুন।
4. Local machine-এ sample data দিয়ে test করুন।
5. Production use করলে monitoring, backup, security update এবং API cost estimate লিখে রাখুন।

## কোথায় কাজে লাগতে পারে

{repo} দিয়ে direct production product বানানোর আগে ছোট internal workflow বানিয়ে দেখুন। যেমন: client demo, team automation, research dashboard, knowledge base, AI assistant prototype, অথবা content pipeline। এতে risk কম থাকে এবং team বুঝতে পারে tool-টা সত্যিই কাজে লাগছে কিনা।

## সীমাবদ্ধতা ও risk

Open-source মানেই free maintenance নয়। Setup complex হতে পারে, documentation পুরোনো হতে পারে, আর support community-এর উপর depend করতে পারে। তাই mission-critical কাজের আগে staging environment রাখুন। Security-sensitive data থাকলে dependency audit এবং access control ছাড়া deploy করবেন না।

## BanglaAIHub verdict

{repo} একটি useful candidate, বিশেষ করে যারা **OpenAI/API cost কমিয়ে broader tool stack** বানাতে চান। তবে hype দেখে ব্যবহার না করে আগে setup effort, license, community activity এবং নিজের business use case মিলিয়ে দেখাই সবচেয়ে professional approach।

## FAQ

### এটা কি paid tool-এর বিকল্প?
কিছু use case-এ হতে পারে, কিন্তু সবসময় নয়। প্রথমে prototype বানিয়ে cost, speed এবং reliability compare করুন।

### Bangladesh থেকে ব্যবহার করা যাবে?
হ্যাঁ, বেশিরভাগ open-source project local machine বা cloud server-এ চালানো যায়। তবে payment/API dependency থাকলে আগে যাচাই করুন।

### কোথা থেকে দেখব?
Source: {url}
"""

    return {
        "bangla_title": bangla_title[:80],
        "bangla_body": body_bn,
        "bangla_hook": hook,
        "meta_description": f"{repo} open-source tool-এর ব্যবহার, সুবিধা, ঝুঁকি ও Bangladesh-friendly workflow নিয়ে practical Bangla guide।"[:155],
        "related_keywords": _keywords_for(category, "github"),
        "image_query": _image_query_for(category, repo, "github"),
        "social_angle": "Open-source দিয়ে paid SaaS cost কমানোর practical angle",
    }


def _general_template(title: str, body: str, source: str, category: str) -> dict:
    clean = _clean_title(title)
    title_lower = clean.lower()
    if category == "money-making":
        bangla_title = f"{clean}: আয় বাড়াতে কীভাবে কাজে লাগাবেন?"
        intro_angle = "এটা শুধু news না; ঠিকভাবে বুঝলে আপনার freelancing, content business বা side project planning-এ কাজে লাগতে পারে।"
    elif category == "product-review":
        bangla_title = f"{clean}: নতুন টুলটি ব্যবহারযোগ্য নাকি শুধু hype?"
        intro_angle = "নতুন product দেখলেই sign up করার আগে use case, pricing pressure এবং real workflow fit বোঝা জরুরি।"
    elif "rust" in title_lower or "go" in title_lower or "programming" in title_lower:
        bangla_title = f"{clean}: ডেভেলপারদের জন্য বাস্তব গাইড"
        intro_angle = "Programming ecosystem-এর পরিবর্তন freelancer, startup team এবং student developer—সবাইকে affect করে।"
    elif category == "ai-tools":
        bangla_title = f"{clean}: AI workflow-এ কেন গুরুত্বপূর্ণ?"
        intro_angle = "AI নিয়ে hype অনেক, কিন্তু কোন update বাস্তবে productivity বাড়ায় সেটা আলাদা করে দেখা দরকার।"
    else:
        bangla_title = f"{clean}: কেন এখন জানা জরুরি?"
        intro_angle = "Tech trend বুঝে action নিতে পারলে learning, career এবং product decision—তিন জায়গাতেই সুবিধা পাওয়া যায়।"

    hook = (
        f"🔥 {clean} নিয়ে আলোচনা হচ্ছে, কিন্তু আসল প্রশ্ন হলো: এটা আপনার কাজের জন্য useful কি না?\n"
        "এখানে hype বাদ দিয়ে practical impact, ঝুঁকি আর next step সহজ বাংলায় দিলাম।"
    )
    source_summary = body.strip()[:900] or "Source summary was limited, so this analysis focuses on practical implications."

    body_bn = f"""**{clean}** নিয়ে headline দেখলেই অনেকে দ্রুত opinion বানিয়ে ফেলেন। কিন্তু company-level decision নেওয়ার জন্য headline যথেষ্ট নয়। দরকার হলো: বিষয়টা কার জন্য গুরুত্বপূর্ণ, এখন কেন relevant, কীভাবে কাজে লাগানো যায় এবং কোথায় risk আছে। {intro_angle}

> Quick answer: এই topic-টি follow করার মতো, যদি আপনি developer workflow, AI automation, freelancing service, product decision বা tech learning roadmap নিয়ে serious হন।

| বিষয় | Practical takeaway |
|---|---|
| কার জন্য | freelancer, developer, creator, founder |
| কাজে লাগবে | skill, workflow, client offer, product decision |
| সতর্কতা | hype দেখে decision নয়, আগে ছোট test |
| Next step | demo বানিয়ে result note করুন |

## কী ঘটেছে সংক্ষেপে

Source থেকে পাওয়া মূল context হলো: {source_summary}

এটা পড়ে সবচেয়ে গুরুত্বপূর্ণ takeaway হলো, technology decision এখন শুধু “নতুন জিনিস” দেখে নেওয়া যায় না। কোন stack long-term maintainable, কোন workflow cost কমায়, কোন trend client demand তৈরি করতে পারে—এসব একসাথে ভাবতে হয়।

## কেন এটা important

প্রথমত, software এবং AI tooling market দ্রুত বদলাচ্ছে। যে developer বা creator আগে থেকে trend বুঝে ছোট experiment শুরু করে, সে পরে client work বা product building-এ advantage পায়। দ্বিতীয়ত, paid API বা SaaS-এর উপর full dependency রাখলে cost unpredictable হতে পারে। তাই open-source, local-first, automation এবং efficient stack নিয়ে ভাবা দরকার।

বাংলাদেশি freelancer-এর জন্য এর মানে হলো: service package বানানোর সময় শুধু tool-এর নাম না বলে business outcome explain করা। যেমন “AI chatbot বানাব” না বলে “customer support cost কমানোর chatbot workflow” বলা বেশি strong positioning।

## কারা এখনই attention দেবে

- **Developer:** নতুন stack বা migration decision নেওয়ার আগে trade-off বুঝতে।
- **Freelancer:** client proposal-এ modern কিন্তু realistic solution দেখাতে।
- **Founder:** product roadmap-এ cost, speed এবং maintenance balance করতে।
- **Student:** কোন skill শেখা future-proof হতে পারে সেটা বুঝতে।

## কীভাবে কাজে লাগাবেন

1. Topic-টা নিয়ে ৩০ মিনিট research করুন: official docs, GitHub issue, community discussion।
2. ছোট demo বানান। শুধু পড়লে skill তৈরি হয় না।
3. Cost estimate লিখুন: hosting, API, maintenance, team time।
4. Client-facing হলে security এবং reliability checklist রাখুন।
5. যা শিখলেন সেটাকে portfolio post বা case study বানান।

## SEO এবং content opportunity

এই ধরনের topic থেকে Bangla content বানালে search opportunity থাকে, কারণ বাংলা ভাষায় practical explanation এখনও কম। কিন্তু content helpful না হলে ranking আসে না। তাই article-এ definition, use case, step-by-step guide, pros/cons, FAQ এবং local context থাকা দরকার। শুধু “নতুন আপডেট” লিখলে সেটা news feed-এ হারিয়ে যায়।

## ঝুঁকি ও সতর্কতা

সব trend production-ready নয়। কিছু technology দ্রুত জনপ্রিয় হয় কিন্তু maintenance cost বেশি, learning curve steep, বা ecosystem immature হতে পারে। তাই team decision নেওয়ার আগে benchmark, small pilot এবং rollback plan রাখা উচিত।

## BanglaAIHub verdict

{clean} নিয়ে এখনই blind hype করার দরকার নেই, কিন্তু ignore করাও ঠিক হবে না। আপনি যদি tech career, freelancing, startup বা AI workflow নিয়ে serious হন, তাহলে এটাকে ছোট experiment হিসেবে test করুন। practical result ভালো হলে তারপর বড় workflow-তে আনুন।

## FAQ

### এটা কি beginners-এর জন্য?
Beginners follow করতে পারে, কিন্তু আগে basics পরিষ্কার রাখলে বেশি লাভ হবে।

### এটা দিয়ে আয় করা যাবে?
Direct আয় না-ও হতে পারে, কিন্তু skill, portfolio এবং client solution তৈরি করলে monetization সম্ভব।

### next step কী?
একটি ছোট demo বানান, notes রাখুন, তারপর নিজের audience বা client-এর জন্য simplified explanation তৈরি করুন।
"""

    return {
        "bangla_title": bangla_title[:80],
        "bangla_body": body_bn,
        "bangla_hook": hook,
        "meta_description": f"{clean} নিয়ে practical Bangla analysis: কী ঘটেছে, কেন জরুরি, কারা ব্যবহার করবে এবং next step কী।"[:155],
        "related_keywords": _keywords_for(category, source),
        "image_query": _image_query_for(category, clean, source),
        "social_angle": "Hype বাদ দিয়ে practical tech impact ব্যাখ্যা",
    }


def _template_rewrite_to_bangla(title: str, body: str, source: str, category: str = "") -> dict:
    if source == "github":
        return _github_template(title, body, category)
    return _general_template(title, body, source, category)


def rewrite_to_bangla(title: str, body: str, source: str, category: str = "") -> dict | None:
    if REWRITE_PROVIDER in {"template", "fallback", "free"}:
        print("[Writer] Using free SEO template writer.")
        return _template_rewrite_to_bangla(title, body, source, category)

    if not OPENAI_API_KEY:
        print("[WARN] OpenAI API key not set, using free SEO template writer.")
        return _template_rewrite_to_bangla(title, body, source, category)

    category_hint = {
        "money-making": "Focus on ethical income ideas, BD freelancing context, practical monetization steps.",
        "ai-tools": "Focus on workflow, use cases, limitations, cost control, alternatives.",
        "product-review": "Focus on product fit, use case, pros/cons, pricing caution, verdict.",
        "tech-news": "Focus on developer/startup impact, what changed, why it matters, next steps.",
    }.get(category, "Focus on practical value and local context.")

    user_prompt = f"""Category: {category}
Source: {source}
Editorial angle: {category_hint}
Original Title: {title}

Original Content:
{body[:5000]}

Write the BanglaAIHub article now."""

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
        "temperature": 0.72,
        "max_tokens": 4096,
        "response_format": {"type": "json_object"},
    }

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(OPENAI_URL, headers=headers, json=payload, timeout=120)
            if resp.status_code == 429 and REWRITE_PROVIDER == "auto":
                print("[WARN] OpenAI rate limited, using free SEO template writer.")
                return _template_rewrite_to_bangla(title, body, source, category)
            if resp.status_code in {401, 403} and REWRITE_PROVIDER == "auto":
                print(f"[WARN] OpenAI auth failed ({resp.status_code}), using free SEO template writer.")
                return _template_rewrite_to_bangla(title, body, source, category)
            if resp.status_code >= 500:
                print(f"[OpenAI] Server error {resp.status_code}, retrying (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY * attempt)
                continue

            resp.raise_for_status()
            message = (resp.json().get("choices") or [{}])[0].get("message", {})
            text = message.get("content", "").strip()
            if message.get("refusal"):
                print(f"[WARN] OpenAI refused: {message['refusal']}")
                return None
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0]

            result = json.loads(text.strip())
            for field in ["bangla_title", "bangla_body", "bangla_hook"]:
                if not result.get(field):
                    print(f"[ERROR] OpenAI missing field: {field}")
                    return None

            result.setdefault("meta_description", result["bangla_hook"][:155])
            result.setdefault("related_keywords", _keywords_for(category, source))
            result.setdefault("image_query", _image_query_for(category, title, source))
            result.setdefault("social_angle", "")
            total_tokens = resp.json().get("usage", {}).get("total_tokens", 0)
            print(f"[OpenAI] Wrote SEO article ({total_tokens} tokens)")
            return result

        except json.JSONDecodeError as e:
            last_error = e
            print(f"[ERROR] OpenAI JSON parse (attempt {attempt}): {e}")
            time.sleep(RETRY_DELAY)
        except requests.exceptions.Timeout:
            last_error = "Timeout"
            print(f"[ERROR] OpenAI timeout (attempt {attempt})")
            time.sleep(RETRY_DELAY * attempt)
        except Exception as e:
            last_error = e
            print(f"[ERROR] OpenAI API (attempt {attempt}): {e}")
            time.sleep(RETRY_DELAY)

    if REWRITE_PROVIDER == "auto":
        print(f"[WARN] OpenAI failed, using free SEO template writer: {last_error}")
        return _template_rewrite_to_bangla(title, body, source, category)
    return None
