import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X, MapPin, Cpu, Languages, Heart, Zap, Search, Megaphone, Pencil, Trash2, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PERSONAS_SEED } from "@/constants/growthHqSeed";

type Persona = {
  id: string; name: string; age_range: string; business: string;
  geography: string; tech: string; language: string; pain: string;
  trigger: string; where_to_find: string; hook: string;
};

type IdeaCount = { persona: string; count: number };

const GEOS = ["Odisha", "Bengaluru", "Jharkhand", "Delhi", "Other"];
const BLANK = { name: "", age_range: "", business: "", geography: "Delhi", tech: "", language: "Hindi", pain: "", trigger: "", where_to_find: "", hook: "" };

const GEO_BORDER: Record<string, string> = {
  Odisha:    "border-l-blue-400",
  Bengaluru: "border-l-violet-400",
  Jharkhand: "border-l-amber-400",
  Delhi:     "border-l-red-400",
  Other:     "border-l-slate-300",
};
const GEO_PILL: Record<string, string> = {
  Odisha:    "bg-blue-50 text-blue-700",
  Bengaluru: "bg-violet-50 text-violet-700",
  Jharkhand: "bg-amber-50 text-amber-700",
  Delhi:     "bg-red-50 text-red-700",
  Other:     "bg-slate-50 text-slate-600",
};
const GEO_AVATAR: Record<string, string> = {
  Odisha:    "bg-blue-100 text-blue-700",
  Bengaluru: "bg-violet-100 text-violet-700",
  Jharkhand: "bg-amber-100 text-amber-700",
  Delhi:     "bg-red-100 text-red-700",
  Other:     "bg-slate-100 text-slate-600",
};

const db = supabase as any;

const INFO_ROWS: { icon: React.ComponentType<{size?:number;className?:string}>; key: keyof Persona; label: string }[] = [
  { icon: MapPin,    key: "geography",    label: "Geography" },
  { icon: Cpu,       key: "tech",         label: "Tech" },
  { icon: Languages, key: "language",     label: "Language" },
  { icon: Heart,     key: "pain",         label: "Pain" },
  { icon: Zap,       key: "trigger",      label: "Trigger" },
  { icon: Search,    key: "where_to_find",label: "Where to Find" },
  { icon: Megaphone, key: "hook",         label: "Best Hook" },
];

export default function PersonasTab() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [ideaCounts, setIdeaCounts] = useState<IdeaCount[]>([]);
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

  const loadIdeaCounts = async () => {
    const { data } = await db.from("ghq_content_ideas").select("persona");
    if (!data) return;
    const counts: Record<string, number> = {};
    data.forEach((r: { persona: string }) => { counts[r.persona] = (counts[r.persona] ?? 0) + 1; });
    setIdeaCounts(Object.entries(counts).map(([persona, count]) => ({ persona, count })));
  };

  useEffect(() => { load(); loadIdeaCounts(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const op = editId
      ? db.from("ghq_personas").update(form).eq("id", editId)
      : db.from("ghq_personas").insert(form);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editId ? "Persona updated" : "Persona saved");
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

  const ideaCount = (name: string) => ideaCounts.find(c => c.persona === name)?.count ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ledger/50">{personas.length} personas defined</p>
        <button className="btn-primary text-sm flex items-center gap-1.5"
          onClick={() => { setForm({ ...BLANK }); setEditId(null); setShowForm(v => !v); }}>
          <Plus size={14} /> New Persona
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-marigold/30 bg-white shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger">{editId ? "Edit Persona" : "New Persona"}</span>
            <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={18} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              ["Persona Name *", "name"],
              ["Age Range", "age_range"],
              ["Business Type & Size", "business"],
              ["Tech They Use Today", "tech"],
              ["Language", "language"],
            ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" value={form[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label">Geography</label>
              <select className="input" value={form.geography}
                onChange={e => setForm(f => ({ ...f, geography: e.target.value }))}>
                {GEOS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          {([
            ["Biggest Pain Point", "pain"],
            ["Emotional Trigger", "trigger"],
            ["Where to Find Them", "where_to_find"],
            ["Best Hook for Them", "hook"],
          ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea className="input resize-none" rows={2} value={form[key] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save Persona</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map(p => {
          const isOpen = expanded === p.id;
          const ideas = ideaCount(p.name);
          return (
            <div key={p.id}
              className={`rounded-2xl border-l-4 border border-ledger/10 bg-white shadow-sm overflow-hidden transition cursor-pointer hover:shadow-md ${GEO_BORDER[p.geography] ?? GEO_BORDER.Other}`}
              onClick={() => setExpanded(isOpen ? null : p.id)}>

              {/* Card header */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${GEO_AVATAR[p.geography] ?? GEO_AVATAR.Other}`}>
                    {p.name.split(" ")[0][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ledger">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GEO_PILL[p.geography] ?? GEO_PILL.Other}`}>
                        {p.geography}
                      </span>
                      {p.age_range && <span className="text-[10px] text-ledger/40">{p.age_range}</span>}
                    </div>
                  </div>
                  {ideas > 0 && (
                    <div className="flex items-center gap-1 shrink-0 text-[10px] text-marigold font-medium bg-marigold/10 rounded-full px-2 py-0.5">
                      <Layers size={10} /> {ideas}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm text-ledger/70 leading-relaxed line-clamp-2">{p.pain}</p>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-ledger/8 bg-cream/30 px-4 py-4 space-y-3"
                  onClick={e => e.stopPropagation()}>

                  {/* Hook quote */}
                  {p.hook && (
                    <div className="rounded-xl bg-mustard/10 border border-mustard/20 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-mustard/70 mb-1">Best Hook</p>
                      <p className="text-sm text-ledger/80 italic leading-relaxed">"{p.hook}"</p>
                    </div>
                  )}

                  {/* Info rows */}
                  <div className="space-y-2">
                    {INFO_ROWS.filter(r => r.key !== "hook" && p[r.key]).map(({ icon: Icon, key, label }) => (
                      <div key={key} className="flex gap-2.5 items-start">
                        <Icon size={13} className="text-ledger/30 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ledger/40">{label}</p>
                          <p className="text-sm text-ledger/80">{p[key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      onClick={() => startEdit(p)}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2"
                      onClick={() => del(p.id)}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {personas.length === 0 && !showForm && (
        <div className="text-center py-16 text-ledger/40">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm">No personas yet. Create your first ICP.</p>
        </div>
      )}
    </div>
  );
}
