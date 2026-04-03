"use client";

import { loadProfile, postInquiry } from "@/lib/api";
import clsx from "clsx";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string; lang: "en" | "hi" };

const HINDI_SUGGESTIONS = [
  "Aaj baarish mein coverage milega?",
  "मेरा प्रीमियम इस हफ्ते कितना है?",
];

export default function ChatPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      lang: "en",
      text: "Ask in Hindi or English — payouts are parametric (no manual adjuster).",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadProfile()) router.replace("/onboarding");
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: t, lang }]);
    const { reply } = await postInquiry({ message: t, lang });
    setMsgs((m) => [...m, { role: "assistant", text: reply, lang }]);
  }

  return (
    <div className="flex min-h-[70vh] flex-col pb-4">
      <div>
        <h1 className="text-lg font-bold text-white">Claim inquiry</h1>
        <p className="mt-1 text-sm text-slate-400">
          Natural language (DistilBERT on Person A) — Hindi/English preview.
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {(["en", "hi"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase",
              lang === l
                ? "bg-sky-500 text-slate-950"
                : "bg-white/5 text-slate-400",
            )}
          >
            {l === "en" ? "English" : "हिंदी"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {HINDI_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setLang("hi");
              void send(s);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-left text-xs text-sky-100 hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/50 p-3">
        {msgs.map((m, i) => (
          <div
            key={`${i}-${m.text.slice(0, 12)}`}
            className={clsx(
              "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto bg-sky-500/20 text-slate-50"
                : "mr-auto bg-white/5 text-slate-200",
            )}
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-50 outline-none ring-sky-500/30 focus:ring-2"
          placeholder={lang === "hi" ? "हिंदी में पूछें…" : "Ask anything…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-sky-500 px-4 py-3 text-slate-950"
          aria-label="Send"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
