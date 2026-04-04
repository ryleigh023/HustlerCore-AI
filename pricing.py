# -------------------- Pricing Logic --------------------

def calculate_premium(disruption_level, score):
    """
    Calculates weekly premium based on disruption level.
    Adds variation using score to simulate AI risk assessment.
    """
    # Base weekly pricing tiers
    if disruption_level == "low":
        premium = 49
    elif disruption_level == "medium":
        premium = 99
    else:
        premium = 149

    # Dynamic Adjustment (AI-like behavior)
    if score >= 4:
        premium += 10 # High risk zone adjustment
    elif score == 0:
        premium -= 5  # Safe zone discount

    # Maintain strictly weekly format and floor at 49
    return max(premium, 49)

# -------------------- Explanation Layer --------------------

def explain_pricing(disruption_level, score):
    """
    Provides reasoning for pricing—essential for the AI demo.
    """
    if disruption_level == "low":
        risk_text = "minimal disruption"
    elif disruption_level == "medium":
        risk_text = "moderate disruption"
    else:
        risk_text = "high disruption"

    return {
        "reason": f"Premium based on {risk_text} with a disruption score of {score}.",
        "billing_cycle": "Weekly",
        "model": "Predictive Risk Heuristic v1"
    }