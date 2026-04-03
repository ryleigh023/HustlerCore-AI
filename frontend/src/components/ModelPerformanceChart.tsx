"use client";

import { fetchModelPerformance } from "@/lib/api";
import type { ModelPerformancePoint } from "@/lib/types";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ModelPerformanceChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<ModelPerformancePoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const d = await fetchModelPerformance();
      if (!cancelled) setRows(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Model performance (simulation)
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Sprint stand-in for XGBoost / rule engine — shows you have an evaluation
        loop, not just UI.
      </p>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
            <YAxis
              domain={[0.7, 1]}
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 12,
              }}
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const label = String(name) === "train" ? "Train AUC" : "Val AUC";
                return [`${(v * 100).toFixed(1)}%`, label];
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="train" name="train" stroke="#38bdf8" dot={false} />
            <Line type="monotone" dataKey="val" name="val" stroke="#a78bfa" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
