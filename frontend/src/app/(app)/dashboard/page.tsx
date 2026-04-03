"use client";

import { DemoControls } from "@/components/DemoControls";
import { ModelPerformanceChart } from "@/components/ModelPerformanceChart";
import { PolicyCard } from "@/components/PolicyCard";
import { StatusWidget } from "@/components/StatusWidget";
import { TriggerStrip } from "@/components/TriggerStrip";
import { loadProfile } from "@/lib/api";
import type { WorkerProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
  }, [router]);

  if (!profile) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">Loading policy…</div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <PolicyCard
        tier={profile.weeklyTier}
        zoneRisk={profile.zoneRisk}
        refreshKey={refresh}
      />
      <StatusWidget tier={profile.weeklyTier} refreshKey={refresh} />
      <TriggerStrip refreshKey={refresh} />
      <ModelPerformanceChart refreshKey={refresh} />
      <DemoControls onModeChange={() => setRefresh((x) => x + 1)} />
      <p className="text-center text-[11px] leading-relaxed text-slate-600">
        Person A: poll <code className="text-slate-500">GET /status</code> every 2s. Admin
        rain demo flips the backend; use demo modes if the API is offline.
      </p>
    </div>
  );
}
