from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI()

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

# -------------------- Trigger Simulation --------------------

def get_triggers():
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

# -------------------- Pricing Logic --------------------

def calculate_premium(disruption_level):
    if disruption_level == "low":
        return 49
    elif disruption_level == "medium":
        return 99
    else:
        return 149

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
    premium = calculate_premium(level)

    return {
        "disruption_level": level,
        "score": score,
        "premium": premium
    }