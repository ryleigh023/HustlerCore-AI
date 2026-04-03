"use client";

import { fetchAnalytics } from "@/lib/api";
import { loadProfile } from "@/lib/api";
import type { AnalyticsPayload } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    if (!loadProfile()) router.replace("/onboarding");
    void (async () => setData(await fetchAnalytics()))();
  }, [router]);

  if (!data) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">Loading analytics…</div>
    );
  }

  const roi = [
    { name: "Protected", value: data.incomeProtected },
    { name: "Lost (uninsured)", value: data.incomeLost },
  ];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-lg font-bold text-white">Income analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Income protected vs lost — plus a 30-day disruption forecast (mock / API).
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Protected vs lost
        </p>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roi}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} name="₹" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          30-day disruption forecast
        </p>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.forecast30d}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="disruptionRisk"
                name="Risk index"
                stroke="#a78bfa"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
