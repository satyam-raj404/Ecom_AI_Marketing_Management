import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PSYCHOLOGY_HOOKS } from "@/constants/growthHqSeed";

type Note = { id: string; link: string; niche: string; trick_used: string; takeaway: string };
const BLANK = { link: "", niche: "", trick_used: "", takeaway: "" };
const db = supabase as any;

export default function PsychologyTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [activeHook, setActiveHook] = useState<number | null>(null);

  const load = async () => {
    const { data } = await db.from("ghq_psych_notes").select("*").order("created_at", { ascending: false });
    setNotes(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.takeaway.trim()) return toast.error("Takeaway required");
    const { error } = await db.from("ghq_psych_notes").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Note added");
    setForm({ ...BLANK }); setShowForm(false); load();
  };

  const del = async (id: string) => {
    await db.from("ghq_psych_notes").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Section A — Reference hooks database */}
      <div>
        <h3 className="text-base font-semibold text-ledger mb-1">Section A — Hooks Database</h3>
        <p className="text-sm text-ledger/60 mb-3">Reference while writing scripts. Click any row to expand.</p>
        <div className="rounded-xl border border-ledger/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-khadi/50">
              <tr className="text-left text-[10px] uppercase tracking-wider text-ledger/50">
                <th className="px-3 py-2.5 w-6">#</th>
                <th className="px-3 py-2.5">Trick</th>
                <th className="px-3 py-2.5 hidden md:table-cell">What It Does</th>
                <th className="px-3 py-2.5 hidden lg:table-cell">Where To Use</th>
              </tr>
            </thead>
            <tbody>
              {PSYCHOLOGY_HOOKS.map((h, i) => (
                <>
                  <tr key={i} className={`border-t border-ledger/5 cursor-pointer hover:bg-cream/60 ${activeHook === i ? "bg-cream/80" : ""}`}
                    onClick={() => setActiveHook(activeHook === i ? null : i)}>
                    <td className="px-3 py-2.5 text-ledger/40 font-mono text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-ledger">{h.trick}</td>
                    <td className="px-3 py-2.5 text-ledger/70 hidden md:table-cell">{h.what_it_does}</td>
                    <td className="px-3 py-2.5 text-ledger/60 hidden lg:table-cell text-xs">{h.where_to_use}</td>
                  </tr>
                  {activeHook === i && (
                    <tr key={`${i}-expand`} className="bg-mustard/5">
                      <td colSpan={4} className="px-4 pb-3 pt-2">
                        <div className="space-y-1">
                          <p className="text-xs text-ledger/50 uppercase tracking-wider">EcomBharat Example</p>
                          <p className="text-sm text-ledger/80 italic">"{h.ecombharat_example}"</p>
                          <p className="text-xs text-ledger/50 mt-1">Use: {h.where_to_use}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section B — Team Research Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-ledger">Section B — Team Research Notes</h3>
            <p className="text-sm text-ledger/60">Paste viral video links + what made them work</p>
          </div>
          <button className="btn-primary text-sm" onClick={() => setShowForm(v => !v)}>
            <Plus size={14} /> Add Note
          </button>
        </div>

        {showForm && (
          <div className="card border-marigold/30 space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ledger text-sm">New Research Note</span>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-ledger/40" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className="label">Creator / Video Link</label>
                <input className="input" placeholder="https://instagram.com/..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} /></div>
              <div><label className="label">Niche</label>
                <input className="input" placeholder="Wholesale / Finance / MSME..." value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))} /></div>
              <div><label className="label">Hook / Trick They Used</label>
                <input className="input" placeholder="e.g. Open Loop, Twist the Knife..." value={form.trick_used} onChange={e => setForm(f => ({ ...f, trick_used: e.target.value }))} /></div>
              <div><label className="label">Our Takeaway *</label>
                <input className="input" placeholder="What should we copy?" value={form.takeaway} onChange={e => setForm(f => ({ ...f, takeaway: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm" onClick={save}>Save Note</button>
              <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center py-8 text-ledger/40">
            <p className="text-xl mb-1">📝</p>
            <p className="text-sm">No research notes yet. Paste a viral video link to start.</p>
          </div>
        )}

        <div className="space-y-2">
          {notes.map(n => (
            <div key={n.id} className="flex gap-3 items-start rounded-lg border border-ledger/10 bg-white p-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 text-xs text-ledger/50 mb-1">
                  {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-marigold hover:underline truncate max-w-[180px]">{n.link}</a>}
                  {n.niche && <span>• {n.niche}</span>}
                  {n.trick_used && <span className="text-mustard font-medium">• {n.trick_used}</span>}
                </div>
                <p className="text-sm text-ledger">{n.takeaway}</p>
              </div>
              <button onClick={() => del(n.id)} className="text-ledger/30 hover:text-danger shrink-0 mt-0.5"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
