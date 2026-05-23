import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Event = {
  id: string; title: string; type: string | null;
  start_time: string | null; end_time: string | null; created_by: string | null;
};

const QUICK = [
  { label: "Demo Call", type: "demo", prefix: "Demo: " },
  { label: "Mandi Visit", type: "mandi", prefix: "Mandi visit: " },
  { label: "Content Post", type: "content", prefix: "Content: " },
  { label: "R&D Sprint", type: "r&d", prefix: "R&D: " },
] as const;

const TYPE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  demo:    { bg: "bg-amber-100",  text: "text-amber-800",  dot: "#F59E0B" },
  mandi:   { bg: "bg-purple-100", text: "text-purple-800", dot: "#8B5CF6" },
  content: { bg: "bg-blue-100",   text: "text-blue-800",   dot: "#2563EB" },
  "r&d":   { bg: "bg-green-100",  text: "text-green-800",  dot: "#22C55E" },
  other:   { bg: "bg-gray-100",   text: "text-gray-600",   dot: "#94A3B8" },
};
const DURATIONS = ["15m", "30m", "1h", "2h"];
const BLANK_FORM = { title: "", type: "demo", date: "", time: "10:00", duration: "1h", notes: "" };

// Team calendar — month grid view with quick-add event form
export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const load = async () => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1).toISOString();
    const { data, error } = await supabase.from("calendar_events").select("*")
      .gte("start_time", start).lt("start_time", end).order("start_time");
    if (error) toast.error(error.message);
    setEvents(data ?? []);
  };

  useEffect(() => { load(); }, [viewDate]);

  const add = async () => {
    if (!form.title.trim() || !form.date) return toast.error("Title and date required");
    const start = new Date(`${form.date}T${form.time}`);
    const mins = form.duration === "15m" ? 15 : form.duration === "30m" ? 30 : form.duration === "2h" ? 120 : 60;
    const end = new Date(start.getTime() + mins * 60000);
    const { error } = await supabase.from("calendar_events").insert({
      title: form.title, type: form.type,
      start_time: start.toISOString(), end_time: end.toISOString(),
      created_by: user?.email ?? null,
    });
    if (error) return toast.error(error.message);
    setForm(BLANK_FORM); setShowForm(false); load();
    toast.success("Event added");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete event?")) return;
    await supabase.from("calendar_events").delete().eq("id", id);
    load();
  };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const today = new Date();

  const byDay: Record<number, Event[]> = {};
  events.forEach(e => {
    if (!e.start_time) return;
    const d = new Date(e.start_time).getDate();
    byDay[d] = [...(byDay[d] ?? []), e];
  });

  const selEvents = selectedDay ? byDay[selectedDay] ?? [] : [];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Calendar</h1>
          <p className="text-sm text-ledger/60">Demos, Mandi visits, content, R&D sprints.</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> Add Event
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {QUICK.map(q => (
          <button key={q.type} onClick={() => { setForm({ ...BLANK_FORM, type: q.type, title: q.prefix }); setShowForm(true); }}
            className="btn-secondary text-xs py-1.5 px-3">
            + {q.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card space-y-3 border-marigold/30">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ledger text-sm">New event</span>
            <button onClick={() => setShowForm(false)} className="text-ledger/40 hover:text-ledger"><X size={16} /></button>
          </div>
          <input className="input" placeholder="Title *" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {QUICK.map(q => <option key={q.type} value={q.type}>{q.label}</option>)}
            </select>
            <input className="input" type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
            <input className="input" type="time" value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })} />
            <select className="input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
              {DURATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <textarea className="input" rows={2} placeholder="Notes (optional)" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button className="btn-primary text-sm" onClick={add}>Add to Calendar</button>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 text-ledger/60 hover:text-ledger"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-semibold text-ledger">
            {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <button onClick={nextMonth} className="p-1 text-ledger/60 hover:text-ledger"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-ledger/40 mb-1">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(firstDow).fill(null).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const evts = byDay[day] ?? [];
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            return (
              <button key={day} onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                className={`rounded-lg p-1 text-xs text-ledger transition min-h-[48px] flex flex-col items-start text-left
                  hover:bg-khadi ${isToday ? "bg-marigold/10 font-bold" : ""}
                  ${selectedDay === day ? "ring-2 ring-marigold" : ""}`}>
                <span className="ml-1">{day}</span>
                <div className="mt-0.5 space-y-0.5 w-full">
                  {evts.slice(0, 2).map((e, i) => {
                    const s = TYPE_STYLE[e.type ?? "other"] ?? TYPE_STYLE.other;
                    return (
                      <div key={i} className={`text-[9px] rounded px-1 truncate ${s.bg} ${s.text}`}>
                        {e.title}
                      </div>
                    );
                  })}
                  {evts.length > 2 && <div className="text-[9px] text-ledger/40">+{evts.length - 2} more</div>}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="mt-4 border-t border-ledger/10 pt-3">
            <h3 className="text-sm font-semibold text-ledger mb-2">
              {new Date(year, month, selectedDay).toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" })}
            </h3>
            {selEvents.length === 0
              ? <p className="text-sm text-ledger/40">No events. Add one above.</p>
              : selEvents.map(e => {
                  const s = TYPE_STYLE[e.type ?? "other"] ?? TYPE_STYLE.other;
                  return (
                    <div key={e.id} className={`flex items-center justify-between rounded-lg p-2 mb-1 ${s.bg}`}>
                      <div>
                        <span className={`font-medium text-sm ${s.text}`}>{e.title}</span>
                        <span className="ml-2 text-xs text-ledger/50">
                          {e.start_time && new Date(e.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <button onClick={() => remove(e.id)} className="text-ledger/40 hover:text-danger ml-2">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap text-xs text-ledger/50">
        {Object.entries(TYPE_STYLE).map(([type, s]) => (
          <span key={type} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />{type}
          </span>
        ))}
      </div>
    </div>
  );
}
