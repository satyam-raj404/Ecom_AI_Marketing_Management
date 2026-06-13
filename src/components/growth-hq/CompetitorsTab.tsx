import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, ExternalLink } from "lucide-react";
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
    const op = editId ? db.from("ghq_competitors").update(form).eq("id", editId) : db.from("ghq_competitors").insert(form);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <a href="https://www.facebook.com/ads/library" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-marigold hover:underline">
          <ExternalLink size={13} /> Check competitor ads → Meta Ad Library
        </a>
        <button className="btn-primary text-sm" onClick={() => { setForm({ ...BLANK }); setEditId(null); setShowForm(v => !v); }}>
          <Plus size={14} /> Add Competitor
        </button>
      </div>

      {showForm && (
        <div className="card border-marigold/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger text-sm">{editId ? "Edit Competitor" : "New Competitor"}</span>
            <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={16} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([ ["Name *", "name"], ["What They Do", "what_they_do"], ["Their Content Angle", "content_angle"], ["Ads Link (Meta Library)", "ads_link"] ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {([ ["Their Weakness", "weakness"], ["Our Counter-Angle", "counter"], ["Notes", "notes"] ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea className="input" rows={2} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map(c => (
          <div key={c.id} className={`card cursor-pointer transition ${expanded === c.id ? "border-marigold/40 shadow-md" : ""}`}
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-ledger text-lg">{c.name}</h3>
              <button onClick={e => { e.stopPropagation(); del(c.id); }} className="text-ledger/30 hover:text-danger ml-2 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="mt-1 text-sm text-ledger/70">{c.what_they_do}</p>

            {expanded === c.id && (
              <div className="mt-3 space-y-2 border-t border-ledger/10 pt-3">
                {[
                  ["Content Angle", c.content_angle],
                  ["Weakness", c.weakness],
                  ["Our Counter-Angle", c.counter],
                  ["Notes", c.notes],
                ].map(([k, v]) => v ? (
                  <div key={k as string}>
                    <span className="text-[10px] uppercase tracking-wider text-ledger/40">{k}</span>
                    <p className="text-sm text-ledger/80">{v}</p>
                  </div>
                ) : null)}
                {c.ads_link && (
                  <a href={c.ads_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-marigold hover:underline">
                    <ExternalLink size={11} /> View Ads
                  </a>
                )}
                <div className="flex gap-2 pt-1">
                  <button className="btn-secondary text-xs py-1 px-3" onClick={e => { e.stopPropagation(); startEdit(c); }}>Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {competitors.length === 0 && !showForm && (
        <div className="text-center py-12 text-ledger/40">
          <p className="text-2xl mb-2">⚔️</p><p>No competitors tracked yet. Add your first!</p>
        </div>
      )}
    </div>
  );
}
