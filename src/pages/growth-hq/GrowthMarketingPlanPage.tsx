import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CALENDAR_SEED } from "@/constants/growthHqSeed";
import { toast } from "sonner";

type CalRow = { id: string; day: string; platform: string; ecg_type: string; content: string; format: string; status: string; sort_order: number };
const PLATFORMS = ["LinkedIn", "Instagram", "Facebook", "X", "WhatsApp"];
const FORMATS = ["Reel", "Carousel", "Video", "Post"];
const ECG_TYPES = ["EVERGREEN", "CONTROVERSY", "GROWTH"];
const STATUSES = ["Planned", "Scripted", "Posted", "Skipped"];
const db = supabase as any;

const STATUS_STYLE: Record<string, string> = {
  Planned: "bg-ledger/10 text-ledger/60",
  Scripted: "bg-amber-100 text-amber-800",
  Posted: "bg-success/15 text-success",
  Skipped: "bg-danger/10 text-danger",
};

const ECG_STYLE: Record<string, string> = {
  EVERGREEN: "bg-success/10 text-success",
  CONTROVERSY: "bg-amber-100 text-amber-800",
  GROWTH: "bg-marigold/10 text-marigold",
};

export default function GrowthMarketingPlanPage() {
  const [calendar, setCalendar] = useState<CalRow[]>([]);

  const load = async () => {
    const { data, error } = await db.from("ghq_calendar").select("*").order("sort_order");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_calendar").insert(CALENDAR_SEED); load(); return; }
    setCalendar(data);
  };

  useEffect(() => { load(); }, []);

  const updateCell = async (id: string, field: string, value: string) => {
    setCalendar(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    await db.from("ghq_calendar").update({ [field]: value }).eq("id", id);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">📣 Marketing Plan</h1>
        <p className="text-sm text-ledger/60">Reference + editable 4-week content calendar.</p>
      </header>

      {/* Section 1 */}
      <details open className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
        <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-ledger hover:bg-cream/60">
          1 — The Mission
        </summary>
        <div className="px-5 pb-5 border-t border-ledger/5 text-sm text-ledger/80 space-y-2 pt-4">
          <p>Build a <strong>pre-launch demand wave</strong>. Target <strong>100–200 pilot pre-registrations</strong> from Odisha, Bengaluru, and Jharkhand before product launch.</p>
          <p>Budget: <strong>&lt;₹10,000/month</strong> (organic-first, zero paid ads until we hit 50 pilot users).</p>
          <p>Primary channels: Instagram reels, LinkedIn build-in-public, Facebook groups, WhatsApp nurture.</p>
          <p>Lead magnet: <strong>Bad Debt Calculator</strong> — free tool that shows a distributor exactly how much money they have stuck in udhaar.</p>
        </div>
      </details>

      {/* Section 2 */}
      <details open className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
        <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-ledger hover:bg-cream/60">
          2 — ECG Content Rule
        </summary>
        <div className="px-5 pb-5 border-t border-ledger/5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Evergreen", pct: "50%", color: "border-success/40 bg-success/5 text-success", desc: "Timeless content that attracts followers and builds authority. Always works, never expires.", eg: "5 signs your udhaar is out of control, Day in the life of a wholesaler, Tally vs EcomBharat honest comparison" },
              { label: "Controversy / Moment", pct: "20%", color: "border-amber-400/40 bg-amber-50 text-amber-800", desc: "Opinion pieces, hot takes, trending topics. Drive comments and shares.", eg: "Hot take: Tally made bad debt worse, Unpopular opinion: WhatsApp groups kill margins, The ₹4.8 Lakh Cr problem" },
              { label: "Growth", pct: "30%", color: "border-marigold/40 bg-marigold/5 text-marigold", desc: "Directly drives signups, demos, and conversions. CTAs, testimonials, pilot stories.", eg: "Join the first 100 pilot users, Bad Debt Calculator CTA, Pilot user testimonial reel" },
            ].map(({ label, pct, color, desc, eg }) => (
              <div key={label} className={`rounded-xl border p-4 ${color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{label}</span>
                  <span className="text-lg font-bold">{pct}</span>
                </div>
                <p className="text-xs leading-relaxed mb-2 opacity-80">{desc}</p>
                <p className="text-xs opacity-60 italic">{eg}</p>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Section 3 */}
      <details className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
        <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-ledger hover:bg-cream/60">
          3 — Platform Playbook
        </summary>
        <div className="px-5 pb-5 border-t border-ledger/5 pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-ledger/40 border-b border-ledger/10">
                <th className="pb-2 pr-6">Platform</th>
                <th className="pb-2 pr-6">Frequency</th>
                <th className="pb-2 pr-6">Best Times (IST)</th>
                <th className="pb-2">Primary Goal</th>
              </tr>
            </thead>
            <tbody className="text-ledger/80">
              {[
                ["Instagram", "7x/week (1 post + 1 reel/day)", "11 AM–1 PM, 7–9 PM", "Customer awareness + community"],
                ["Facebook", "4x/week", "7–9 PM, weekend mornings", "Reach 35–60 age Tier 2–3 MSME owners"],
                ["LinkedIn", "5x/week (Mon–Fri)", "8–10 AM, 7–8 PM", "Investor awareness + founder credibility"],
                ["X / Twitter", "2x/day", "9 AM, 9 PM", "Build-in-public + investor visibility"],
                ["WhatsApp", "2x/week broadcast", "Tuesday + Friday evenings", "Nurture waitlist, weekly tips"],
              ].map(([p, f, t, g]) => (
                <tr key={p as string} className="border-b border-ledger/5">
                  <td className="py-2 pr-6 font-semibold">{p}</td>
                  <td className="py-2 pr-6">{f}</td>
                  <td className="py-2 pr-6 text-ledger/60">{t}</td>
                  <td className="py-2 text-ledger/60">{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Section 4 — Editable Calendar */}
      <details open className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
        <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-ledger hover:bg-cream/60">
          4 — 4-Week Content Calendar (editable)
        </summary>
        <div className="border-t border-ledger/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-khadi/50">
              <tr className="text-left text-[10px] uppercase tracking-wider text-ledger/50">
                <th className="px-4 py-3 min-w-[120px]">Day</th>
                <th className="px-4 py-3 min-w-[110px]">Platform</th>
                <th className="px-4 py-3 min-w-[120px]">ECG Type</th>
                <th className="px-4 py-3 min-w-[240px]">Content Idea</th>
                <th className="px-4 py-3 min-w-[100px]">Format</th>
                <th className="px-4 py-3 min-w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {calendar.map(row => (
                <tr key={row.id} className="border-t border-ledger/5 hover:bg-cream/30">
                  <td className="px-4 py-2 text-ledger/60 text-xs">{row.day}</td>
                  <td className="px-3 py-2">
                    <CalSelect value={row.platform} options={PLATFORMS} onChange={v => updateCell(row.id, "platform", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ECG_STYLE[row.ecg_type] ?? ""}`}>{row.ecg_type}</span>
                  </td>
                  <td className="px-3 py-2">
                    <CalInlineInput value={row.content} onChange={v => updateCell(row.id, "content", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <CalSelect value={row.format} options={FORMATS} onChange={v => updateCell(row.id, "format", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className={`rounded-md text-xs py-1 px-2 border-0 font-medium cursor-pointer ${STATUS_STYLE[row.status] ?? STATUS_STYLE.Planned}`}
                      value={row.status}
                      onChange={e => updateCell(row.id, "status", e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Section 5 */}
      <details className="rounded-xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
        <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-ledger hover:bg-cream/60">
          5 — Creator DNA
        </summary>
        <div className="px-5 pb-5 border-t border-ledger/5 pt-4 text-sm text-ledger/80">
          <p className="mb-3 font-medium text-ledger">Brand Positioning Statement:</p>
          <blockquote className="border-l-4 border-marigold pl-4 py-2 bg-cream rounded-r-lg italic text-base text-ledger">
            "EcomBharat AI helps <strong>Indian wholesale distributors</strong> stop losing money to bad debt — by replacing WhatsApp + Tally patchwork with a <strong>real-time, mobile-first udhaar tracker</strong> that shows exactly who owes what, alerts before it's too late, and helps you recover what's yours — <strong>in under 10 minutes from now</strong>."
          </blockquote>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-cream p-3">
              <p className="text-[10px] uppercase tracking-wider text-ledger/40 mb-1">Voice</p>
              <p>Direct, honest, Hinglish-friendly. Like a trusted industry peer, not a startup.</p>
            </div>
            <div className="rounded-lg bg-cream p-3">
              <p className="text-[10px] uppercase tracking-wider text-ledger/40 mb-1">Tone</p>
              <p>Empathetic to distributor pain. Never condescending. Celebrates their business.</p>
            </div>
            <div className="rounded-lg bg-cream p-3">
              <p className="text-[10px] uppercase tracking-wider text-ledger/40 mb-1">Enemy</p>
              <p>The udhaar stress, the Sunday collections chase, the surprise bad debt. Not Tally.</p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

function CalSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select className="rounded border border-ledger/20 bg-white text-xs py-1 px-2 text-ledger focus:border-marigold focus:outline-none"
      value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function CalInlineInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setLocal(value); }, [value]);
  const handle = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 600);
  };
  return (
    <input className="w-full rounded border border-ledger/20 bg-white text-xs py-1 px-2 text-ledger focus:border-marigold focus:outline-none"
      value={local} onChange={e => handle(e.target.value)} />
  );
}
