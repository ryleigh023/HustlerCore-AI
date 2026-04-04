/** Magic-loop demo: accumulate simulated parametric payouts for analytics ROI. */
export const PARAMETRIC_DEMO_PAYOUT_INR = 280;

const STORAGE_KEY = "hustler_parametric_sim_inr";
export const PARAMETRIC_PAYOUT_EVENT = "hustler:parametric-payout";

export function getSimulatedParametricPayoutTotal(): number {
  if (typeof window === "undefined") return 0;
  const v = sessionStorage.getItem(STORAGE_KEY);
  const n = v ? Number(v) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Called when backend reports a new trigger edge; bumps protected-income simulation. */
export function recordParametricPayoutAmount(amount: number = PARAMETRIC_DEMO_PAYOUT_INR): void {
  if (typeof window === "undefined") return;
  const next = getSimulatedParametricPayoutTotal() + amount;
  sessionStorage.setItem(STORAGE_KEY, String(next));
  window.dispatchEvent(
    new CustomEvent(PARAMETRIC_PAYOUT_EVENT, { detail: { amount } }),
  );
}
