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
  };
}
