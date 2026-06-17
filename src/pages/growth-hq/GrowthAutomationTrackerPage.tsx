import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, Cog, CheckCircle2, Clock, Loader, IndianRupee, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AUTOMATIONS_SEED } from "@/constants/growthHqSeed";

type Automation = {
  id: string; task: string; tool: string; cost: string;
  priority: string; status: string; owner: string; notes: string;
};

const STATUSES = ["To Do", "In Progress", "Done"];
const PRIOS    = ["High", "Medium", "Low"];
const OWNERS   = ["Satyam", "Amitav", "Dipali", "Intern", "—"];
const BLANK    = { task: "", tool: "", cost: "", priority: "High", status: "To Do", owner: "Satyam", notes: "" };

const db = supabase as any;

const STATUS_META: Record<string, { icon: typeof Clock; color: string; bg: string; ring: string; label: string }> = {
  "To Do":      { icon: Clock,         color: "text-ledger/60",  bg: "bg-ledger/8",     ring: "ring-ledger/15",  label: "To Do" },
  "In Progress":{ icon: Loader,        color: "text-amber-700",  bg: "bg-amber-50",     ring: "ring-amber-200",  label: "In Progress" },
  "Done":       { icon: CheckCircle2,  color: "text-emerald-700",bg: "bg-emerald-50",   ring: "ring-emerald-200",label: "Done" },
};

const PRIO_STYLE: Record<string, string> = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-slate-100 text-slate-600",
};

const OWNER_COLOR: Record<string, string> = {
  Satyam: "bg-blue-100 text-blue-700",
  Amitav: "bg-violet-100 text-violet-700",
  Dipali: "bg-pink-100 text-pink-700",
  Intern: "bg-slate-100 text-slate-600",
  "—":    "bg-ledger/10 text-ledger/50",
};

function parseCost(cost: string): number {
  const m = cost.match(/[\d,]+/);
  if (!m) return 0;
  const n = parseInt(m[0].replace(/,/g, ""), 10);
  if (cost.toLowerCase().includes("mo") || cost.toLowerCase().includes("month")) return n;
  return n;
}

export default function GrowthAutomationTrackerPage() {
  const [rows, setRows]       = useState<Automation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ ...BLANK });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const load = async () => {
    const { data, error } = await db.from("ghq_automations").select("*").order("created_at");
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (data.length === 0) { await db.from("ghq_automations").insert(AUTOMATIONS_SEED); load(); return; }
    setRows(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.task.trim()) return toast.error("Task required");
    const { error } = await db.from("ghq_automations").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Automation task added");
    setForm({ ...BLANK }); setShowForm(false); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await db.from("ghq_automations").update({ status }).eq("id", id);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const del = async (id: string) => {
    if (!confirm("Delete automation?")) return;
    await db.from("ghq_automations").delete().eq("id", id);
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const doneCount  = rows.filter(r => r.status === "Done").length;
  const totalMoCost = rows
    .filter(r => r.cost && r.cost.toLowerCase() !== "free" && r.cost !== "—")
    .reduce((sum, r) => sum + parseCost(r.cost), 0);

  if (loading) return <div className="text-ledger/40 text-sm py-10 text-center">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Automation Tracker</h1>
          <p className="text-sm text-ledger/60 mt-0.5">What to automate, which tool, who owns it.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-ledger/15 bg-white">
            <button onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-xs font-medium transition ${viewMode === "kanban" ? "bg-ledger text-cream" : "text-ledger/60 hover:bg-khadi"}`}>
              Kanban
            </button>
            <button onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-medium transition ${viewMode === "table" ? "bg-ledger text-cream" : "text-ledger/60 hover:bg-khadi"}`}>
              Table
            </button>
          </div>
          <button className="btn-primary text-sm shrink-0 flex items-center gap-1.5"
            onClick={() => setShowForm(v => !v)}>
            <Plus size={14} /> Add Automation
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-ledger/10 shadow-sm px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-ledger/40 mb-1">Progress</div>
          <div className="text-2xl font-semibold text-ledger">{doneCount}<span className="text-base text-ledger/40">/{rows.length}</span></div>
          <div className="mt-2 h-1.5 bg-ledger/8 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: rows.length ? `${(doneCount / rows.length) * 100}%` : "0%" }} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-ledger/10 shadow-sm px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-ledger/40 mb-1">Monthly Cost</div>
          <div className="text-2xl font-semibold text-ledger flex items-start gap-0.5">
            <IndianRupee size={14} className="mt-1.5" />
            {totalMoCost > 0 ? totalMoCost.toLocaleString() : "—"}
          </div>
          <div className="text-[10px] text-ledger/40 mt-1">paid tools only</div>
        </div>
        <div className="rounded-2xl bg-white border border-ledger/10 shadow-sm px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-ledger/40 mb-1">High Priority Left</div>
          <div className="text-2xl font-semibold text-red-600">
            {rows.filter(r => r.priority === "High" && r.status !== "Done").length}
          </div>
          <div className="text-[10px] text-ledger/40 mt-1">not done yet</div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-marigold/30 bg-white shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ledger">New Automation Task</span>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-ledger/40" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              ["What to Automate *", "task"],
              ["Tool (free first)", "tool"],
              ["Cost (e.g. Free / $15/mo)", "cost"],
            ] as [string, keyof typeof BLANK][]).map(([label, key]) => (
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
              <textarea className="input resize-none" rows={2} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={save}>Save</button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban view */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map(status => {
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            const colRows = rows.filter(r => r.status === status);
            return (
              <div key={status} className={`rounded-2xl border bg-white shadow-sm overflow-hidden ring-1 ${meta.ring}`}>
                <div className={`px-4 py-3 border-b border-ledger/8 ${meta.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={meta.color} />
                      <span className={`font-semibold text-sm ${meta.color}`}>{status}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} border border-current/20`}>
                      {colRows.length}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2 min-h-[200px]">
                  {colRows.map(r => (
                    <div key={r.id}
                      className="rounded-xl bg-cream/40 border border-ledger/8 p-3 group hover:bg-white hover:shadow-sm transition">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-ledger leading-snug flex-1">{r.task}</p>
                        <button onClick={() => del(r.id)}
                          className="opacity-0 group-hover:opacity-100 text-ledger/20 hover:text-red-500 flex-shrink-0 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {r.tool && (
                        <div className="inline-flex items-center gap-1 text-[11px] bg-ledger text-cream rounded-full px-2 py-0.5 mb-2">
                          <Cog size={9} /> {r.tool}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIO_STYLE[r.priority] ?? PRIO_STYLE.Low}`}>
                          {r.priority}
                        </span>
                        {r.cost && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            r.cost.toLowerCase() === "free" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {r.cost}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${OWNER_COLOR[r.owner] ?? OWNER_COLOR["—"]}`}>
                          <User size={8} /> {r.owner}
                        </span>
                      </div>

                      {r.notes && (
                        <p className="text-[11px] text-ledger/50 leading-snug line-clamp-2">{r.notes}</p>
                      )}

                      {/* Status move buttons */}
                      <div className="flex gap-1 mt-2 pt-2 border-t border-ledger/5">
                        {STATUSES.filter(s => s !== status).map(s => (
                          <button key={s} onClick={() => updateStatus(r.id, s)}
                            className="text-[10px] px-2 py-0.5 rounded-full border border-ledger/15 text-ledger/50 hover:border-ledger/40 hover:text-ledger transition">
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {colRows.length === 0 && (
                    <p className="text-xs text-center text-ledger/25 py-6 italic">Nothing here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-2xl border border-ledger/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-khadi/50 border-b border-ledger/8">
              <tr className="text-left text-[10px] uppercase tracking-wider text-ledger/50">
                <th className="px-4 py-3">What To Automate</th>
                <th className="px-4 py-3 hidden md:table-cell">Tool</th>
                <th className="px-4 py-3 hidden md:table-cell">Cost</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Owner</th>
                <th className="px-4 py-3 hidden xl:table-cell">Notes</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-ledger/5 hover:bg-cream/30 transition">
                  <td className="px-4 py-3 font-medium text-ledger">{r.task}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {r.tool && (
                      <span className="inline-flex items-center gap-1 text-xs bg-ledger/8 text-ledger/70 rounded-full px-2 py-0.5">
                        <Cog size={10} /> {r.tool}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.cost?.toLowerCase() === "free" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>{r.cost || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIO_STYLE[r.priority] ?? PRIO_STYLE.Low}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`rounded-lg text-xs py-1 px-2 border font-medium cursor-pointer focus:outline-none ${
                        r.status === "Done" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                        r.status === "In Progress" ? "bg-amber-50 border-amber-200 text-amber-700" :
                        "bg-ledger/5 border-ledger/15 text-ledger/60"
                      }`}
                      value={r.status}
                      onChange={e => updateStatus(r.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${OWNER_COLOR[r.owner] ?? OWNER_COLOR["—"]}`}>
                      {r.owner}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-ledger/50 text-xs max-w-[200px] truncate">{r.notes}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(r.id)} className="text-ledger/25 hover:text-danger transition">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
