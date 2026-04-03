import type { PremiumQuote, WeeklyTier } from "./types";

export const WEEKLY_TIERS: {
  tier: WeeklyTier;
  label: string;
  payoutDay: number;
}[] = [
  { tier: 49, label: "Basic Shield", payoutDay: 150 },
  { tier: 99, label: "Standard Shield", payoutDay: 280 },
  { tier: 149, label: "Pro Shield", payoutDay: 400 },
];

export function payoutForTier(tier: WeeklyTier): number {
  return WEEKLY_TIERS.find((t) => t.tier === tier)?.payoutDay ?? 280;
}

export function renewalDateISO(from: Date = new Date()): string {
  const d = new Date(from);
  const day = d.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Sprint “AI” shortcut: Risk_Score = (Historical_Rain * 0.6) + (Zone_Density * 0.4)
 * Weekly premium adjusts by up to ±₹5 vs base tier.
 */
export function heuristicRiskScore(
  historicalRain01: number,
  zoneDensity01: number,
): number {
  return historicalRain01 * 0.6 + zoneDensity01 * 0.4;
}

export function adjustWeeklyPremium(
  base: WeeklyTier,
  riskScore01: number,
): number {
  const delta = Math.round((riskScore01 - 0.5) * 10);
  const clamped = Math.max(-5, Math.min(5, delta));
  return Math.max(44, Math.min(154, base + clamped));
}

export function localPremiumQuote(
  base: WeeklyTier,
  zoneRisk: number,
): PremiumQuote {
  const historicalRain = zoneRisk;
  const zoneDensity = 0.35 + zoneRisk * 0.5;
  const riskScore = heuristicRiskScore(historicalRain, zoneDensity);
  const adjusted = adjustWeeklyPremium(base, riskScore);
  return {
    baseInr: base,
    adjustedInr: adjusted,
    zoneLabel:
      zoneRisk < 0.35
        ? "Low disruption zone"
        : zoneRisk < 0.65
          ? "Metro corridor"
          : "High-risk monsoon band",
    riskScore: Math.round(riskScore * 100) / 100,
    historicalRain: Math.round(historicalRain * 100) / 100,
    zoneDensity: Math.round(zoneDensity * 100) / 100,
  };
}

/** Judge line item: e.g. Basic ₹49 → ₹47 when risk score ≈0.30 (Δ −₹2, within ±₹5). */
export function formatPremiumExplain(q: PremiumQuote): string {
  const delta = q.adjustedInr - q.baseInr;
  const sign = delta > 0 ? "+" : "";
  const hr = q.historicalRain ?? 0;
  const zd = q.zoneDensity ?? 0;
  return `₹${q.baseInr} → ₹${q.adjustedInr} (${sign}${delta}). Risk ${q.riskScore} = (Historical rain×0.6)+(Zone density×0.4) using inputs ${hr} / ${zd} — hyper-local ±₹5 cap.`;
}
