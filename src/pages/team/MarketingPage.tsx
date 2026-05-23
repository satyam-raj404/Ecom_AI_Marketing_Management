import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PLATFORMS = [
  {
    key: "linkedin", name: "LinkedIn", emoji: "💼", accent: "#0A66C2",
    goal: "Investor awareness + founder credibility",
    freq: "5x/week (Mon–Fri)", times: "8–10 AM, 7–8 PM IST",
    mix: ["Founder POV (×2)", "Customer story (×1)", "Industry insight (×1)", "Behind-the-scenes (×1)"],
    hooks: ["₹2,40,000. Gone.", "Why ₹5Cr wholesalers get worse software than ₹50K IG sellers", "Week 6 honest update"],
  },
  {
    key: "instagram", name: "Instagram", emoji: "📸", accent: "#E4405F",
    goal: "Customer awareness + community building",
    freq: "7x/week (1 post + 1 reel daily)", times: "11 AM–1 PM, 7–9 PM IST",
    mix: ["Reels (×2)", "Carousels (×2)", "Memes (×2)", "Story (×1)"],
    hooks: ["₹80,000 saved. Day 1.", "Wholesaler starter pack 😂", "Your godown has ₹3L sleeping"],
    reels: ["POV: wholesaler in 2026", "Before vs After EcomBharat", "Things AICA answers that Tally can't", "Sharma-ji's ₹2.4L mistake", "Day in the life of a pilot user"],
  },
  {
    key: "facebook", name: "Facebook", emoji: "📘", accent: "#1877F2",
    goal: "Reach 35–60 age Tier 2–3 MSME owners",
    freq: "4x/week", times: "7–9 PM IST, weekend mornings",
    mix: ["Hinglish stories (60%)", "Customer wins (20%)", "Industry news (20%)"],
    hooks: ["Ek wholesaler bhai ki sacchi kahani", "Kya aapka bhi yehi haal hai?", "Sharma-ji ne ₹80,000 bachaya"],
    groups: ["Indian MSME Network", "FMCG Distributors India", "Mandi Wholesalers Forum"],
  },
  {
    key: "twitter", name: "X / Twitter", emoji: "🐦", accent: "#000000",
    goal: "Build-in-public + investor visibility",
    freq: "2x/day", times: "9 AM, 9 PM IST",
    mix: ["1 insight tweet", "1 reply to relevant thread", "1 thread/week (Sunday)"],
    hooks: ["₹4.8L Cr lost annually", "Hardest engineering problem we faced", "Our pilot's Day 1 timeline"],
  },
] as const;

const TYPE_COLOR: Record<string, string> = {
  demo: "#F59E0B", "pilot-checkin": "#22C55E", "team-sync": "#0A66C2", content: "#E4405F", other: "#94A3B8",
};

type CalEvent = { start_time: string | null; type: string | null; title: string | null };

export default function MarketingPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedTs, setSelectedTs] = useState<number | null>(null);
  const now = new Date();

  useEffect(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59).toISOString();
    supabase.from("calendar_events").select("start_time,type,title")
      .gte("start_time", start).lte("start_time", end)
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">Marketing Plan</h1>
        <p className="text-sm text-ledger/60">Click card header to expand. Platform strategy for EcomBharat.</p>
      </header>

      <div className="space-y-3">
        {PLATFORMS.map((p, idx) => (
          <details key={p.key} open={idx === 0}
            className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
            <summary className="flex cursor-pointer select-none items-center gap-3 p-5 hover:bg-cream/60 transition"
              style={{ borderLeft: `4px solid ${p.accent}` }}>
              <span className="text-xl">{p.emoji}</span>
              <span className="font-semibold text-ledger flex-1">{p.name}</span>
              <span className="text-xs text-ledger/50 hidden sm:block">{p.times}</span>
              <span className="text-xs font-medium text-ledger/70">{p.freq}</span>
            </summary>

            <div className="px-5 pb-5 space-y-4 border-t border-ledger/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <Stat label="Goal" value={p.goal} />
                <Stat label="Frequency" value={p.freq} />
                <Stat label="Best Times" value={p.times} />
              </div>
              <Bullets title="CONTENT MIX" items={[...p.mix]} />
              <Bullets title="HOOKS THAT WORK" items={p.hooks.map(h => `"${h}"`)} />
              {"reels" in p && <Bullets title="REEL IDEAS" items={[...(p as any).reels]} />}
              {"groups" in p && <Bullets title="GROUPS TO JOIN" items={[...(p as any).groups]} />}
            </div>
          </details>
        ))}
      </div>

      <MiniCalendar events={events} selectedTs={selectedTs} onSelect={setSelectedTs} now={now} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-ledger/40 mb-1">{label}</div>
      <p className="text-sm text-ledger">{value}</p>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-ledger/40 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ledger/80 flex gap-2"><span className="text-ledger/30 shrink-0">•</span>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MiniCalendar({ events, selectedTs, onSelect, now }: {
  events: CalEvent[]; selectedTs: number | null; onSelect: (ts: number | null) => void; now: Date;
}) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const label = now.toLocaleString("default", { month: "long", year: "numeric" });

  const byDay: Record<number, CalEvent[]> = {};
  events.forEach((e) => {
    if (!e.start_time) return;
    const d = new Date(e.start_time).getDate();
    byDay[d] = [...(byDay[d] ?? []), e];
  });

  const selDateStr = selectedTs ? new Date(selectedTs).toDateString() : null;
  const selEvents = selDateStr ? events.filter(e => e.start_time && new Date(e.start_time).toDateString() === selDateStr) : [];

  return (
    <div className="card">
      <h2 className="text-lg text-ledger mb-4">{label} Schedule</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-ledger/40 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDow).fill(null).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const evts = byDay[day] ?? [];
          const isToday = day === now.getDate();
          const ts = new Date(year, month, day).getTime();
          return (
            <button key={day} onClick={() => onSelect(selectedTs === ts ? null : ts)}
              className={`rounded-md py-1 text-xs text-ledger transition hover:bg-khadi min-h-[36px] flex flex-col items-center justify-start pt-1
                ${isToday ? "bg-marigold/10 font-bold" : ""}
                ${selectedTs === ts ? "ring-2 ring-marigold ring-offset-1" : ""}`}>
              {day}
              {evts.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {evts.slice(0, 4).map((e, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLOR[e.type ?? "other"] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selEvents.length > 0 && (
        <div className="mt-4 border-t border-ledger/10 pt-3 space-y-1">
          {selEvents.map((e, i) => (
            <div key={i} className="text-sm text-ledger flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR[e.type ?? "other"] }} />
              <span>{e.title ?? e.type}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-4 flex-wrap text-xs text-ledger/50">
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />{type}
          </span>
        ))}
      </div>
    </div>
  );
}
