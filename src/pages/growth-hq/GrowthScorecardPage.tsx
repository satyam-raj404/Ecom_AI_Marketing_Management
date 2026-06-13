import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SCORECARD_SEED } from "@/constants/growthHqSeed";

type Row = { id: string; metric: string; w1: string; w2: string; w3: string; w4: string; target: string };
type Win = { id: string; win_text: string };
const db = supabase as any;

export default function GrowthScorecardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [wins, setWins] = useState<Win[]>([]);
  const [winDrafts, setWinDrafts] = useState<string[]>(["", "", ""]);

  const load = async () => {
    const [{ data: sc }, { data: wn }] = await Promise.all([
      db.from("ghq_scorecard").select("*").order("sort_order"),
      db.from("ghq_scorecard_wins").select("*").order("created_at", { ascending: false }).limit(3),
    ]);
    if (sc?.length === 0) { await db.from("ghq_scorecard").insert(SCORECARD_SEED); load(); return; }
    setRows(sc ?? []);
    setWins(wn ?? []);
    const texts = (wn ?? []).map((w: Win) => w.win_text);
    setWinDrafts([texts[0] ?? "", texts[1] ?? "", texts[2] ?? ""]);
  };

  useEffect(() => { load(); }, []);

  const updateCell = async (id: string, col: "w1" | "w2" | "w3" | "w4", value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [col]: value } : r));
    await db.from("ghq_scorecard").update({ [col]: value }).eq("id", id);
  };

  const saveWins = async () => {
    await db.from("ghq_scorecard_wins").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = winDrafts.filter(w => w.trim()).map(win_text => ({ win_text }));
    if (toInsert.length) await db.from("ghq_scorecard_wins").insert(toInsert);
    toast.success("Wins saved 🏆");
    load();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">📊 Scorecard</h1>
        <p className="text-sm text-ledger/60">Track weekly metrics. Update every Friday. Double down on winners.</p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-ledger/10 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-ledger text-cream">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-cream/70 min-w-[180px]">Metric</th>
              {["Week 1", "Week 2", "Week 3", "Week 4"].map(w => (
                <th key={w} className="px-4 py-3 text-center text-xs uppercase tracking-wider text-cream/70 min-w-[90px]">{w}</th>
              ))}
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-mustard min-w-[90px]">Month Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={`border-t border-ledger/5 ${i % 2 === 0 ? "" : "bg-cream/30"}`}>
                <td className="px-4 py-2.5 font-medium text-ledger">{row.metric}</td>
                {(["w1", "w2", "w3", "w4"] as const).map(col => (
                  <td key={col} className="px-3 py-2">
                    <DebouncedInput
                      value={row[col]}
                      onChange={v => updateCell(row.id, col, v)}
                    />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-semibold text-mustard">{row.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="text-lg text-ledger mb-1">🏆 What Worked This Month</h2>
        <p className="text-sm text-ledger/60 mb-4">Note the best-performing content or tactic from each week. Double down on winners.</p>
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i}>
              <label className="label">Win #{i + 1}</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder={`e.g. "Reels about udhaar pain got 3x more saves than other formats this week"`}
                value={winDrafts[i]}
                onChange={e => setWinDrafts(d => d.map((v, j) => j === i ? e.target.value : v))}
              />
            </div>
          ))}
          <button className="btn-primary text-sm" onClick={saveWins}>Save Wins</button>
        </div>
      </div>
    </div>
  );
}

// Debounced input for scorecard cells — saves 500ms after last keystroke
function DebouncedInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocal(value); }, [value]);

  const handle = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 500);
  };

  return (
    <input
      className="w-full rounded border border-ledger/20 bg-white px-2 py-1.5 text-center text-sm focus:border-marigold focus:outline-none focus:ring-1 focus:ring-marigold/30"
      value={local}
      onChange={e => handle(e.target.value)}
      placeholder="—"
    />
  );
}
