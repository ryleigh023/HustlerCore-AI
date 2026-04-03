# -------------------- Pricing Logic --------------------

def calculate_premium(disruption_level, score):
    """
    Calculates premium based on disruption level and score.
    Adds slight variation using score to simulate "AI-like" behavior.
    """

    # Base pricing
    if disruption_level == "low":
        premium = 49
    elif disruption_level == "medium":
        premium = 99
    else:
        premium = 149

    # Adjust using score (adds intelligence feel)
    if score >= 4:
        premium += 10
    elif score == 0:
        premium -= 10

    # Ensure minimum price doesn't go below 49
    return max(premium, 49)


# -------------------- Explanation Layer --------------------

def explain_pricing(disruption_level, score):
    """
    Provides reasoning for pricing decision.
    This is key for demo + judge explanation.
    """

    if disruption_level == "low":
        risk_text = "minimal disruption"
    elif disruption_level == "medium":
        risk_text = "moderate disruption"
    else:
        risk_text = "high disruption"

    return {
        "reason": f"Premium is based on {risk_text} conditions with a disruption score of {score}.",
        "model": "rule-based heuristic v1",
        "confidence": "medium"
    }