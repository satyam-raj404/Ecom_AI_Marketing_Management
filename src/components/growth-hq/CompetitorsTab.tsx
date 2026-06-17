import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, ExternalLink, Pencil, ShieldAlert, Swords, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COMPETITORS_SEED } from "@/constants/growthHqSeed";

type Competitor = { id: string; name: string; what_they_do: string; content_angle: string; ads_link: string; weakness: string; counter: string; notes: string };
const BLANK = { name: "", what_they_do: "", content_angle: "", ads_link: "", weakness: "", counter: "", notes: "" };
const db = supabase as any;

export default function CompetitorsTab() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await db.from("ghq_competitors").select("*").order("created_at");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_competitors").insert(COMPETITORS_SEED); load(); return; }
    setCompetitors(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const op = editId
      ? db.from("ghq_competitors").update(form).eq("id", editId)
      : db.from("ghq_competitors").insert(form);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editId ? "Competitor updated" : "Competitor added");
    setForm({ ...BLANK }); setShowForm(false); setEditId(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete competitor?")) return;
    await db.from("ghq_competitors").delete().eq("id", id);
    load();
  };

  const startEdit = (c: Competitor) => {
    const { id, ...rest } = c;
    setForm(rest); setEditId(id); setShowForm(true); setExpanded(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <a href="https://www.facebook.com/ads/library" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-marigold hover:underline">
          <ExternalLink size={13} /> Meta Ad Library ↗
        </a>
        <button className="btn-primary text-sm flex items-center gap-1.5"
          onClick={() => { setForm({ ...BLANK }); setEditId(null); setShowForm(v => !v); }}>
          <Plus size={14} /> Add Competitor
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-marigold/30 bg-white shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger">{editId ? "Edit" : "New"} Competitor</span>
            <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={18} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              ["Name *", "name"],
              ["What They Do", "what_they_do"],
              ["Their Content Angle", "content_angle"],
              ["Ads Link (Meta Library)", "ads_link"],
            ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {([
            ["Their Weakness", "weakness"],
            ["Our Counter-Angle", "counter"],
            ["Notes", "notes"],
          ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea className="input resize-none" rows={2} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map(c => {
          const isOpen = expanded === c.id;
          return (
            <div key={c.id}
              className={`rounded-2xl border bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition ${isOpen ? "border-marigold/40 ring-1 ring-marigold/20" : "border-ledger/10"}`}
              onClick={() => setExpanded(isOpen ? null : c.id)}>

              {/* Header */}
              <div className="px-4 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-ledger/8 flex items-center justify-center shrink-0 font-bold text-ledger text-sm">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ledger">{c.name}</h3>
                  <p className="text-sm text-ledger/60 mt-0.5 line-clamp-1">{c.what_they_do}</p>
                </div>
                {c.ads_link && (
                  <a href={c.ads_link} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="shrink-0 text-marigold hover:underline text-xs flex items-center gap-1">
                    <ExternalLink size={12} /> Ads
                  </a>
                )}
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="border-t border-ledger/8" onClick={e => e.stopPropagation()}>
                  {c.content_angle && (
                    <div className="px-4 py-3 border-b border-ledger/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText size={12} className="text-ledger/40" />
                        <span className="text-[10px] uppercase tracking-wider text-ledger/40">Content Angle</span>
                      </div>
                      <p className="text-sm text-ledger/75">{c.content_angle}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {c.weakness && (
                      <div className="px-4 py-3 bg-red-50/50 border-r border-b border-ledger/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShieldAlert size={12} className="text-red-400" />
                          <span className="text-[10px] uppercase tracking-wider text-red-400">Their Weakness</span>
                        </div>
                        <p className="text-sm text-ledger/75">{c.weakness}</p>
                      </div>
                    )}
                    {c.counter && (
                      <div className="px-4 py-3 bg-emerald-50/50 border-b border-ledger/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Swords size={12} className="text-emerald-500" />
                          <span className="text-[10px] uppercase tracking-wider text-emerald-600">Our Counter</span>
                        </div>
                        <p className="text-sm text-ledger/75">{c.counter}</p>
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <div className="px-4 py-3 bg-cream/30">
                      <p className="text-xs text-ledger/50 uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-ledger/70">{c.notes}</p>
                    </div>
                  )}

                  <div className="px-4 py-3 flex gap-2 border-t border-ledger/5">
                    <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      onClick={() => startEdit(c)}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2"
                      onClick={() => del(c.id)}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {competitors.length === 0 && !showForm && (
        <div className="text-center py-16 text-ledger/40">
          <div className="text-4xl mb-3">⚔️</div>
          <p className="text-sm">No competitors tracked yet.</p>
        </div>
      )}
    </div>
  );
}
