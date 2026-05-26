"""Daily evergreen online-income topic seed.

This keeps the money-making section active even when external scrapers do not
return a strong income-focused story on a given day.
"""

from datetime import date


TOPICS = [
    {
        "slug": "ai-content-writing-service",
        "title": "AI content writing service for Bangladeshi freelancers",
        "body": (
            "Explain how a beginner freelancer can package AI-assisted blog writing, "
            "Facebook captions, product descriptions, and email copy as a service. "
            "Include client offer, workflow, pricing caution, portfolio ideas, delivery checklist, "
            "quality control, and ethical use of AI."
        ),
    },
    {
        "slug": "short-video-editing-with-ai",
        "title": "Earn from short video editing with AI tools",
        "body": (
            "Create a practical guide for earning from reels, shorts, captions, hooks, "
            "thumbnail ideas, and repurposing long videos with AI. Include Bangladesh-friendly "
            "client niches, delivery process, mistakes, and a 7-day starter plan."
        ),
    },
    {
        "slug": "ai-chatbot-service-for-small-business",
        "title": "Build AI chatbot services for local small businesses",
        "body": (
            "Explain how freelancers can offer simple FAQ chatbots, lead capture bots, "
            "WhatsApp-style support flows, and website assistants to local businesses. "
            "Cover scope, tools, data collection, privacy, pricing, and maintenance."
        ),
    },
    {
        "slug": "ai-productized-service",
        "title": "Turn AI skills into a productized freelance service",
        "body": (
            "Write a guide on packaging one repeatable AI service such as research reports, "
            "landing page copy, automation setup, or social media content calendar. Include offer, "
            "process, sample deliverables, revisions, and client communication."
        ),
    },
    {
        "slug": "notion-ai-business-dashboard",
        "title": "Sell simple AI-powered Notion or spreadsheet dashboards",
        "body": (
            "Explain how freelancers can create lightweight dashboards for content planning, "
            "lead tracking, expense tracking, or project management using AI-assisted templates. "
            "Include target customers, setup workflow, delivery package, and support model."
        ),
    },
    {
        "slug": "ai-research-report-service",
        "title": "Earn by creating AI-assisted research reports",
        "body": (
            "Create a practical article on offering market research, competitor analysis, "
            "tool comparison, and source-based summary reports using AI. Cover source verification, "
            "report structure, client niches, and pricing caution."
        ),
    },
    {
        "slug": "ai-automation-for-clients",
        "title": "Make money with simple AI automation for clients",
        "body": (
            "Explain how to sell small automations such as form-to-email, lead sorting, content alerts, "
            "CRM updates, and weekly reports. Include no-code tools, scoping, testing, handover, "
            "and recurring maintenance ideas."
        ),
    },
]


def generate_daily_income_topic() -> dict:
    today = date.today()
    topic = TOPICS[today.toordinal() % len(TOPICS)]
    return {
        "source": "manual",
        "source_url": f"daily-income://{today.isoformat()}-{topic['slug']}",
        "original_title": topic["title"],
        "original_body": "online income earn money freelance client revenue side hustle. " + topic["body"],
        "engagement_score": 10000,
    }
