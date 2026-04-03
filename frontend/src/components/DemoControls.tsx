"use client";

import { DEMO_MODES, getDemoMode, setDemoMode } from "@/lib/demo";
import type { DemoMode } from "@/lib/types";
import clsx from "clsx";
import { useState } from "react";

export function DemoControls({ onModeChange }: { onModeChange?: () => void }) {
  const [mode, setMode] = useState<DemoMode>(() => getDemoMode());

  function select(m: DemoMode) {
    setDemoMode(m);
    setMode(m);
    onModeChange?.();
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-200/90">
        Demo mode (offline-safe)
      </p>
      <p className="mt-1 text-xs text-slate-400">
        War Room backup: no live weather required. Use &quot;Severe rain&quot; for the
        red widget + ₹280 processing toast.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {DEMO_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => select(m.id)}
            title={m.hint}
            className={clsx(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              mode === m.id
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                : "bg-slate-800/80 text-slate-200 hover:bg-slate-700",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
