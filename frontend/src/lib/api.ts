import { getDemoMode, statusForDemoMode } from "./demo";
import { getApiBase } from "./env";
import { localPremiumQuote } from "./premiums";
import type {
  AnalyticsPayload,
  ClaimRow,
  ModelPerformancePoint,
  PremiumQuote,
  StatusPayload,
  WeeklyTier,
  WorkerProfile,
} from "./types";

async function tryFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** POST /register */
export async function registerWorker(profile: {
  name: string;
  phone: string;
  persona: string;
  weekly_plan_inr: number;
  zone_risk?: number;
}): Promise<boolean> {
  const ok = await tryFetch<{ ok?: boolean }>("/register", {
    method: "POST",
    body: JSON.stringify(profile),
  });
  return ok !== null;
}

/**
 * GET /status — polled every 2s. Demo mode overrides API (War Room “hardcoded demo”).
 */
export async function fetchStatus(): Promise<StatusPayload> {
  const mode = getDemoMode();
  const demo = statusForDemoMode(mode);
  if (demo) return demo;

  const data = await tryFetch<StatusPayload>("/status");
  if (data?.level) return normalizeStatus(data);
  return mockStatus();
}

function normalizeStatus(data: StatusPayload): StatusPayload {
  return {
    ...data,
    activeTriggers: data.activeTriggers?.length
      ? data.activeTriggers
      : inferTriggers(data),
  };
}

function inferTriggers(s: StatusPayload): string[] {
  const t: string[] = [];
  if ((s.rain_mm ?? 0) > 65) t.push("rain_gt_65mm");
  if ((s.aqi ?? 0) > 400) t.push("aqi_gt_400");
  if (s.curfew) t.push("curfew_red_zone");
  if (s.level === "elevated_risk") t.push("watch_band");
  return t;
}

/** GET /analytics */
export async function fetchAnalytics(): Promise<AnalyticsPayload> {
  const data = await tryFetch<AnalyticsPayload>("/analytics");
  if (data?.forecast30d) return data;
  return mockAnalytics();
}

/** GET /claims */
export async function fetchClaims(): Promise<ClaimRow[]> {
  const data = await tryFetch<ClaimRow[]>("/claims");
  if (data?.length) return data;
  return mockClaims();
}

/** POST /inquiry — NL claim inquiry (Hindi / English). */
export async function postInquiry(body: {
  message: string;
  lang: "en" | "hi";
}): Promise<{ reply: string }> {
  const data = await tryFetch<{ reply: string }>("/inquiry", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (data?.reply) return data;
  return mockInquiryReply(body);
}

/** GET /calculate-premium or POST — Person A contract; fallback to heuristic. */
export async function fetchPremiumQuote(
  base: WeeklyTier,
  zoneRisk: number,
): Promise<PremiumQuote> {
  const data = await tryFetch<PremiumQuote>("/calculate-premium", {
    method: "POST",
    body: JSON.stringify({
      weekly_tier_inr: base,
      zone_risk: zoneRisk,
    }),
  });
  if (data && typeof data.adjustedInr === "number") return data;
  return localPremiumQuote(base, zoneRisk);
}

/** “Model performance” chart — optional GET /model-metrics */
export async function fetchModelPerformance(): Promise<ModelPerformancePoint[]> {
  const data = await tryFetch<ModelPerformancePoint[]>("/model-metrics");
  if (data?.length) return data;
  return mockModelPerformance();
}

export function mockStatus(): StatusPayload {
  return {
    level: "clear",
    label: "All clear",
    detail: "No parametric triggers active (offline mock).",
    rain_mm: 22,
    aqi: 155,
    curfew: false,
    activeTriggers: [],
  };
}

function mockAnalytics(): AnalyticsPayload {
  const forecast30d = Array.from({ length: 14 }, (_, i) => ({
    day: `W${i + 1}`,
    disruptionRisk: Math.round(18 + Math.sin(i / 3) * 12 + (i % 4) * 3),
  }));
  return {
    incomeProtected: 8420,
    incomeLost: 1180,
    forecast30d,
  };
}

function mockClaims(): ClaimRow[] {
  return [
    {
      id: "c1",
      date: "2026-03-28",
      event: "Heavy rain — Bandra zone",
      amount: 280,
      tier: 1,
      status: "auto_approved",
    },
    {
      id: "c2",
      date: "2026-03-15",
      event: "AQI spike — fraud review",
      amount: 0,
      tier: 3,
      status: "human_review",
    },
  ];
}

function mockModelPerformance(): ModelPerformancePoint[] {
  return [
    { label: "T1", train: 0.82, val: 0.79 },
    { label: "T2", train: 0.85, val: 0.81 },
    { label: "T3", train: 0.88, val: 0.83 },
    { label: "T4", train: 0.9, val: 0.84 },
    { label: "T5", train: 0.91, val: 0.85 },
  ];
}

function mockInquiryReply(body: { message: string; lang: "en" | "hi" }): {
  reply: string;
} {
  const raw = body.message.trim();
  const q = raw.toLowerCase();

  if (body.lang === "hi") {
    if (/आज\s*बारिश|baarish|बारिश/.test(raw) && /कवर|milega|मिलेगा|coverage/.test(raw)) {
      return {
        reply:
          "हाँ — अगर आपके ज़ोन में भारी बारिश का पैरामीट्रिक ट्रिगर (जैसे >65mm) चालू हो जाता है, तो आपको मैन्युअल क्लेम दाखिल किए बिना स्टैंडर्ड शील्ड के तहत ₹280/दिन तक का भुगतान स्वचालित रूप से शुरू हो सकता है (साप्ताहिक सीमा तक)।",
      };
    }
    if (/पैस|भुगतान|payout|क्लेम/.test(raw)) {
      return {
        reply:
          "आपकी सक्रिय पॉलिसी के तहत, ट्रिगर पुष्ट होने पर भुगतान स्वचालित रूप से शुरू हो जाता है — कोई मैन्युअल एडजस्टर नहीं।",
      };
    }
    return {
      reply:
        "मैं HustlerCore सहायक हूँ। कवरेज, साप्ताहिक प्रीमियम (₹49 / ₹99 / ₹149), या भुगतान स्थिति के बारे में पूछें।",
    };
  }

  if (/payout|pay|rain|280|claim/.test(q)) {
    return {
      reply:
        "Under Standard Shield, a Severe Rain trigger auto-starts up to ₹280 per disruption day (weekly cap applies). Parametric — no manual adjuster.",
    };
  }
  return {
    reply:
      "I'm the HustlerCore assistant. Ask about weekly tiers (₹49 / ₹99 / ₹149), triggers, or payout status.",
  };
}

export function persistProfile(p: WorkerProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hustler_profile", JSON.stringify(p));
}

export function loadProfile(): WorkerProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hustler_profile");
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as WorkerProfile & { zoneRisk?: number };
    return {
      ...j,
      zoneRisk: typeof j.zoneRisk === "number" ? j.zoneRisk : 0.5,
    };
  } catch {
    return null;
  }
}
