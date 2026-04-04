"use client";

import { fetchStatus } from "@/lib/api";
import {
  PARAMETRIC_DEMO_PAYOUT_INR,
  recordParametricPayoutAmount,
} from "@/lib/parametricPayout";
import { isSupabaseConfigured, subscribePayoutStatus } from "@/lib/supabase";
import type { StatusLevel, StatusPayload, WeeklyTier } from "@/lib/types";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Radio, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  refreshKey = 0,
}: {
  /** Kept for API compatibility with dashboard; payout demo uses ₹280 from backend loop. */
  tier?: WeeklyTier;
  refreshKey?: number;
}) {
  const [level, setLevel] = useState<StatusLevel>("clear");
  const [label, setLabel] = useState("—");
  const [detail, setDetail] = useState<string | undefined>();
  const [realtime, setRealtime] = useState<"off" | "live" | "err">("off");
  const prevLevel = useRef<StatusLevel | null>(null);

  const applyPayload = useCallback((s: StatusPayload) => {
    setLevel(s.level);
    setLabel(s.label);
    setDetail(s.detail);
    const was = prevLevel.current;
    if (was === null) {
      prevLevel.current = s.level;
      return;
    }
    if (was !== "trigger_active" && s.level === "trigger_active") {
      toast.error("Extreme Weather Detected: Payout of ₹280 Initiated", {
        duration: 8000,
      });
      recordParametricPayoutAmount(PARAMETRIC_DEMO_PAYOUT_INR);
    }
    prevLevel.current = s.level;
  }, []);

  useEffect(() => {
    prevLevel.current = null;
    let cancelled = false;
    async function load() {
      const s = await fetchStatus();
      if (cancelled) return;
      applyPayload(s);
    }
    void load();
    const id = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refreshKey, applyPayload]);

  /** Supabase Realtime broadcast — zero-touch loop when Person A pushes status. */
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      queueMicrotask(() => setRealtime("off"));
      return;
    }
    const unsub = subscribePayoutStatus(
      (s) => applyPayload(s),
      (st) => {
        if (st === "SUBSCRIBED") queueMicrotask(() => setRealtime("live"));
        if (st === "CHANNEL_ERROR") queueMicrotask(() => setRealtime("err"));
        if (st === "CLOSED") queueMicrotask(() => setRealtime("off"));
      },
    );
    return unsub;
  }, [refreshKey, applyPayload]);

  const vis = stylesForLevel(level);

  return (
    <div className="relative">
      <div
        className={clsx(
          "overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br shadow-xl",
          vis.bar,
        )}
      >
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className={clsx("text-xs font-semibold uppercase", vis.text)}>
                Quick payout status
              </p>
              {realtime === "live" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white">
                  <Radio className="size-3" aria-hidden />
                  Supabase realtime
                </span>
              ) : null}
              {realtime === "err" ? (
                <span className="text-[10px] text-amber-200/90">Realtime error — polling</span>
              ) : null}
            </div>
            <p className={clsx("mt-1 text-lg font-bold tracking-tight", vis.text)}>
              {vis.headline}
            </p>
            {level === "trigger_active" ? (
              <p
                className={clsx(
                  "mt-2 inline-flex rounded-lg border border-amber-400/50 bg-amber-500/20 px-2.5 py-1 text-sm font-bold tracking-tight text-amber-100",
                )}
              >
                ₹{PARAMETRIC_DEMO_PAYOUT_INR} Processing
              </p>
            ) : null}
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
