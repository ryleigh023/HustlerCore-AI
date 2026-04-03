"use client";

import { fetchStatus } from "@/lib/api";
import { payoutForTier } from "@/lib/premiums";
import type { StatusLevel, WeeklyTier } from "@/lib/types";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function stylesForLevel(level: StatusLevel): {
  bar: string;
  text: string;
  icon: React.ReactNode;
  headline: string;
} {
  switch (level) {
    case "clear":
      return {
        bar: "from-emerald-500 to-teal-600",
        text: "text-emerald-100",
        icon: <CheckCircle2 className="size-6" aria-hidden />,
        headline: "Clear",
      };
    case "elevated_risk":
      return {
        bar: "from-amber-400 to-orange-600",
        text: "text-amber-50",
        icon: <AlertTriangle className="size-6" aria-hidden />,
        headline: "Elevated risk",
      };
    case "trigger_active":
      return {
        bar: "from-rose-600 to-red-700",
        text: "text-red-50",
        icon: <Zap className="size-6" aria-hidden />,
        headline: "Trigger active",
      };
    default:
      return stylesForLevel("clear");
  }
}

export function StatusWidget({
  tier,
  refreshKey = 0,
}: {
  tier: WeeklyTier;
  refreshKey?: number;
}) {
  const [level, setLevel] = useState<StatusLevel>("clear");
  const [label, setLabel] = useState("—");
  const [detail, setDetail] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);
  const prevLevel = useRef<StatusLevel | null>(null);
  const payout = payoutForTier(tier);

  useEffect(() => {
    prevLevel.current = null;
    let cancelled = false;
    async function load() {
      const s = await fetchStatus();
      if (cancelled) return;
      setLevel(s.level);
      setLabel(s.label);
      setDetail(s.detail);
      const was = prevLevel.current;
      if (was === null) {
        prevLevel.current = s.level;
        return;
      }
      if (was !== "trigger_active" && s.level === "trigger_active") {
        setToast(`₹${payout} processing — parametric payout started`);
        window.setTimeout(() => setToast(null), 6000);
      }
      prevLevel.current = s.level;
    }
    void load();
    const id = window.setInterval(load, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refreshKey, payout, tier]);

  const vis = stylesForLevel(level);

  return (
    <div className="relative">
      {toast ? (
        <div
          className="mb-3 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-50 shadow-lg shadow-emerald-900/20"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      <div
        className={clsx(
          "overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br shadow-xl",
          vis.bar,
        )}
      >
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <p className={clsx("text-xs font-semibold uppercase", vis.text)}>
              Quick payout status
            </p>
            <p className={clsx("mt-1 text-lg font-bold tracking-tight", vis.text)}>
              {vis.headline}
            </p>
            <p className={clsx("mt-1 text-sm opacity-95", vis.text)}>{label}</p>
            {detail ? (
              <p className={clsx("mt-2 text-xs leading-snug opacity-90", vis.text)}>
                {detail}
              </p>
            ) : null}
          </div>
          <div className={clsx("opacity-95", vis.text)}>{vis.icon}</div>
        </div>
        <div className="flex gap-1 px-3 pb-3">
          {(["clear", "elevated_risk", "trigger_active"] as const).map((k) => (
            <div
              key={k}
              className={clsx(
                "h-1 flex-1 rounded-full bg-black/20",
                level === k && "bg-white/90",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
