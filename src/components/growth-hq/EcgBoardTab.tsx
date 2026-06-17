import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_IDEAS_SEED } from "@/constants/growthHqSeed";

type Idea = { id: string; title: string; ecg_type: string; persona: string; format: string; funnel_stage: string; status: string };
type PersonaRow = { id: string; name: string };

const FORMATS = ["Reel", "Carousel", "Video", "Post"];
const STAGES = ["Top", "Mid", "Bottom"];
const STATUSES = ["Idea", "Scripted", "Posted"];
const db = supabase as any;

const COLUMNS = [
  { key: "EVERGREEN",   label: "Evergreen",           pct: "50%", ring: "ring-emerald-200", header: "bg-emerald-50 text-emerald-800 border-b border-emerald-100", dot: "bg-emerald-400" },
  { key: "CONTROVERSY", label: "Controversy / Moment", pct: "20%", ring: "ring-amber-200",  header: "bg-amber-50 text-amber-800 border-b border-amber-100",       dot: "bg-amber-400" },
  { key: "GROWTH",      label: "Growth",               pct: "30%", ring: "ring-marigold/40", header: "bg-marigold/8 text-marigold border-b border-marigold/15",   dot: "bg-marigold" },
];

const STATUS_BADGE: Record<string, string> = {
  Idea:     "bg-slate-100 text-slate-500",
  Scripted: "bg-amber-100 text-amber-700",
  Posted:   "bg-emerald-100 text-emerald-700",
};

const FORMAT_COLOR: Record<string, string> = {
  Reel:     "bg-pink-50 text-pink-700",
  Carousel: "bg-blue-50 text-blue-700",
  Video:    "bg-purple-50 text-purple-700",
  Post:     "bg-slate-50 text-slate-600",
};

const STAGE_COLOR: Record<string, string> = {
  Top:    "bg-green-50 text-green-700",
  Mid:    "bg-yellow-50 text-yellow-700",
  Bottom: "bg-red-50 text-red-700",
};

export default function EcgBoardTab() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [personas, setPersonas] = useState<string[]>([]);
  const [personaFilter, setPersonaFilter] = useState("All");
  const [showForm, setShowForm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", ecg_type: "EVERGREEN", persona: "All", format: "Reel", funnel_stage: "Top", status: "Idea" });

  const load = async () => {
    const { data, error } = await db.from("ghq_content_ideas").select("*").order("created_at");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_content_ideas").insert(CONTENT_IDEAS_SEED); load(); return; }
    setIdeas(data);
  };

  const loadPersonas = async () => {
    const { data } = await db.from("ghq_personas").select("id, name").order("created_at");
    if (data?.length) setPersonas(data.map((p: PersonaRow) => p.name));
  };

  useEffect(() => { load(); loadPersonas(); }, []);

  const allPersonas = personas.length ? ["All", ...personas] : ["All", "Sharma-ji", "Pradhan-ji", "Reddy-garu"];

  const openForm = (ecg: string) => {
    setForm({ title: "", ecg_type: ecg, persona: personas[0] ?? "Sharma-ji", format: "Reel", funnel_stage: "Top", status: "Idea" });
    setShowForm(ecg);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Idea title required");
    const { error } = await db.from("ghq_content_ideas").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Idea added");
    setShowForm(null); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await db.from("ghq_content_ideas").update({ status }).eq("id", id);
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const del = async (id: string) => {
    if (!confirm("Delete idea?")) return;
    await db.from("ghq_content_ideas").delete().eq("id", id);
    load();
  };

  const filtered = personaFilter === "All" ? ideas : ideas.filter(i => i.persona === personaFilter);
  const total = ideas.length;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-ledger/60">
          Content mix: <strong className="text-emerald-700">Evergreen 50%</strong> · <strong className="text-amber-700">Controversy 20%</strong> · <strong className="text-marigold">Growth 30%</strong>
          <span className="ml-2 text-ledger/40">({total} total ideas)</span>
        </p>
      </div>

      {/* Persona filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {allPersonas.map(p => (
          <button key={p} onClick={() => setPersonaFilter(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              personaFilter === p
                ? "bg-ledger text-cream border-ledger"
                : "border-ledger/15 text-ledger/60 hover:bg-khadi"
            }`}>
            {p}
            {p !== "All" && (
              <span className="ml-1.5 opacity-50">
                {ideas.filter(i => i.persona === p).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colIdeas = filtered.filter(i => i.ecg_type === col.key);
          return (
            <div key={col.key} className={`rounded-2xl border border-ledger/10 bg-white shadow-sm overflow-hidden ring-1 ${col.ring}`}>

              {/* Column header */}
              <div className={`px-4 py-3 ${col.header}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="font-semibold text-sm">{col.label}</span>
                  </div>
                  <span className="text-xs font-medium opacity-70">{col.pct}</span>
                </div>
                <p className="text-xs opacity-60 mt-0.5 pl-4">{colIdeas.length} idea{colIdeas.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Ideas */}
              <div className="p-3 space-y-2 min-h-[160px]">
                {colIdeas.map(idea => (
                  <div key={idea.id} className="rounded-xl bg-cream/40 border border-ledger/8 p-3 group hover:bg-white hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-ledger font-medium leading-snug flex-1">{idea.title}</p>
                      <button onClick={() => del(idea.id)}
                        className="opacity-0 group-hover:opacity-100 text-ledger/30 hover:text-red-500 shrink-0 transition">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${FORMAT_COLOR[idea.format] ?? "bg-slate-50 text-slate-600"}`}>
                        {idea.format}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STAGE_COLOR[idea.funnel_stage] ?? "bg-slate-50 text-slate-600"}`}>
                        {idea.funnel_stage}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-ledger/5 text-ledger/50">
                        {idea.persona}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-1">
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => updateStatus(idea.id, s)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition font-medium ${
                            idea.status === s
                              ? STATUS_BADGE[s]
                              : "border-ledger/10 text-ledger/30 hover:border-ledger/30"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {colIdeas.length === 0 && (
                  <p className="text-xs text-center text-ledger/30 py-4 italic">No ideas</p>
                )}
              </div>

              {/* Add form */}
              <div className="px-3 pb-3 border-t border-ledger/8 pt-2">
                {showForm === col.key ? (
                  <div className="space-y-2">
                    <input className="input text-sm" placeholder="Idea title…" autoFocus
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setShowForm(null); }} />
                    <div className="grid grid-cols-2 gap-1.5">
                      <select className="input text-xs py-1" value={form.persona}
                        onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}>
                        {allPersonas.filter(p => p !== "All").map(p => <option key={p}>{p}</option>)}
                      </select>
                      <select className="input text-xs py-1" value={form.format}
                        onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                        {FORMATS.map(f => <option key={f}>{f}</option>)}
                      </select>
                      <select className="input text-xs py-1" value={form.funnel_stage}
                        onChange={e => setForm(f => ({ ...f, funnel_stage: e.target.value }))}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="btn-primary text-xs py-1 px-3 flex-1" onClick={save}>Add</button>
                      <button className="btn-secondary text-xs py-1 px-2" onClick={() => setShowForm(null)}><X size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full text-xs text-ledger/40 hover:text-ledger flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-cream transition"
                    onClick={() => openForm(col.key)}>
                    <Plus size={12} /> Add idea
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
