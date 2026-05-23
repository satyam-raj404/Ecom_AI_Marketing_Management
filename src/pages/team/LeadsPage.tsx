import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STAGES = ["new", "contacted", "demo", "pilot", "paid"] as const;
type Stage = typeof STAGES[number];

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string | null;
  stage: string | null;
  owner: string | null;
  notes: string | null;
  last_contacted: string | null;
};

// Lead Hunter — Kanban board + manual add. WhatsApp & LinkedIn scraper
// flows are surfaced as honest "not wired yet" notices until those backends ship.
export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({ stage: "new" });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pipeline_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setLeads(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("pipeline_leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_leads" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addLead = async () => {
    if (!form.name?.trim()) return toast.error("Name required");
    const { error } = await supabase.from("pipeline_leads").insert({
      ...form,
      name: form.name!,
      owner: form.owner || user?.email || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Lead added");
    setForm({ stage: "new" });
    setShowForm(false);
  };

  const moveStage = async (id: string, stage: Stage) => {
    const { error } = await supabase.from("pipeline_leads").update({ stage }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete lead?")) return;
    const { error } = await supabase.from("pipeline_leads").delete().eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Lead Hunter</h1>
          <p className="text-sm text-ledger/60">Pipeline for SMB wholesalers. Drag-equivalent via dropdown.</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add Lead
        </button>
      </header>

      <div className="card bg-khadi/40 border-marigold/30">
        <h3 className="text-sm font-semibold text-ledger">Ideal Customer Profile</h3>
        <p className="mt-1 text-sm text-ledger/70">
          Indian SMB wholesalers / distributors, 5-50 staff, doing ₹2-20 Cr / year, currently on WhatsApp + Tally.
        </p>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <h3 className="text-lg text-ledger">New Lead</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Name *" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Company" value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className="input" placeholder="Email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="City" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="Source (linkedin, mandi, referral...)" value={form.source ?? ""} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <textarea className="input" placeholder="Notes" rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={addLead}>Save</button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-ledger/60">Loading leads…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => (l.stage ?? "new") === stage);
            return (
              <div key={stage} className="rounded-xl bg-khadi/30 p-3 min-h-[200px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-ledger/70">{stage}</span>
                  <span className="text-xs text-ledger/50">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => (
                    <div key={l.id} className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-ledger text-sm">{l.name}</div>
                          {l.company && <div className="text-xs text-ledger/60">{l.company}</div>}
                        </div>
                        <button onClick={() => remove(l.id)} className="text-ledger/40 hover:text-danger">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {(l.city || l.source) && (
                        <div className="mt-1 text-[11px] text-ledger/50">
                          {[l.city, l.source].filter(Boolean).join(" · ")}
                        </div>
                      )}
                      <select
                        className="mt-2 w-full rounded border border-ledger/15 bg-white text-xs py-1"
                        value={l.stage ?? "new"}
                        onChange={(e) => moveStage(l.id, e.target.value as Stage)}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-ledger/40 italic">empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
