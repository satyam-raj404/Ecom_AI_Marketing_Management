import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PERSONAS_SEED } from "@/constants/growthHqSeed";

type Persona = {
  id: string; name: string; age_range: string; business: string;
  geography: string; tech: string; language: string; pain: string;
  trigger: string; where_to_find: string; hook: string;
};

const GEOS = ["Odisha", "Bengaluru", "Jharkhand", "Delhi", "Other"];
const BLANK = { name: "", age_range: "", business: "", geography: "Delhi", tech: "", language: "Hindi", pain: "", trigger: "", where_to_find: "", hook: "" };
const db = supabase as any;
const GEO_COLORS: Record<string, string> = {
  Odisha: "bg-blue-100 text-blue-800", Bengaluru: "bg-purple-100 text-purple-800",
  Jharkhand: "bg-amber-100 text-amber-800", Delhi: "bg-red-100 text-red-800",
  Other: "bg-khadi text-ledger",
};

export default function PersonasTab() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await db.from("ghq_personas").select("*").order("created_at");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_personas").insert(PERSONAS_SEED); load(); return; }
    setPersonas(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const op = editId ? db.from("ghq_personas").update(form).eq("id", editId) : db.from("ghq_personas").insert(form);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editId ? "Persona updated" : "Persona saved 🎯");
    setForm({ ...BLANK }); setShowForm(false); setEditId(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete persona?")) return;
    await db.from("ghq_personas").delete().eq("id", id);
    load();
  };

  const startEdit = (p: Persona) => {
    const { id, ...rest } = p;
    setForm(rest as typeof BLANK); setEditId(id); setShowForm(true); setExpanded(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ledger/60">{personas.length} personas</p>
        <button className="btn-primary text-sm" onClick={() => { setForm({ ...BLANK }); setEditId(null); setShowForm(v => !v); }}>
          <Plus size={14} /> New Persona
        </button>
      </div>

      {showForm && (
        <div className="card border-marigold/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger text-sm">{editId ? "Edit Persona" : "New Persona"}</span>
            <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={16} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([ ["Persona Name", "name"], ["Age Range", "age_range"], ["Business Type & Size", "business"], ["Tech They Use Today", "tech"], ["Language", "language"] ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label">Geography</label>
              <select className="input" value={form.geography} onChange={e => setForm(f => ({ ...f, geography: e.target.value }))}>
                {GEOS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          {([ ["Biggest Pain", "pain"], ["Emotional Trigger", "trigger"], ["Where to Find Them", "where_to_find"], ["Best Hook for Them", "hook"] ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea className="input" rows={2} value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save Persona</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {personas.length === 0 && !showForm && (
        <div className="text-center py-12 text-ledger/40">
          <p className="text-2xl mb-2">🎯</p><p>No personas yet. Create your first!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map(p => (
          <div key={p.id} className="card cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-ledger">{p.name}</h3>
                <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${GEO_COLORS[p.geography] ?? GEO_COLORS.Other}`}>{p.geography}</span>
              </div>
              {expanded === p.id ? <ChevronUp size={16} className="text-ledger/40 mt-1" /> : <ChevronDown size={16} className="text-ledger/40 mt-1" />}
            </div>
            <p className="mt-2 text-sm text-ledger/70 line-clamp-2">{p.pain}</p>
            {expanded === p.id && (
              <div className="mt-3 space-y-2 border-t border-ledger/10 pt-3">
                {[["Age", p.age_range], ["Business", p.business], ["Tech", p.tech], ["Language", p.language], ["Trigger", p.trigger], ["Where to Find", p.where_to_find], ["Best Hook", p.hook]].map(([k, v]) => v ? (
                  <div key={k as string}>
                    <span className="text-[10px] uppercase tracking-wider text-ledger/40">{k}</span>
                    <p className="text-sm text-ledger/80">{v}</p>
                  </div>
                ) : null)}
                <div className="flex gap-2 pt-2">
                  <button className="btn-secondary text-xs py-1 px-3" onClick={e => { e.stopPropagation(); startEdit(p); }}>Edit</button>
                  <button className="text-danger text-xs hover:underline" onClick={e => { e.stopPropagation(); del(p.id); }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
