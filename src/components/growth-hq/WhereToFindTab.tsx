import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RESOURCES_SEED } from "@/constants/growthHqSeed";

type Resource = { id: string; name: string; geography: string; type: string; link: string; notes: string; priority: string };

const GEOS = ["All", "Odisha", "Bengaluru", "Jharkhand", "Delhi", "Other"];
const TYPES = ["WhatsApp Group", "Facebook Group", "Association", "Mandi", "Reddit", "LinkedIn", "YouTube", "Event", "Other"];
const PRIOS = ["High", "Medium", "Low"];
const BLANK = { name: "", geography: "Other", type: "Other", link: "", notes: "", priority: "Medium" };
const PRIO_STYLE: Record<string, string> = { High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-green-100 text-green-700" };
const db = supabase as any;

export default function WhereToFindTab() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [geoFilter, setGeoFilter] = useState("All");
  const [prioFilter, setPrioFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });

  const load = async () => {
    const { data, error } = await db.from("ghq_resources").select("*").order("created_at");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_resources").insert(RESOURCES_SEED); load(); return; }
    setResources(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const { error } = await db.from("ghq_resources").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Resource added");
    setForm({ ...BLANK }); setShowForm(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete resource?")) return;
    await db.from("ghq_resources").delete().eq("id", id);
    load();
  };

  const visible = resources
    .filter(r => geoFilter === "All" || r.geography === geoFilter)
    .filter(r => prioFilter === "All" || r.priority === prioFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          <select className="input max-w-[140px]" value={geoFilter} onChange={e => setGeoFilter(e.target.value)}>
            {GEOS.map(g => <option key={g}>{g}</option>)}
          </select>
          <select className="input max-w-[120px]" value={prioFilter} onChange={e => setPrioFilter(e.target.value)}>
            {["All", ...PRIOS].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> Add Resource
        </button>
      </div>

      {showForm && (
        <div className="card border-marigold/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger text-sm">New Resource</span>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="label">Channel / Place Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">Geography</label>
              <select className="input" value={form.geography} onChange={e => setForm(f => ({ ...f, geography: e.target.value }))}>
                {GEOS.slice(1).map(g => <option key={g}>{g}</option>)}
              </select></div>
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIOS.map(p => <option key={p}>{p}</option>)}
              </select></div>
            <div className="md:col-span-2"><label className="label">Link (URL)</label>
              <input className="input" placeholder="https://..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} /></div>
            <div className="md:col-span-2"><label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save Resource</button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {visible.length === 0 && (
        <div className="text-center py-12 text-ledger/40">
          <p className="text-2xl mb-2">🗺</p><p>No resources match the current filters.</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-ledger/10">
        <table className="w-full text-sm">
          <thead className="bg-khadi/50">
            <tr className="text-left text-xs uppercase tracking-wider text-ledger/50">
              {["Channel / Place", "Geography", "Type", "Priority", "Notes", "Link", ""].map((h, i) => (
                <th key={i} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.id} className="border-t border-ledger/5 hover:bg-cream/40">
                <td className="px-4 py-3 font-medium text-ledger">{r.name}</td>
                <td className="px-4 py-3 text-ledger/70">{r.geography}</td>
                <td className="px-4 py-3 text-ledger/70">{r.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PRIO_STYLE[r.priority] ?? ""}`}>{r.priority}</span>
                </td>
                <td className="px-4 py-3 text-ledger/60 max-w-xs truncate">{r.notes}</td>
                <td className="px-4 py-3">
                  {r.link ? <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-marigold text-xs hover:underline">Open ↗</a> : <span className="text-ledger/30 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => del(r.id)} className="text-ledger/30 hover:text-danger"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
