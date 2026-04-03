/** Parametric rules for judge narrative (3–5 automated triggers). */
export const PARAMETRIC_TRIGGERS = [
  {
    id: "rain_gt_65mm",
    title: "Monsoon rainfall",
    rule: "Rain > 65mm / 24h (IMD band)",
  },
  {
    id: "aqi_gt_400",
    title: "Severe air quality",
    rule: "AQI > 400 sustained (CPCB)",
  },
  {
    id: "curfew_red_zone",
    title: "Civic curfew",
    rule: "Red-zone curfew + zero orders",
  },
  {
    id: "heat_extreme",
    title: "Extreme heat",
    rule: "Heat action + IMD red (demo)",
  },
  {
    id: "flash_flood_watch",
    title: "Flash flood watch",
    rule: "NDMA warning for registered zone",
  },
] as const;
