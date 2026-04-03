"use client";

import { loadProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const p = loadProfile();
    router.replace(p ? "/dashboard" : "/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-slate-400">
      <p className="text-sm">Opening HustlerCore…</p>
    </div>
  );
}
