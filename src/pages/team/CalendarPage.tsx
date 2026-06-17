import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, X, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type CalEvent = {
  id: string; title: string; type: string | null;
  start_time: string | null; end_time: string | null;
  notes: string | null; created_by: string | null;
};

const EVENT_TYPES = [
  { key: "demo",    label: "Demo Call",    color: "bg-amber-500",   light: "bg-amber-50  border-amber-300  text-amber-800",  pill: "bg-amber-100 text-amber-700" },
  { key: "mandi",   label: "Mandi Visit",  color: "bg-violet-500",  light: "bg-violet-50 border-violet-300 text-violet-800", pill: "bg-violet-100 text-violet-700" },
  { key: "content", label: "Content",      color: "bg-blue-500",    light: "bg-blue-50   border-blue-300   text-blue-800",   pill: "bg-blue-100 text-blue-700" },
  { key: "rnd",     label: "R&D Sprint",   color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-300 text-emerald-800", pill: "bg-emerald-100 text-emerald-700" },
  { key: "other",   label: "Other",        color: "bg-slate-400",   light: "bg-slate-50  border-slate-200  text-slate-700",  pill: "bg-slate-100 text-slate-600" },
] as const;

const typeStyle = (t: string | null) =>
  EVENT_TYPES.find(e => e.key === (t ?? "other")) ?? EVENT_TYPES[4];

const DURATIONS = ["15m", "30m", "1h", "2h"];
const BLANK = { title: "", type: "demo", date: "", time: "10:00", duration: "1h", notes: "" };

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const db = supabase as any;

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const load = async () => {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const start = new Date(y, m, 1).toISOString();
    const end   = new Date(y, m + 1, 1).toISOString();
    const { data, error } = await db.from("calendar_events")
      .select("*").gte("start_time", start).lt("start_time", end).order("start_time");
    if (error) toast.error(error.message);
    setEvents(data ?? []);
  };

  useEffect(() => { load(); }, [viewDate]);

  const add = async () => {
    if (!form.title.trim() || !form.date) return toast.error("Title and date required");
    const start = new Date(`${form.date}T${form.time}`);
    const mins = { "15m": 15, "30m": 30, "1h": 60, "2h": 120 }[form.duration] ?? 60;
    const end = new Date(start.getTime() + mins * 60000);
    const { error } = await db.from("calendar_events").insert({
      title: form.title, type: form.type, notes: form.notes || null,
      start_time: start.toISOString(), end_time: end.toISOString(),
      created_by: user?.email ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Event added");
    setForm(BLANK); setShowForm(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete event?")) return;
    await db.from("calendar_events").delete().eq("id", id);
    load();
  };

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();
  const today       = new Date();
  const isThisMonth = year === today.getFullYear() && month === today.getMonth();

  const byDay: Record<number, CalEvent[]> = {};
  events.forEach(e => {
    if (!e.start_time) return;
    const d = new Date(e.start_time).getDate();
    byDay[d] = [...(byDay[d] ?? []), e];
  });

  const selEvents = selectedDay ? (byDay[selectedDay] ?? []) : [];
  const selDateLabel = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })
    : "Select a day";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Calendar</h1>
          <p className="text-sm text-ledger/60">Demos · Mandi visits · Content · R&D sprints</p>
        </div>
        <button
          className="btn-primary text-sm flex items-center gap-1.5"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={15} /> Add Event
        </button>
      </div>

      {/* Quick-add chips */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.slice(0, 4).map(t => (
          <button
            key={t.key}
            onClick={() => { setForm({ ...BLANK, type: t.key, title: t.label + ": " }); setShowForm(true); }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition hover:opacity-80 ${t.light}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.color}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Add event form */}
      {showForm && (
        <div className="rounded-2xl border border-marigold/30 bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ledger">New Event</span>
            <button onClick={() => setShowForm(false)} className="text-ledger/40 hover:text-ledger">
              <X size={18} />
            </button>
          </div>
          <input
            className="input"
            placeholder="Event title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={add}>Add to Calendar</button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Calendar + Day panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Month grid */}
        <div className="rounded-2xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-ledger/8">
            <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg text-ledger/50 hover:bg-khadi hover:text-ledger transition">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-ledger">
              {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg text-ledger/50 hover:bg-khadi hover:text-ledger transition">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pt-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-ledger/40 pb-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px px-3 pb-4">
            {Array(firstDow).fill(null).map((_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const evts = byDay[day] ?? [];
              const isToday = isThisMonth && day === today.getDate();
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative flex flex-col items-center rounded-xl py-1.5 px-0.5 min-h-[64px] transition group
                    ${isSelected ? "bg-ledger text-cream" : "hover:bg-khadi text-ledger"}`}
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 transition
                    ${isToday && !isSelected ? "bg-marigold text-white font-bold" : ""}
                    ${isToday && isSelected ? "bg-mustard text-ledger font-bold" : ""}`}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5 w-full px-0.5">
                    {evts.slice(0, 2).map((e, idx) => {
                      const s = typeStyle(e.type);
                      return (
                        <div key={idx}
                          className={`text-[9px] rounded-sm px-1 truncate leading-4
                            ${isSelected ? "bg-white/20 text-white" : s.pill}`}>
                          {e.title}
                        </div>
                      );
                    })}
                    {evts.length > 2 && (
                      <div className={`text-[9px] text-center ${isSelected ? "text-white/60" : "text-ledger/40"}`}>
                        +{evts.length - 2}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="rounded-2xl border border-ledger/10 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-4 border-b border-ledger/8">
            <p className="text-xs text-ledger/50 uppercase tracking-wider mb-0.5">Selected Day</p>
            <h3 className="font-semibold text-ledger text-sm leading-snug">{selDateLabel}</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!selectedDay && (
              <p className="text-sm text-ledger/40 italic text-center mt-6">Click a day to see events</p>
            )}
            {selectedDay && selEvents.length === 0 && (
              <div className="text-center mt-6 space-y-2">
                <p className="text-sm text-ledger/40">No events</p>
                <button
                  className="text-xs text-marigold hover:underline"
                  onClick={() => {
                    const d = String(day => day).padStart(2, "0");
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                    setForm({ ...BLANK, date: dateStr });
                    setShowForm(true);
                  }}
                >
                  + Add event for this day
                </button>
              </div>
            )}
            {selEvents.map(e => {
              const s = typeStyle(e.type);
              return (
                <div key={e.id} className={`rounded-xl border p-3 ${s.light}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${s.light.split(" ")[2]}`}>{e.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        {e.start_time && (
                          <span className="flex items-center gap-1 text-xs text-ledger/50">
                            <Clock size={10} /> {fmtTime(e.start_time)}
                            {e.end_time && ` – ${fmtTime(e.end_time)}`}
                          </span>
                        )}
                        {e.created_by && (
                          <span className="flex items-center gap-1 text-xs text-ledger/40">
                            <User size={10} /> {e.created_by.split("@")[0]}
                          </span>
                        )}
                      </div>
                      {e.notes && <p className="mt-1.5 text-xs text-ledger/60 leading-relaxed">{e.notes}</p>}
                    </div>
                    <button onClick={() => remove(e.id)} className="text-ledger/30 hover:text-red-500 transition mt-0.5 flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-ledger/8 flex flex-wrap gap-x-3 gap-y-1.5">
            {EVENT_TYPES.slice(0, 4).map(t => (
              <span key={t.key} className="flex items-center gap-1 text-[10px] text-ledger/50">
                <span className={`w-2 h-2 rounded-full ${t.color}`} />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
