import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PersonasTab from "@/components/growth-hq/PersonasTab";
import WhereToFindTab from "@/components/growth-hq/WhereToFindTab";
import PsychologyTab from "@/components/growth-hq/PsychologyTab";
import EcgBoardTab from "@/components/growth-hq/EcgBoardTab";
import CompetitorsTab from "@/components/growth-hq/CompetitorsTab";
import { Users, MapPin, Brain, Layers, Swords } from "lucide-react";

const db = supabase as any;

const TABS = [
  { key: "personas",     label: "Personas",          icon: Users,  desc: "Who we target",          table: "ghq_personas" },
  { key: "where",        label: "Where To Find",     icon: MapPin, desc: "Channels & communities",  table: "ghq_resources" },
  { key: "psychology",   label: "Psychology",        icon: Brain,  desc: "Hooks & tricks",          table: null },
  { key: "ecg",          label: "ECG Board",         icon: Layers, desc: "Content ideas pipeline",  table: "ghq_content_ideas" },
  { key: "competitors",  label: "Competitors",       icon: Swords, desc: "Intel & counter-angles",  table: "ghq_competitors" },
];

export default function GrowthStudioPage() {
  const [tab, setTab] = useState("personas");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const tables = TABS.filter(t => t.table).map(t => t.table!);
    Promise.all(
      tables.map(t => db.from(t).select("id", { count: "exact", head: true }))
    ).then(results => {
      const c: Record<string, number> = {};
      tables.forEach((t, i) => { c[t] = results[i].count ?? 0; });
      setCounts(c);
    });
  }, [tab]);

  const active = TABS.find(t => t.key === tab)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Content Studio</h1>
          <p className="text-sm text-ledger/60 mt-0.5">Research hub — personas, psychology, content ideas, competitive intel.</p>
        </div>
        {/* Stats row */}
        <div className="flex gap-3 flex-wrap">
          {TABS.filter(t => t.table).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition ${
                tab === t.key ? "bg-ledger text-cream border-ledger" : "border-ledger/15 text-ledger/60 hover:bg-khadi"
              }`}>
              <t.icon size={12} />
              <span>{counts[t.table!] ?? "…"}</span>
              <span className="text-[10px] opacity-70">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-2xl bg-khadi/40 p-1.5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition flex-1 justify-center ${
              tab === t.key
                ? "bg-white text-ledger shadow-sm"
                : "text-ledger/60 hover:text-ledger hover:bg-white/50"
            }`}
          >
            <t.icon size={15} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Active tab description */}
      <div className="flex items-center gap-2 px-1">
        <active.icon size={15} className="text-marigold" />
        <span className="text-sm text-ledger/60">{active.desc}</span>
      </div>

      {/* Tab content */}
      <div>
        {tab === "personas"   && <PersonasTab />}
        {tab === "where"      && <WhereToFindTab />}
        {tab === "psychology" && <PsychologyTab />}
        {tab === "ecg"        && <EcgBoardTab />}
        {tab === "competitors"&& <CompetitorsTab />}
      </div>
    </div>
  );
}
