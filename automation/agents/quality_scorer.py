"""Content Quality Scorer — scores translated content before publishing."""


def score_content(bangla: dict) -> dict:
    """Score content quality. Returns dict with score (0-100) and reasons.
    
    Checks:
    - Title length and quality
    - Body length (minimum 800 words)
    - Hook quality (curiosity, emoji, length)
    - Has proper headings
    - Has actionable content
    - Meta description present
    """
    score = 0
    reasons = []
    
    title = bangla.get("bangla_title", "")
    body = bangla.get("bangla_body", "")
    hook = bangla.get("bangla_hook", "")
    meta = bangla.get("meta_description", "")
    
    # ─── Title (max 20 pts) ───
    if len(title) >= 20:
        score += 10
    else:
        reasons.append("Title too short")
    
    if len(title) <= 80:
        score += 5
    else:
        reasons.append("Title too long for SEO")
    
    if any(c in title for c in "?!।"):
        score += 5  # engaging punctuation
    
    # ─── Body (max 35 pts) ───
    word_count = len(body.split())
    if word_count >= 500:
        score += 15
    elif word_count >= 300:
        score += 10
        reasons.append(f"Body short: {word_count} words")
    else:
        reasons.append(f"Body very short: {word_count} words")
    
    # Has headings
    heading_count = body.count("## ") + body.count("### ")
    if heading_count >= 3:
        score += 10
    elif heading_count >= 1:
        score += 5
        reasons.append(f"Only {heading_count} headings")
    else:
        reasons.append("No headings found")
    
    # Has bold text / emphasis
    if "**" in body:
        score += 5
    
    # Has conclusion section
    conclusion_markers = ["উপসংহার", "সারসংক্ষেপ", "শেষ কথা", "সর্বশেষ"]
    if any(m in body for m in conclusion_markers):
        score += 5
    else:
        reasons.append("No conclusion section")
    
    # ─── Hook (max 25 pts) ───
    if len(hook) >= 50:
        score += 10
    else:
        reasons.append("Hook too short")
    
    if len(hook) <= 300:
        score += 5
    
    # Has emoji in hook
    import re
    emoji_pattern = re.compile(
        "[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U0001F900-\U0001F9FF"
        "\U00002600-\U000026FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF"
        "\U0000200D\U0000FE0F]+",
        flags=re.UNICODE,
    )
    if emoji_pattern.search(hook):
        score += 5
    else:
        reasons.append("No emoji in hook")
    
    # Has question or curiosity gap
    if "?" in hook or "কি জানেন" in hook or "কিভাবে" in hook:
        score += 5
    
    # ─── Meta (max 10 pts) ───
    if meta and len(meta) >= 50:
        score += 5
    if meta and len(meta) <= 160:
        score += 5
    
    # ─── Keywords (max 10 pts) ───
    keywords = bangla.get("related_keywords", [])
    if len(keywords) >= 3:
        score += 10
    elif len(keywords) >= 1:
        score += 5
    
    return {
        "score": min(100, score),
        "grade": _get_grade(score),
        "reasons": reasons,
        "word_count": word_count,
        "heading_count": heading_count,
    }


def _get_grade(score: int) -> str:
    if score >= 80:
        return "A"
    elif score >= 65:
        return "B"
    elif score >= 50:
        return "C"
    elif score >= 35:
        return "D"
    return "F"


# Minimum score to publish
MIN_PUBLISH_SCORE = 40


def is_publishable(bangla: dict) -> tuple[bool, dict]:
    """Check if content meets minimum quality bar.
    
    Returns (should_publish, score_details).
    """
    details = score_content(bangla)
    return details["score"] >= MIN_PUBLISH_SCORE, details
