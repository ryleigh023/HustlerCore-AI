"use client";

import { fetchStatus } from "@/lib/api";
import { PARAMETRIC_TRIGGERS } from "@/lib/triggers";
import clsx from "clsx";
import { useEffect, useState } from "react";

export function TriggerStrip({ refreshKey = 0 }: { refreshKey?: number }) {
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const s = await fetchStatus();
      if (cancelled) return;
      setActive(s.activeTriggers ?? []);
    }
    void load();
    const id = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refreshKey]);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Parametric triggers (no manual claim)
      </p>
      <ul className="mt-3 space-y-2">
        {PARAMETRIC_TRIGGERS.map((t) => {
          const on = active.includes(t.id);
          return (
            <li
              key={t.id}
              className={clsx(
                "flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm",
                on
                  ? "border-rose-400/50 bg-rose-500/10 text-rose-50"
                  : "border-white/5 bg-white/5 text-slate-300",
              )}
            >
              <span className="font-medium">{t.title}</span>
              <span className="text-right text-xs text-slate-400">{t.rule}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
