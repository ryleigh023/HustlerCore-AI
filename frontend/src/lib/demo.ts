import type { DemoMode, StatusPayload } from "./types";

const KEY = "hustler_demo_mode";

export const DEMO_MODES: { id: DemoMode; label: string; hint: string }[] = [
  { id: "live", label: "Live API", hint: "Use FastAPI /status (falls back if offline)" },
  { id: "clear_sky", label: "Clear sky", hint: "Green — no triggers" },
  { id: "severe_rain", label: "Severe rain", hint: "Red — rain >65mm" },
  { id: "aqi_spike", label: "AQI spike", hint: "Amber → Red — AQI >400" },
  { id: "curfew_red", label: "Curfew", hint: "Red zone curfew = true" },
];

export function getDemoMode(): DemoMode {
  if (typeof window === "undefined") return "live";
  const v = localStorage.getItem(KEY) as DemoMode | null;
  if (v && DEMO_MODES.some((m) => m.id === v)) return v;
  return "live";
}

export function setDemoMode(mode: DemoMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, mode);
}

/** Fixed narratives for the 2-minute “rainstorm” demo. */
export function statusForDemoMode(mode: DemoMode): StatusPayload | null {
  switch (mode) {
    case "live":
      return null;
    case "clear_sky":
      return {
        level: "clear",
        label: "Clear conditions",
        detail: "No parametric breach. Monitoring IMD, CPCB, civic feeds.",
        rain_mm: 18,
        aqi: 120,
        curfew: false,
        activeTriggers: [],
      };
    case "severe_rain":
      return {
        level: "trigger_active",
        label: "Severe Rain",
        detail:
          "Rainfall >65mm / 24h in your zone — parametric payout pipeline started.",
        rain_mm: 72,
        aqi: 160,
        curfew: false,
        activeTriggers: ["rain_gt_65mm"],
      };
    case "aqi_spike":
      return {
        level: "trigger_active",
        label: "Severe AQI",
        detail: "CPCB AQI >400 sustained — air-quality trigger active.",
        rain_mm: 4,
        aqi: 430,
        curfew: false,
        activeTriggers: ["aqi_gt_400"],
      };
    case "curfew_red":
      return {
        level: "trigger_active",
        label: "Red zone curfew",
        detail: "Civic feed + zero platform orders — curfew trigger active.",
        rain_mm: 6,
        aqi: 90,
        curfew: true,
        activeTriggers: ["curfew_red_zone"],
      };
    default:
      return null;
  }
}
