import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_IDEAS_SEED } from "@/constants/growthHqSeed";

type Idea = { id: string; title: string; ecg_type: string; persona: string; format: string; funnel_stage: string; status: string };

const FORMATS = ["Reel", "Carousel", "Video", "Post"];
const STAGES = ["Top", "Mid", "Bottom"];
const STATUSES = ["Idea", "Scripted", "Posted"];
const PERSONAS = ["Sharma-ji", "Pradhan-ji", "Reddy-garu", "All"];
const db = supabase as any;

const COLUMNS = [
  { key: "EVERGREEN", label: "Evergreen", pct: "50%", color: "border-success/40 bg-success/5", header: "bg-success/10 text-success" },
  { key: "CONTROVERSY", label: "Controversy / Moment", pct: "20%", color: "border-amber-400/40 bg-amber-50/50", header: "bg-amber-100 text-amber-800" },
  { key: "GROWTH", label: "Growth", pct: "30%", color: "border-marigold/40 bg-marigold/5", header: "bg-marigold/10 text-marigold" },
];

const STATUS_STYLE: Record<string, string> = {
  Idea: "bg-ledger/10 text-ledger/60",
  Scripted: "bg-mustard/20 text-amber-800",
  Posted: "bg-success/15 text-success",
};

export default function EcgBoardTab() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", ecg_type: "EVERGREEN", persona: "Sharma-ji", format: "Reel", funnel_stage: "Top", status: "Idea" });

  const load = async () => {
    const { data, error } = await db.from("ghq_content_ideas").select("*").order("created_at");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_content_ideas").insert(CONTENT_IDEAS_SEED); load(); return; }
    setIdeas(data);
  };

  useEffect(() => { load(); }, []);

  const openForm = (ecg: string) => {
    setForm({ title: "", ecg_type: ecg, persona: "Sharma-ji", format: "Reel", funnel_stage: "Top", status: "Idea" });
    setShowForm(ecg);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Idea title required");
    const { error } = await db.from("ghq_content_ideas").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Idea added 💡");
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

  return (
    <div>
      <p className="text-sm text-ledger/60 mb-4">Content mix: <strong>Evergreen 50%</strong> | <strong>Controversy 20%</strong> | <strong>Growth 30%</strong></p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colIdeas = ideas.filter(i => i.ecg_type === col.key);
          return (
            <div key={col.key} className={`rounded-xl border ${col.color} flex flex-col`}>
              <div className={`rounded-t-xl px-4 py-3 ${col.header}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{col.label}</span>
                  <span className="text-xs font-medium">{col.pct}</span>
                </div>
                <span className="text-xs opacity-70">{colIdeas.length} ideas</span>
              </div>

              <div className="flex-1 p-3 space-y-2">
                {colIdeas.map(idea => (
                  <div key={idea.id} className="rounded-lg bg-white border border-ledger/10 p-3 shadow-sm group">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-ledger font-medium leading-snug flex-1">{idea.title}</p>
                      <button onClick={() => del(idea.id)} className="opacity-0 group-hover:opacity-100 text-ledger/30 hover:text-danger shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                      <span className="bg-cream px-1.5 py-0.5 rounded text-ledger/60">{idea.persona}</span>
                      <span className="bg-cream px-1.5 py-0.5 rounded text-ledger/60">{idea.format}</span>
                      <span className="bg-cream px-1.5 py-0.5 rounded text-ledger/60">{idea.funnel_stage}</span>
                    </div>
                    <select
                      className={`mt-2 w-full rounded-md border-0 text-xs py-1 px-2 font-medium cursor-pointer ${STATUS_STYLE[idea.status] ?? STATUS_STYLE.Idea}`}
                      value={idea.status}
                      onChange={e => updateStatus(idea.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}

                {colIdeas.length === 0 && (
                  <p className="text-xs text-center text-ledger/30 py-4 italic">No ideas yet</p>
                )}
              </div>

              <div className="p-3 border-t border-ledger/10">
                {showForm === col.key ? (
                  <div className="space-y-2">
                    <input className="input text-sm" placeholder="Idea title…" value={form.title}
                      autoFocus onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setShowForm(null); }} />
                    <div className="grid grid-cols-2 gap-1">
                      <select className="input text-xs py-1" value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}>
                        {PERSONAS.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <select className="input text-xs py-1" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                        {FORMATS.map(f => <option key={f}>{f}</option>)}
                      </select>
                      <select className="input text-xs py-1" value={form.funnel_stage} onChange={e => setForm(f => ({ ...f, funnel_stage: e.target.value }))}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn-primary text-xs py-1 px-3 flex-1" onClick={save}>Add</button>
                      <button className="btn-secondary text-xs py-1 px-2" onClick={() => setShowForm(null)}><X size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <button className="w-full text-xs text-ledger/50 hover:text-ledger flex items-center justify-center gap-1 py-1 rounded hover:bg-white/50 transition"
                    onClick={() => openForm(col.key)}>
                    <Plus size={12} /> Add Idea
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
