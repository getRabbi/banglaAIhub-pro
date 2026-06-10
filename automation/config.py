import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local", override=True)


def _env(name: str, default: str = "") -> str:
    return os.getenv(name) or default


def _env_int(name: str, default: int) -> int:
    try:
        return int(_env(name, str(default)))
    except ValueError:
        return default


AUTOMATION_NAME = _env("AUTOMATION_NAME", "BanglaAIHub Automation")
AUTOMATION_USER_AGENT = _env(
    "AUTOMATION_USER_AGENT",
    "BanglaAIHubAutomation/1.0 (content discovery; banglaaihub.com)",
)

# ─── Reddit API ───
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", AUTOMATION_USER_AGENT)

REDDIT_SUBREDDITS_MONEY = [
    "sidehustle",
    "beermoney",
    "entrepreneur",
    "passive_income",
    "WorkOnline",
    "slavelabour",
    "freelance",
    "digitalnomad",
]
REDDIT_SUBREDDITS_TECH = [
    "artificial",
    "MachineLearning",
    "ChatGPT",
    "LocalLLaMA",
    "singularity",
    "SaaS",
    "webdev",
    "programming",
]
REDDIT_MIN_UPVOTES = 50
REDDIT_POSTS_PER_SUB = 5
REDDIT_TIME_FILTER = "week"

# ─── X / Twitter API ───
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN", "")
X_KEYWORDS_MONEY = [
    "make money online",
    "side hustle",
    "passive income",
    "earn from home",
    "online income",
    "freelancing tips",
]
X_KEYWORDS_TECH = [
    "AI tools",
    "ChatGPT",
    "new AI app",
    "LLM",
    "artificial intelligence",
    "tech launch",
]
X_MIN_LIKES = 100
X_MAX_RESULTS = 20

# ─── Hacker News ───
HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"
HN_MIN_SCORE = 100
HN_FETCH_COUNT = 30
HN_RELEVANT_KEYWORDS = [
    "ai", "gpt", "llm", "startup", "saas", "income", "freelance",
    "money", "earn", "passive", "side project", "launch", "tool",
    "automation", "chatgpt", "claude", "gemini", "open source",
    "machine learning", "deep learning", "neural", "api",
]

# ─── Product Hunt ───
PH_API_TOKEN = os.getenv("PH_API_TOKEN", "")
PH_POSTS_PER_DAY = 5

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_MIN_STARS = int(_env("GITHUB_MIN_STARS", "500"))
GITHUB_FETCH_COUNT = int(_env("GITHUB_FETCH_COUNT", "20"))
GITHUB_TOPICS = [
    t.strip()
    for t in _env(
        "GITHUB_TOPICS",
        "llm,ai-agent,rag,automation,developer-tools,local-first,productivity",
    ).split(",")
    if t.strip()
]

# ─── OpenAI API ───
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if OPENAI_API_KEY in {"sk-your-key", "your-openai-key", "your-openai-api-key"}:
    OPENAI_API_KEY = ""
OPENAI_MODEL = _env("OPENAI_MODEL", "gpt-4o-mini")  # gpt-4o, gpt-4o-mini, gpt-4-turbo
OPENAI_BASE_URL = _env("OPENAI_BASE_URL", "https://api.openai.com/v1/chat/completions")
REWRITE_PROVIDER = _env("REWRITE_PROVIDER", "auto").lower()

# ─── Supabase ───
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# ─── Facebook Page API ───
FB_PAGE_ACCESS_TOKEN = os.getenv("FB_PAGE_ACCESS_TOKEN", "")
FB_PAGE_ID = os.getenv("FB_PAGE_ID", "")
FB_POST_FIRST_COMMENT = _env("FB_POST_FIRST_COMMENT", "false").lower() in {"1", "true", "yes"}
FB_LINK_STRATEGY = _env("FB_LINK_STRATEGY", "soft").lower()
FB_DIRECT_LINK_EVERY = max(1, _env_int("FB_DIRECT_LINK_EVERY", 4))

# ─── Image Discovery ───
UNSPLASH_ACCESS_KEY = _env("UNSPLASH_ACCESS_KEY", "")
CONTENT_IMAGE_PROVIDER = _env("CONTENT_IMAGE_PROVIDER", "unsplash").lower()

# ─── Telegram Notifications ───
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# ─── Blog Settings ───
BLOG_BASE_URL = os.getenv("BLOG_BASE_URL", "https://banglaaihub.com")
POSTS_PER_RUN = max(1, _env_int("POSTS_PER_RUN", 2))

# Facebook posting is intentionally drip-fed. The pipeline may publish multiple
# blog articles, but Facebook should never receive a burst from one run.
FB_POSTS_PER_RUN = max(0, _env_int("FB_POSTS_PER_RUN", 1))
FB_MIN_POST_INTERVAL_HOURS = max(1, _env_int("FB_MIN_POST_INTERVAL_HOURS", 6))

# ─── Content Categories ───
CATEGORIES = {
    "money-making": {
        "label": "অনলাইন আয়",
        "label_en": "Money Making",
        "emoji": "💰",
        "color": "#10b981",
    },
    "ai-tools": {
        "label": "AI টুলস",
        "label_en": "AI Tools",
        "emoji": "🤖",
        "color": "#8b5cf6",
    },
    "tech-news": {
        "label": "টেক নিউজ",
        "label_en": "Tech News",
        "emoji": "📡",
        "color": "#3b82f6",
    },
    "product-review": {
        "label": "প্রোডাক্ট রিভিউ",
        "label_en": "Product Review",
        "emoji": "🚀",
        "color": "#f59e0b",
    },
}
