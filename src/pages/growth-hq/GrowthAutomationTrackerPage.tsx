import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AUTOMATIONS_SEED } from "@/constants/growthHqSeed";

type Automation = { id: string; task: string; tool: string; cost: string; priority: string; status: string; owner: string; notes: string };

const STATUSES = ["To Do", "In Progress", "Done"];
const PRIOS = ["High", "Medium", "Low"];
const OWNERS = ["Satyam", "Amitav", "Dipali", "Intern", "—"];
const BLANK = { task: "", tool: "", cost: "", priority: "High", status: "To Do", owner: "Satyam", notes: "" };
const db = supabase as any;

const STATUS_STYLE: Record<string, string> = {
  "To Do": "bg-ledger/10 text-ledger/60",
  "In Progress": "bg-amber-100 text-amber-800",
  "Done": "bg-success/15 text-success",
};

const PRIO_DOT: Record<string, string> = { High: "bg-danger", Medium: "bg-mustard", Low: "bg-success" };

export default function GrowthAutomationTrackerPage() {
  const [rows, setRows] = useState<Automation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });

  const load = async () => {
    const { data, error } = await db.from("ghq_automations").select("*").order("created_at");
    if (error) { toast.error(error.message); return; }
    if (data.length === 0) { await db.from("ghq_automations").insert(AUTOMATIONS_SEED); load(); return; }
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.task.trim()) return toast.error("Task required");
    const { error } = await db.from("ghq_automations").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Automation task added");
    setForm({ ...BLANK }); setShowForm(false); load();
  };

  const updateField = async (id: string, field: string, value: string) => {
    await db.from("ghq_automations").update({ [field]: value }).eq("id", id);
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const del = async (id: string) => {
    if (!confirm("Delete automation?")) return;
    await db.from("ghq_automations").delete().eq("id", id);
    load();
  };

  const doneCount = rows.filter(r => r.status === "Done").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">⚙️ Automation Tracker</h1>
          <p className="text-sm text-ledger/60">What to automate, which tool, who owns it.</p>
          {rows.length > 0 && (
            <p className="text-xs text-ledger/40 mt-0.5">{doneCount}/{rows.length} automated</p>
          )}
        </div>
        <button className="btn-primary text-sm shrink-0" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> Add Automation
        </button>
      </header>

      {showForm && (
        <div className="card border-marigold/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger text-sm">New Automation Task</span>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([ ["What to Automate *", "task"], ["Tool (free first)", "tool"], ["Cost", "cost"] ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIOS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Owner</label>
              <select className="input" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save</button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-ledger/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-khadi/50">
            <tr className="text-left text-[10px] uppercase tracking-wider text-ledger/50">
              <th className="px-4 py-3">What To Automate</th>
              <th className="px-4 py-3 hidden md:table-cell">Tool</th>
              <th className="px-4 py-3 hidden md:table-cell">Cost</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Owner</th>
              <th className="px-4 py-3 hidden lg:table-cell">Notes</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-ledger/5 hover:bg-cream/40">
                <td className="px-4 py-3 font-medium text-ledger">{r.task}</td>
                <td className="px-4 py-3 hidden md:table-cell text-ledger/70">{r.tool}</td>
                <td className="px-4 py-3 hidden md:table-cell text-ledger/60 text-xs">{r.cost}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${PRIO_DOT[r.priority] ?? "bg-ledger/20"}`} />
                    {r.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className={`rounded-md text-xs py-1 px-2 border-0 font-medium cursor-pointer ${STATUS_STYLE[r.status] ?? STATUS_STYLE["To Do"]}`}
                    value={r.status}
                    onChange={e => updateField(r.id, "status", e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-ledger/70 text-xs">{r.owner}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-ledger/60 text-xs max-w-[200px] truncate">{r.notes}</td>
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
