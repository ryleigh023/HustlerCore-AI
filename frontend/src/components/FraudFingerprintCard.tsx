"use client";

import { Fingerprint } from "lucide-react";

/** Phase 3 preview — 7-signal behavioral fingerprint (MSBS) for judge Q&A. */
const SIGNALS = [
  { name: "GPS zone match", state: "ok", detail: "Within registered polygon" },
  { name: "Wi‑Fi SSID stability", state: "ok", detail: "Consistent with history" },
  { name: "Device health / root", state: "ok", detail: "No tamper flags" },
  { name: "Platform activity", state: "ok", detail: "Order stream vs. trigger time" },
  { name: "Velocity / pattern", state: "watch", detail: "Claim frequency normal" },
  { name: "Multi-source trigger", state: "ok", detail: "IMD + platform corroboration" },
  { name: "Session / SIM consistency", state: "ok", detail: "No SIM swap in window" },
] as const;

export function FraudFingerprintCard() {
  const msbs = 0.22;
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2">
        <Fingerprint className="size-5 text-violet-300" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            7-signal behavioral fingerprint
          </p>
          <p className="text-[11px] text-slate-500">
            Mock MSBS {msbs.toFixed(2)} — Tier 1 auto-approve when &lt;0.30 (Phase 3 depth).
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {SIGNALS.map((s) => (
          <li
            key={s.name}
            className="flex items-start justify-between gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs"
          >
            <span className="font-medium text-slate-200">{s.name}</span>
            <span className="text-right text-slate-500">
              <span
                className={
                  s.state === "ok"
                    ? "text-emerald-400"
                    : s.state === "watch"
                      ? "text-amber-300"
                      : "text-rose-300"
                }
              >
                {s.state === "ok" ? "Pass" : s.state === "watch" ? "Watch" : "Flag"}
              </span>
              <span className="block text-[10px] text-slate-600">{s.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-snug text-slate-600">
        Parametric payouts have <strong className="text-slate-400">no manual adjuster</strong> — fraud
        scoring gates batch release, not worker blame.
      </p>
    </section>
  );
}
