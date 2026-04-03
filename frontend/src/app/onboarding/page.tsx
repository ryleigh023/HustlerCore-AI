"use client";

import { persistProfile, registerWorker } from "@/lib/api";
import { WEEKLY_TIERS } from "@/lib/premiums";
import type { WeeklyTier } from "@/lib/types";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PERSONA_FOOD = "food" as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [tier, setTier] = useState<WeeklyTier>(99);
  const [zoneRisk, setZoneRisk] = useState(0.55);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canNext = useMemo(() => {
    if (step === 1) return phone.length >= 10 && otp.length === 6 && name.trim().length > 1;
    return true;
  }, [step, phone, otp, name]);

  async function finish() {
    setBusy(true);
    setErr(null);
    const profile = {
      name: name.trim(),
      phone,
      persona: PERSONA_FOOD,
      weeklyTier: tier,
      zoneRisk,
      onboardedAt: new Date().toISOString(),
    };
    persistProfile(profile);
    await registerWorker({
      name: profile.name,
      phone: profile.phone,
      persona: profile.persona,
      weekly_plan_inr: tier,
      zone_risk: zoneRisk,
    });
    setBusy(false);
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-950 px-4 pb-10 pt-8 text-slate-50">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300/90">
          HustlerCore
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Protect your week</h1>
        <p className="mt-2 text-sm text-slate-400">
          Weekly tiers ₹49 / ₹99 / ₹149 — parametric triggers, zero manual claims.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          For food delivery partners (e.g. Zomato / Swiggy).
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-1 flex-1 rounded-full",
              step >= s ? "bg-sky-500" : "bg-slate-800",
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <section className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Full name</label>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-50 outline-none ring-sky-500/40 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Arjun"
            autoComplete="name"
          />
          <label className="block text-sm font-medium text-slate-300">Phone</label>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-50 outline-none ring-sky-500/40 focus:ring-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            placeholder="9876543210"
          />
          <label className="block text-sm font-medium text-slate-300">
            OTP (demo — any 6 digits)
          </label>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 tracking-widest text-slate-50 outline-none ring-sky-500/40 focus:ring-2"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="••••••"
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <p className="text-sm text-slate-400">Weekly plan (matches payout cycle)</p>
          <div className="grid gap-3">
            {WEEKLY_TIERS.map((w) => (
              <button
                key={w.tier}
                type="button"
                onClick={() => setTier(w.tier)}
                className={clsx(
                  "rounded-2xl border px-4 py-4 text-left transition",
                  tier === w.tier
                    ? "border-sky-400/60 bg-sky-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <p className="font-semibold">{w.label}</p>
                <p className="text-sm text-slate-300">
                  ₹{w.tier}/week · up to ₹{w.payoutDay}/disruption day
                </p>
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">
              Hyper-local zone risk (drives ±₹5 premium)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(zoneRisk * 100)}
              onChange={(e) => setZoneRisk(Number(e.target.value) / 100)}
              className="mt-2 w-full accent-sky-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Risk score proxy: {(zoneRisk * 100).toFixed(0)}% — used with Person A
              /calculate-premium
            </p>
            {tier === 49 ? (
              <p className="mt-2 text-xs text-sky-200/90">
                War Room deck: slide toward a <strong>low-risk</strong> zone (~25%) to show
                Basic Shield <strong>₹49 → ₹47</strong> (Δ −₹2, within ±₹5).
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {err ? <p className="text-sm text-rose-400">{err}</p> : null}

      <div className="mt-8 flex gap-3">
        {step > 1 ? (
          <button
            type="button"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-200"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center rounded-xl border border-white/10 py-3 text-center text-sm text-slate-400"
          >
            Skip (dev)
          </Link>
        )}
        {step < 2 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void finish()}
            className="flex flex-1 items-center justify-center rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Activate shield"}
          </button>
        )}
      </div>
    </div>
  );
}
