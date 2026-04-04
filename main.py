from fastapi import FastAPI
from pydantic import BaseModel
import random
from pricing import calculate_premium, explain_pricing
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

# -------------------- CORS --------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Admin State --------------------

admin_state = {
    "mode": "auto",
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
    trigger_status: str

class PremiumResponse(BaseModel):
    disruption_level: str
    score: int
    premium: int
    payout: int
    explanation: dict

# -------------------- Admin Request Model --------------------

class AdminRequest(BaseModel):
    mode: str
    rain: Optional[str] = None
    aqi: Optional[str] = None
    curfew: Optional[bool] = None

# -------------------- Trigger Simulation --------------------

def get_triggers():
    if admin_state["mode"] == "manual":
        rain = admin_state["rain"] or "low"
        aqi = admin_state["aqi"] or "good"
        curfew = admin_state["curfew"] if admin_state["curfew"] is not None else False

        return rain, aqi, curfew

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

    trigger_status = "active" if level == "high" else "normal"

    return {
        "rain": rain,
        "aqi": aqi,
        "curfew": curfew,
        "disruption_level": level,
        "score": score,
        "trigger_status": trigger_status
    }

@app.get("/premium", response_model=PremiumResponse)
def premium():
    rain, aqi, curfew = get_triggers()
    level, score = calculate_disruption(rain, aqi, curfew)

    premium_value = calculate_premium(level, score)
    explanation = explain_pricing(level, score)

    payout = 280 if level == "high" else 0

    return {
        "disruption_level": level,
        "score": score,
        "premium": premium_value,
        "payout": payout,
        "explanation": explanation
    }

# -------------------- ADMIN CONTROL --------------------

@app.post("/admin/set-mode")
def set_mode(data: AdminRequest):
    if data.mode not in ["auto", "manual"]:
        return {"error": "mode must be 'auto' or 'manual'"}

    admin_state["mode"] = data.mode

    if data.mode == "manual":

        # DEMO SHORTCUT
        if data.rain == "storm":
            admin_state["rain"] = "heavy"
            admin_state["aqi"] = "severe"
            admin_state["curfew"] = True
        else:
            admin_state["rain"] = data.rain
            admin_state["aqi"] = data.aqi
            admin_state["curfew"] = data.curfew

    return {
        "message": "mode updated",
        "state": admin_state
    }