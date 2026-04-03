from fastapi import FastAPI
from pydantic import BaseModel
import random
from pricing import calculate_premium, explain_pricing

app = FastAPI()

# -------------------- Admin State --------------------

admin_state = {
    "mode": "auto",   # auto or manual
    "rain": None,
    "aqi": None,
    "curfew": None
}

# -------------------- Response Models --------------------

class StatusResponse(BaseModel):
    rain: str
    aqi: str
    curfew: bool
    disruption_level: str
    score: int

class PremiumResponse(BaseModel):
    disruption_level: str
    score: int
    premium: int
    explanation: dict

# -------------------- Trigger Simulation --------------------

def get_triggers():
    # If manual mode → use admin values
    if admin_state["mode"] == "manual":
        return (
            admin_state["rain"],
            admin_state["aqi"],
            admin_state["curfew"]
        )

    # Else → random mode
    rain = random.choice(["low", "moderate", "heavy"])
    aqi = random.choice(["good", "poor", "severe"])
    curfew = random.choice([True, False])

    return rain, aqi, curfew

# -------------------- Disruption Logic --------------------

def calculate_disruption(rain, aqi, curfew):
    score = 0

    if rain == "moderate":
        score += 1
    elif rain == "heavy":
        score += 2

    if aqi == "poor":
        score += 1
    elif aqi == "severe":
        score += 2

    if curfew:
        score += 2

    if score <= 1:
        level = "low"
    elif score <= 3:
        level = "medium"
    else:
        level = "high"

    return level, score


# -------------------- API Endpoints --------------------

@app.get("/")
def root():
    return {"message": "HustlerCore AI Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/status", response_model=StatusResponse)
def status():
    rain, aqi, curfew = get_triggers()
    level, score = calculate_disruption(rain, aqi, curfew)

    return {
        "rain": rain,
        "aqi": aqi,
        "curfew": curfew,
        "disruption_level": level,
        "score": score
    }


@app.get("/premium", response_model=PremiumResponse)
def premium():
    rain, aqi, curfew = get_triggers()
    level, score = calculate_disruption(rain, aqi, curfew)

    premium_value = calculate_premium(level, score)
    explanation = explain_pricing(level, score)

    return {
        "disruption_level": level,
        "score": score,
        "premium": premium_value,
        "explanation": explanation
    }

from typing import Optional

@app.post("/admin/set-mode")
def set_mode(
    mode: str,
    rain: Optional[str] = None,
    aqi: Optional[str] = None,
    curfew: Optional[bool] = None
):
    if mode not in ["auto", "manual"]:
        return {"error": "mode must be 'auto' or 'manual'"}

    admin_state["mode"] = mode

    if mode == "manual":
        admin_state["rain"] = rain
        admin_state["aqi"] = aqi
        admin_state["curfew"] = curfew

    return {
        "message": "mode updated",
        "state": admin_state
    }