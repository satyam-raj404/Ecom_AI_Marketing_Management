import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_PLATFORMS = [
  {
    key: "linkedin", name: "LinkedIn", emoji: "💼", accent: "#0A66C2",
    goal: "Investor awareness + founder credibility",
    freq: "5x/week (Mon–Fri)", times: "8–10 AM, 7–8 PM IST",
    mix: ["Founder POV (×2)", "Customer story (×1)", "Industry insight (×1)", "Behind-the-scenes (×1)"],
    hooks: ["₹2,40,000. Gone.", "Why ₹5Cr wholesalers get worse software than ₹50K IG sellers", "Week 6 honest update"],
    reels: undefined as string[] | undefined,
    groups: undefined as string[] | undefined,
  },
  {
    key: "instagram", name: "Instagram", emoji: "📸", accent: "#E4405F",
    goal: "Customer awareness + community building",
    freq: "7x/week (1 post + 1 reel daily)", times: "11 AM–1 PM, 7–9 PM IST",
    mix: ["Reels (×2)", "Carousels (×2)", "Memes (×2)", "Story (×1)"],
    hooks: ["₹80,000 saved. Day 1.", "Wholesaler starter pack 😂", "Your godown has ₹3L sleeping"],
    reels: ["POV: wholesaler in 2026", "Before vs After EcomBharat", "Things AICA answers that Tally can't", "Sharma-ji's ₹2.4L mistake", "Day in the life of a pilot user"],
    groups: undefined as string[] | undefined,
  },
  {
    key: "facebook", name: "Facebook", emoji: "📘", accent: "#1877F2",
    goal: "Reach 35–60 age Tier 2–3 MSME owners",
    freq: "4x/week", times: "7–9 PM IST, weekend mornings",
    mix: ["Hinglish stories (60%)", "Customer wins (20%)", "Industry news (20%)"],
    hooks: ["Ek wholesaler bhai ki sacchi kahani", "Kya aapka bhi yehi haal hai?", "Sharma-ji ne ₹80,000 bachaya"],
    reels: undefined as string[] | undefined,
    groups: ["Indian MSME Network", "FMCG Distributors India", "Mandi Wholesalers Forum"],
  },
  {
    key: "twitter", name: "X / Twitter", emoji: "🐦", accent: "#000000",
    goal: "Build-in-public + investor visibility",
    freq: "2x/day", times: "9 AM, 9 PM IST",
    mix: ["1 insight tweet", "1 reply to relevant thread", "1 thread/week (Sunday)"],
    hooks: ["₹4.8L Cr lost annually", "Hardest engineering problem we faced", "Our pilot's Day 1 timeline"],
    reels: undefined as string[] | undefined,
    groups: undefined as string[] | undefined,
  },
];

const TYPE_COLOR: Record<string, string> = {
  demo: "#F59E0B", "pilot-checkin": "#22C55E", "team-sync": "#0A66C2", content: "#E4405F", other: "#94A3B8",
};

type CalEvent = { start_time: string | null; type: string | null; title: string | null };

type PlatformData = {
  key: string; name: string; emoji: string; accent: string;
  goal: string; freq: string; times: string;
  mix: string[]; hooks: string[];
  reels?: string[]; groups?: string[];
};

type Goal = { id: string; text: string; done: boolean };
type MonthlyPlan = { focus: string; goals: Goal[] };

function lsGet<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mergePlatform(def: typeof DEFAULT_PLATFORMS[number], override: Partial<PlatformData>): PlatformData {
  return {
    key: def.key, name: def.name, emoji: def.emoji, accent: def.accent,
    goal: override.goal ?? def.goal,
    freq: override.freq ?? def.freq,
    times: override.times ?? def.times,
    mix: override.mix ?? [...def.mix],
    hooks: override.hooks ?? [...def.hooks],
    reels: override.reels ?? (def.reels ? [...def.reels] : undefined),
    groups: override.groups ?? (def.groups ? [...def.groups] : undefined),
  };
}

export default function MarketingPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedTs, setSelectedTs] = useState<number | null>(null);
  const [platforms, setPlatforms] = useState<PlatformData[]>(() =>
    DEFAULT_PLATFORMS.map(def => mergePlatform(def, lsGet<Partial<PlatformData>>(`mktg_p_${def.key}`, {})))
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const now = new Date();

  useEffect(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59).toISOString();
    supabase.from("calendar_events").select("start_time,type,title")
      .gte("start_time", start).lte("start_time", end)
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  function savePlatform(key: string, data: PlatformData) {
    const def = DEFAULT_PLATFORMS.find(p => p.key === key)!;
    const override: Partial<PlatformData> = {};
    if (data.goal !== def.goal) override.goal = data.goal;
    if (data.freq !== def.freq) override.freq = data.freq;
    if (data.times !== def.times) override.times = data.times;
    if (JSON.stringify(data.mix) !== JSON.stringify([...def.mix])) override.mix = data.mix;
    if (JSON.stringify(data.hooks) !== JSON.stringify([...def.hooks])) override.hooks = data.hooks;
    if (data.reels) override.reels = data.reels;
    if (data.groups) override.groups = data.groups;
    lsSet(`mktg_p_${key}`, override);
    setPlatforms(prev => prev.map(p => p.key === key ? data : p));
    setEditingKey(null);
  }

  function resetPlatform(key: string) {
    localStorage.removeItem(`mktg_p_${key}`);
    const def = DEFAULT_PLATFORMS.find(p => p.key === key)!;
    setPlatforms(prev => prev.map(p => p.key === key ? mergePlatform(def, {}) : p));
    setEditingKey(null);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">Marketing Plan</h1>
        <p className="text-sm text-ledger/60">Platform strategy for EcomBharat. Click ✎ to edit a platform.</p>
      </header>

      <div className="space-y-3">
        {platforms.map((p, idx) => (
          <PlatformCard
            key={p.key}
            platform={p}
            defaultOpen={idx === 0}
            editing={editingKey === p.key}
            onEdit={() => setEditingKey(p.key)}
            onSave={(data) => savePlatform(p.key, data)}
            onReset={() => resetPlatform(p.key)}
            onCancel={() => setEditingKey(null)}
          />
        ))}
      </div>

      <MonthlyPlanSection now={now} />

      <MiniCalendar events={events} selectedTs={selectedTs} onSelect={setSelectedTs} now={now} />
    </div>
  );
}

function PlatformCard({ platform, defaultOpen, editing, onEdit, onSave, onReset, onCancel }: {
  platform: PlatformData;
  defaultOpen: boolean;
  editing: boolean;
  onEdit: () => void;
  onSave: (data: PlatformData) => void;
  onReset: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<PlatformData>(platform);

  useEffect(() => {
    if (editing) setForm({ ...platform, mix: [...platform.mix], hooks: [...platform.hooks] });
  }, [editing]);

  const arrToText = (arr: string[] | undefined) => (arr ?? []).join("\n");
  const textToArr = (t: string) => t.split("\n").map(s => s.trim()).filter(Boolean);

  return (
    <details open={defaultOpen} className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
      <summary
        className="flex cursor-pointer select-none items-center gap-3 p-5 hover:bg-cream/60 transition"
        style={{ borderLeft: `4px solid ${platform.accent}` }}
      >
        <span className="text-xl">{platform.emoji}</span>
        <span className="font-semibold text-ledger flex-1">{platform.name}</span>
        <span className="text-xs text-ledger/50 hidden sm:block">{platform.times}</span>
        <span className="text-xs font-medium text-ledger/70">{platform.freq}</span>
        <button
          onClick={e => { e.preventDefault(); onEdit(); }}
          className="ml-2 px-2 py-1 rounded text-xs text-ledger/40 hover:text-ledger hover:bg-khadi transition"
          title="Edit platform"
        >
          ✎
        </button>
      </summary>

      <div className="px-5 pb-5 border-t border-ledger/5">
        {editing ? (
          <div className="space-y-4 mt-4">
            <EditField label="GOAL">
              <input className="input" value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
            </EditField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditField label="FREQUENCY">
                <input className="input" value={form.freq}
                  onChange={e => setForm(f => ({ ...f, freq: e.target.value }))} />
              </EditField>
              <EditField label="BEST TIMES">
                <input className="input" value={form.times}
                  onChange={e => setForm(f => ({ ...f, times: e.target.value }))} />
              </EditField>
            </div>
            <EditField label="CONTENT MIX (one per line)">
              <textarea className="input h-24 resize-none" value={arrToText(form.mix)}
                onChange={e => setForm(f => ({ ...f, mix: textToArr(e.target.value) }))} />
            </EditField>
            <EditField label="HOOKS THAT WORK (one per line)">
              <textarea className="input h-24 resize-none" value={arrToText(form.hooks)}
                onChange={e => setForm(f => ({ ...f, hooks: textToArr(e.target.value) }))} />
            </EditField>
            {form.reels !== undefined && (
              <EditField label="REEL IDEAS (one per line)">
                <textarea className="input h-24 resize-none" value={arrToText(form.reels)}
                  onChange={e => setForm(f => ({ ...f, reels: textToArr(e.target.value) }))} />
              </EditField>
            )}
            {form.groups !== undefined && (
              <EditField label="GROUPS TO JOIN (one per line)">
                <textarea className="input h-20 resize-none" value={arrToText(form.groups)}
                  onChange={e => setForm(f => ({ ...f, groups: textToArr(e.target.value) }))} />
              </EditField>
            )}
            <div className="flex gap-2 pt-2 flex-wrap">
              <button onClick={() => onSave(form)} className="btn-primary py-1.5 px-4">Save</button>
              <button onClick={onCancel} className="btn-secondary py-1.5 px-4">Cancel</button>
              <button
                onClick={onReset}
                className="ml-auto text-sm text-ledger/40 hover:text-danger px-3 py-1.5 rounded-lg hover:bg-danger/5 transition"
              >
                Reset to default
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Stat label="Goal" value={platform.goal} />
              <Stat label="Frequency" value={platform.freq} />
              <Stat label="Best Times" value={platform.times} />
            </div>
            <Bullets title="CONTENT MIX" items={platform.mix} />
            <Bullets title="HOOKS THAT WORK" items={platform.hooks.map(h => `"${h}"`)} />
            {platform.reels && <Bullets title="REEL IDEAS" items={platform.reels} />}
            {platform.groups && <Bullets title="GROUPS TO JOIN" items={platform.groups} />}
          </div>
        )}
      </div>
    </details>
  );
}

function MonthlyPlanSection({ now }: { now: Date }) {
  const [viewDate, setViewDate] = useState(now);
  const mk = monthKey(viewDate);
  const [plan, setPlan] = useState<MonthlyPlan>(() => lsGet(`mktg_plan_${mk}`, { focus: "", goals: [] }));
  const [newGoalText, setNewGoalText] = useState("");
  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(plan.focus);

  useEffect(() => {
    const loaded = lsGet<MonthlyPlan>(`mktg_plan_${mk}`, { focus: "", goals: [] });
    setPlan(loaded);
    setFocusDraft(loaded.focus);
    setNewGoalText("");
    setEditingFocus(false);
  }, [mk]);

  function save(updated: MonthlyPlan) {
    setPlan(updated);
    lsSet(`mktg_plan_${mk}`, updated);
  }

  function commitFocus() {
    save({ ...plan, focus: focusDraft });
    setEditingFocus(false);
  }

  function addGoal() {
    const text = newGoalText.trim();
    if (!text) return;
    save({ ...plan, goals: [...plan.goals, { id: crypto.randomUUID(), text, done: false }] });
    setNewGoalText("");
  }

  function toggleGoal(id: string) {
    save({ ...plan, goals: plan.goals.map(g => g.id === id ? { ...g, done: !g.done } : g) });
  }

  function deleteGoal(id: string) {
    save({ ...plan, goals: plan.goals.filter(g => g.id !== id) });
  }

  const monthLabel = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const doneCount = plan.goals.filter(g => g.done).length;
  const total = plan.goals.length;

  return (
    <div className="card">
      {/* Header with month nav */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-cream transition text-ledger/50 hover:text-ledger text-lg leading-none"
        >
          ‹
        </button>
        <h2 className="text-lg text-ledger flex-1 text-center">{monthLabel} — Monthly Plan</h2>
        <button
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-cream transition text-ledger/50 hover:text-ledger text-lg leading-none"
        >
          ›
        </button>
      </div>

      {/* Monthly focus */}
      <div className="mb-5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-ledger/40 mb-1.5">
          Monthly Focus / Theme
        </div>
        {editingFocus ? (
          <input
            className="input"
            value={focusDraft}
            autoFocus
            placeholder="e.g. 'Pilot launch push — 10 demos this month'"
            onChange={e => setFocusDraft(e.target.value)}
            onBlur={commitFocus}
            onKeyDown={e => { if (e.key === "Enter") commitFocus(); if (e.key === "Escape") { setFocusDraft(plan.focus); setEditingFocus(false); } }}
          />
        ) : (
          <button
            onClick={() => { setFocusDraft(plan.focus); setEditingFocus(true); }}
            className="text-sm text-ledger/80 text-left w-full rounded-lg bg-cream p-3 hover:bg-khadi transition min-h-[42px]"
          >
            {plan.focus || <span className="text-ledger/30 italic">Click to set monthly focus...</span>}
          </button>
        )}
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-ledger/40">Goals</div>
          {total > 0 && (
            <span className="text-[10px] text-ledger/40 ml-auto">
              {doneCount}/{total} done
            </span>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="w-full h-1.5 bg-cream rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-marigold rounded-full transition-all"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
        )}

        <ul className="space-y-2 mb-3">
          {plan.goals.map(goal => (
            <li key={goal.id} className="flex items-start gap-2.5 group">
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`mt-0.5 w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition
                  ${goal.done
                    ? "bg-marigold border-marigold text-white"
                    : "border-ledger/20 hover:border-marigold"
                  }`}
              >
                {goal.done && <span className="text-[9px] leading-none font-bold">✓</span>}
              </button>
              <span className={`text-sm flex-1 leading-5 ${goal.done ? "line-through text-ledger/30" : "text-ledger/80"}`}>
                {goal.text}
              </span>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 text-ledger/30 hover:text-danger text-xs transition mt-0.5 px-1"
                title="Delete goal"
              >
                ✕
              </button>
            </li>
          ))}
          {plan.goals.length === 0 && (
            <li className="text-sm text-ledger/30 italic py-1">No goals yet — add one below.</li>
          )}
        </ul>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add a goal for this month..."
            value={newGoalText}
            onChange={e => setNewGoalText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addGoal(); }}
          />
          <button onClick={addGoal} className="btn-primary px-4 py-2">+ Add</button>
        </div>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-ledger/40 mb-1">{label}</div>
      {children}
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
          <li key={i} className="text-sm text-ledger/80 flex gap-2">
            <span className="text-ledger/30 shrink-0">•</span>{item}
          </li>
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
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => <div key={i}>{d}</div>)}
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
