from fastapi import FastAPI
from pydantic import BaseModel
import random
import math
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
    "curfew": None,
    "traffic": None,
    "heat_wave": None
}

# -------------------- Response Models --------------------

class StatusResponse(BaseModel):
    rain: str
    aqi: str
    curfew: bool
    traffic: str
    heat_wave: bool
    disruption_level: str
    score: int
    trigger_status: str
    reason: Optional[str] = None
    rain_mm: Optional[int] = None
    aqi_val: Optional[int] = None

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
    traffic: Optional[str] = None
    heat_wave: Optional[bool] = None

class RegisterRequest(BaseModel):
    name: str
    phone: str
    persona: str
    weekly_plan_inr: int
    zone_risk: Optional[float] = None

class InquiryRequest(BaseModel):
    message: str
    lang: str

class PremiumCalcRequest(BaseModel):
    weekly_tier_inr: int
    zone_risk: float

# -------------------- Trigger Simulation --------------------

def get_triggers():
    if admin_state["mode"] == "manual":
        rain = admin_state["rain"] or "low"
        aqi = admin_state["aqi"] or "good"
        curfew = admin_state.get("curfew", False)
        traffic = admin_state.get("traffic", "clear")
        heat_wave = admin_state.get("heat_wave", False)
        return rain, aqi, curfew, traffic, heat_wave

    rain = random.choice(["low", "moderate", "heavy"])
    aqi = random.choice(["good", "poor", "severe"])
    curfew = random.choice([True, False])
    traffic = random.choice(["clear", "moderate", "severe"])
    heat_wave = random.choice([True, False])
    return rain, aqi, curfew, traffic, heat_wave

# -------------------- Disruption Logic --------------------

def calculate_disruption(rain, aqi, curfew, traffic, heat_wave):
    score = 0
    if rain == "moderate": score += 1
    elif rain == "heavy": score += 2

    if aqi == "poor": score += 1
    elif aqi == "severe": score += 2

    if curfew: score += 2
    
    if traffic == "moderate": score += 1
    elif traffic == "severe": score += 2
    
    if heat_wave: score += 1

    if score <= 2: level = "low"
    elif score <= 4: level = "medium"
    else: level = "high"

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
    rain, aqi, curfew, traffic, heat_wave = get_triggers()
    level, score = calculate_disruption(rain, aqi, curfew, traffic, heat_wave)
    
    # "active" trigger status for the frontend 'Magic Loop'
    trigger_status = "active" if level == "high" else "normal"
    
    reason = "Parametric trigger" if trigger_status == "active" else "All clear"
    rain_mm = {"low": 20, "moderate": 45, "heavy": 85}.get(rain, 20)
    aqi_val = {"good": 50, "poor": 250, "severe": 450}.get(aqi, 50)

    return {
        "rain": rain,
        "aqi": aqi,
        "curfew": curfew,
        "traffic": traffic,
        "heat_wave": heat_wave,
        "disruption_level": level,
        "score": score,
        "trigger_status": trigger_status,
        "reason": reason,
        "rain_mm": rain_mm,
        "aqi_val": aqi_val
    }

@app.get("/premium", response_model=PremiumResponse)
def premium():
    rain, aqi, curfew, traffic, heat_wave = get_triggers()
    level, score = calculate_disruption(rain, aqi, curfew, traffic, heat_wave)

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

# -------------------- FRONTEND ENDPOINTS --------------------

@app.post("/register")
def register(req: RegisterRequest):
    return {"ok": True}

@app.get("/analytics")
def analytics():
    forecast30d = [{"day": f"W{i + 1}", "disruptionRisk": round(18 + math.sin(i / 3) * 12 + (i % 4) * 3)} for i in range(14)]
    return {
        "incomeProtected": 8420,
        "incomeLost": 1180,
        "forecast30d": forecast30d
    }

@app.get("/claims")
def claims():
    return [
        {
            "id": "c1",
            "date": "2026-03-28",
            "event": "Heavy rain — Bandra zone",
            "amount": 280,
            "tier": 1,
            "status": "auto_approved"
        },
        {
            "id": "c2",
            "date": "2026-03-15",
            "event": "AQI spike — fraud review",
            "amount": 0,
            "tier": 3,
            "status": "human_review"
        }
    ]

@app.post("/inquiry")
def inquiry(req: InquiryRequest):
    q = req.message.lower().strip()
    if req.lang == "hi":
        if "baarish" in q or "बारिश" in q or "आज बारिश" in q:
            return {"reply": "हाँ — अगर आपके ज़ोन में भारी बारिश का पैरामीट्रिक ट्रिगर (जैसे >65mm) चालू हो जाता है, तो आपको मैन्युअल क्लेम दाखिल किए बिना स्टैंडर्ड शील्ड के तहत ₹280/दिन तक का भुगतान स्वचालित रूप से शुरू हो सकता है (साप्ताहिक सीमा तक)।"}
        if "pay" in q or "भुगतान" in q or "payout" in q or "क्लेम" in q:
            return {"reply": "आपकी सक्रिय पॉलिसी के तहत, ट्रिगर पुष्ट होने पर भुगतान स्वचालित रूप से शुरू हो जाता है — कोई मैन्युअल एडजस्टर नहीं।"}
        return {"reply": "मैं HustlerCore सहायक हूँ। कवरेज, साप्ताहिक प्रीमियम (₹49 / ₹99 / ₹149), या भुगतान स्थिति के बारे में पूछें।"}
    else:
        if "pay" in q or "payout" in q or "rain" in q or "280" in q or "claim" in q:
            return {"reply": "Under Standard Shield, a Severe Rain trigger auto-starts up to ₹280 per disruption day (weekly cap applies). Parametric — no manual adjuster."}
        return {"reply": "I'm the HustlerCore assistant. Ask about weekly tiers (₹49 / ₹99 / ₹149), triggers, or payout status."}

@app.post("/calculate-premium")
def calculate_premium_endpoint(req: PremiumCalcRequest):
    base = req.weekly_tier_inr
    adj = base
    if req.zone_risk > 0.6:
        adj += 10
    elif req.zone_risk < 0.4:
        adj -= 5
    
    return {
        "adjustedInr": adj,
        "riskScore": int(req.zone_risk * 100),
        "historicalRain": 320,
        "zoneDensity": 12500
    }

@app.get("/model-metrics")
def model_metrics():
    return [
        {"label": "T1", "train": 0.82, "val": 0.79},
        {"label": "T2", "train": 0.85, "val": 0.81},
        {"label": "T3", "train": 0.88, "val": 0.83},
        {"label": "T4", "train": 0.9, "val": 0.84},
        {"label": "T5", "train": 0.91, "val": 0.85}
    ]

# -------------------- ADMIN CONTROL --------------------

@app.post("/admin/set-mode")
def set_mode(data: AdminRequest):
    if data.mode not in ["auto", "manual"]:
        return {"error": "mode must be 'auto' or 'manual'"}

    admin_state["mode"] = data.mode

    if data.mode == "manual":
        # DEMO SHORTCUT: Setting rain to 'storm' triggers a high disruption state
        if data.rain == "storm":
            admin_state["rain"] = "heavy"
            admin_state["aqi"] = "severe"
            admin_state["curfew"] = True
        else:
            admin_state["rain"] = data.rain
            admin_state["aqi"] = data.aqi
            admin_state["curfew"] = data.curfew
            admin_state["traffic"] = data.traffic
            admin_state["heat_wave"] = data.heat_wave

    return {
        "message": "mode updated",
        "state": admin_state
    }