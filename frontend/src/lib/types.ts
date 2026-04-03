export type PersonaId = "food" | "ecomm" | "grocery";

export type WeeklyTier = 49 | 99 | 149;

export type StatusLevel = "clear" | "elevated_risk" | "trigger_active";

/** Local demo modes — work without live weather (War Room backup). */
export type DemoMode =
  | "live"
  | "clear_sky"
  | "risk_watch"
  | "severe_rain"
  | "aqi_spike"
  | "curfew_red";

export interface WorkerProfile {
  name: string;
  phone: string;
  persona: PersonaId;
  weeklyTier: WeeklyTier;
  /** 0–1 zone risk used for heuristic premium (matches sprint doc). */
  zoneRisk: number;
  onboardedAt: string;
}

export interface StatusPayload {
  level: StatusLevel;
  label: string;
  detail?: string;
  rain_mm?: number;
  aqi?: number;
  curfew?: boolean;
  /** Which automated rules are currently “firing” for the judge story */
  activeTriggers?: string[];
}

export interface ClaimRow {
  id: string;
  date: string;
  event: string;
  amount: number;
  tier: 1 | 3;
  status: "auto_approved" | "human_review";
}

export interface AnalyticsPayload {
  incomeProtected: number;
  incomeLost: number;
  forecast30d: { day: string; disruptionRisk: number }[];
}

export interface ModelPerformancePoint {
  label: string;
  train: number;
  val: number;
}

export interface PremiumQuote {
  baseInr: WeeklyTier;
  adjustedInr: number;
  zoneLabel: string;
  riskScore: number;
}
