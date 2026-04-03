"use client";

import { fetchClaims } from "@/lib/api";
import { loadProfile } from "@/lib/api";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClaimsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchClaims>>>([]);

  useEffect(() => {
    if (!loadProfile()) router.replace("/onboarding");
    void (async () => setRows(await fetchClaims()))();
  }, [router]);

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-lg font-bold text-white">Claim history</h1>
        <p className="mt-1 text-sm text-slate-400">
          Parametric payouts — Tier 1 auto-approved vs Tier 3 human review.
        </p>
      </div>
      <ul className="space-y-3">
        {rows.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-100">{c.event}</p>
                <p className="text-xs text-slate-500">{c.date}</p>
              </div>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  c.tier === 1
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-200",
                )}
              >
                Tier {c.tier}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {c.status === "auto_approved" ? "Auto-approved" : "Human review"}
              </span>
              <span className="font-semibold text-white">
                {c.amount > 0 ? `₹${c.amount}` : "—"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
