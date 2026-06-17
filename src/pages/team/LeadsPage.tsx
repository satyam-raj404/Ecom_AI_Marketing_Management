import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STAGES = ["new", "contacted", "demo", "pilot", "paid", "lost"] as const;

const STAGE_COLOR: Record<string, string> = {
  new:       "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  demo:      "bg-amber-100 text-amber-700",
  pilot:     "bg-violet-100 text-violet-700",
  paid:      "bg-emerald-100 text-emerald-700",
  lost:      "bg-red-100 text-red-600",
};

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  source: string;
  stage: string;
  owner: string;
  notes: string;
  last_contacted: string;
};

const normalize = (r: Record<string, unknown>): Lead => ({
  id: r.id as string,
  name: (r.name as string) ?? "",
  company: (r.company as string) ?? "",
  email: (r.email as string) ?? "",
  phone: (r.phone as string) ?? "",
  city: (r.city as string) ?? "",
  source: (r.source as string) ?? "",
  stage: (r.stage as string) ?? "new",
  owner: (r.owner as string) ?? "",
  notes: (r.notes as string) ?? "",
  last_contacted: (r.last_contacted as string) ?? "",
});

const COLS: { key: keyof Omit<Lead, "id" | "stage">; label: string; width: string; type?: string }[] = [
  { key: "name",           label: "Name",         width: "min-w-[140px]" },
  { key: "company",        label: "Company",       width: "min-w-[130px]" },
  { key: "phone",          label: "Phone",         width: "min-w-[120px]" },
  { key: "email",          label: "Email",         width: "min-w-[160px]" },
  { key: "city",           label: "City",          width: "min-w-[90px]" },
  { key: "source",         label: "Source",        width: "min-w-[110px]" },
  { key: "owner",          label: "Owner",         width: "min-w-[100px]" },
  { key: "notes",          label: "Notes",         width: "min-w-[200px]" },
  { key: "last_contacted", label: "Last Contact",  width: "min-w-[130px]", type: "date" },
];

const db = supabase as any;

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await db
      .from("pipeline_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setLeads((data ?? []).map(normalize));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRow = async () => {
    const { data, error } = await db
      .from("pipeline_leads")
      .insert({ name: "", stage: "new", owner: user?.email ?? "" })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setLeads(prev => [normalize(data), ...prev]);
  };

  const updateLocal = (id: string, field: keyof Lead, value: string) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const saveField = async (id: string, field: keyof Lead, value: string) => {
    await db.from("pipeline_leads").update({ [field]: value || null }).eq("id", id);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await db.from("pipeline_leads").delete().eq("id", id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const stageColor = (s: string) => STAGE_COLOR[s] ?? STAGE_COLOR.new;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Lead Hunter</h1>
          <p className="text-sm text-ledger/60">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} · Click any cell to edit · Tab to move across
          </p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-1.5" onClick={addRow}>
          <Plus size={15} /> Add Row
        </button>
      </header>

      {loading ? (
        <div className="text-sm text-ledger/50">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ledger/10 shadow-sm bg-white">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-ledger text-cream">
                <th className="px-3 py-2.5 text-left text-xs tracking-wider text-cream/50 w-8">#</th>
                {COLS.map(c => (
                  <th key={c.key} className={`px-3 py-2.5 text-left text-xs tracking-wider text-cream/70 ${c.width}`}>
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left text-xs tracking-wider text-cream/70 min-w-[110px]">Stage</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={COLS.length + 3} className="py-12 text-center text-sm text-ledger/40 italic">
                    No leads yet — click Add Row to start
                  </td>
                </tr>
              )}
              {leads.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={`border-t border-ledger/5 group hover:bg-marigold/5 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-cream/30"
                  }`}
                >
                  <td className="px-3 py-0 text-xs text-ledger/30 font-mono">{i + 1}</td>

                  {COLS.map(col => (
                    <td key={col.key} className="p-0">
                      <input
                        type={col.type ?? "text"}
                        value={lead[col.key]}
                        placeholder="—"
                        onChange={e => updateLocal(lead.id, col.key, e.target.value)}
                        onBlur={e => saveField(lead.id, col.key, e.target.value)}
                        className="w-full px-3 py-2 bg-transparent border-0 outline-none text-ledger text-sm
                          placeholder:text-ledger/20 focus:bg-marigold/5 focus:ring-1 focus:ring-inset
                          focus:ring-marigold/40 transition-colors"
                      />
                    </td>
                  ))}

                  <td className="px-2 py-1">
                    <select
                      value={lead.stage}
                      onChange={e => { updateLocal(lead.id, "stage", e.target.value); saveField(lead.id, "stage", e.target.value); }}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer appearance-none ${stageColor(lead.stage)}`}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>

                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={() => remove(lead.id)}
                      className="opacity-0 group-hover:opacity-100 text-ledger/30 hover:text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addRow}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-ledger/40 hover:text-ledger hover:bg-cream/60 transition border-t border-ledger/5"
          >
            <Plus size={14} /> Add row
          </button>
        </div>
      )}
    </div>
  );
}
