import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getDemoMode } from "./demo";
import type { StatusPayload } from "./types";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.length > 0 && key.length > 0);
}

function getBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  return browserClient;
}

/**
 * War Room §4: optional Supabase Realtime for instant widget updates when
 * `trigger === 1`. Person A should `channel.send({ type: 'broadcast', event: 'status', payload })`
 * from FastAPI or a DB trigger. Polling remains the fallback.
 */
export function subscribePayoutStatus(
  onStatus: (payload: StatusPayload) => void,
  onChannelState?: (state: "SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR") => void,
): () => void {
  const supabase = getBrowserClient();
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
    .channel("hustler-payout-status")
    .on(
      "broadcast",
      { event: "status" },
      ({ payload }) => {
        if (getDemoMode() !== "live") return;
        const p = payload as StatusPayload;
        if (p?.level) onStatus(p);
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") onChannelState?.("SUBSCRIBED");
      if (status === "CHANNEL_ERROR") onChannelState?.("CHANNEL_ERROR");
      if (status === "CLOSED") onChannelState?.("CLOSED");
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
