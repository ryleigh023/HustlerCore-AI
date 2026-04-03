"use client";

import { fetchPremiumQuote } from "@/lib/api";
import { WEEKLY_TIERS, renewalDateISO } from "@/lib/premiums";
import type { PremiumQuote, WeeklyTier } from "@/lib/types";
import { CalendarDays, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";

export function PolicyCard({
  tier,
  zoneRisk,
  refreshKey = 0,
}: {
  tier: WeeklyTier;
  zoneRisk: number;
  refreshKey?: number;
}) {
  const [q, setQ] = useState<PremiumQuote | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const quote = await fetchPremiumQuote(tier, zoneRisk);
      if (!cancelled) setQ(quote);
    })();
    return () => {
      cancelled = true;
    };
  }, [tier, zoneRisk, refreshKey]);

  const plan = WEEKLY_TIERS.find((w) => w.tier === tier);

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-lg shadow-sky-900/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Active policy
      </p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-white">{plan?.label ?? "Shield"}</h2>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
          Weekly billing
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-slate-200">
        <IndianRupee className="size-4 text-sky-400" aria-hidden />
        <div>
          <p className="text-xs text-slate-500">This week (risk-adjusted)</p>
          <p className="text-2xl font-bold tracking-tight">
            {q ? (
              <>
                ₹{q.adjustedInr}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  base ₹{q.baseInr}
                </span>
              </>
            ) : (
              "…"
            )}
          </p>
          {q ? (
            <p className="mt-1 text-xs text-slate-500">
              {q.zoneLabel} · risk score {q.riskScore} (heuristic ±₹5)
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-300">
        <CalendarDays className="size-4 text-slate-400" aria-hidden />
        <div>
          <p className="text-xs text-slate-500">Next renewal</p>
          <p className="font-medium">
            {new Date(renewalDateISO()).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
