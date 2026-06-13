import PersonasTab from "@/components/growth-hq/PersonasTab";
import WhereToFindTab from "@/components/growth-hq/WhereToFindTab";
import PsychologyTab from "@/components/growth-hq/PsychologyTab";
import EcgBoardTab from "@/components/growth-hq/EcgBoardTab";
import CompetitorsTab from "@/components/growth-hq/CompetitorsTab";
import { useState } from "react";

const TABS = [
  { key: "personas", label: "Personas" },
  { key: "where", label: "Where To Find" },
  { key: "psychology", label: "Psychology Toolkit" },
  { key: "ecg", label: "ECG Categories" },
  { key: "competitors", label: "Competitors" },
];

// Growth HQ — Content Studio with 5 sub-tabs
export default function GrowthStudioPage() {
  const [tab, setTab] = useState("personas");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">🎨 Content Studio</h1>
        <p className="text-sm text-ledger/60">Your research hub — personas, hooks, content ideas, and competitive intel.</p>
      </header>

      {/* Pill-style sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ledger/10 pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition
              ${tab === t.key ? "bg-ledger text-cream" : "bg-cream text-ledger/70 hover:bg-khadi border border-ledger/15"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "personas" && <PersonasTab />}
        {tab === "where" && <WhereToFindTab />}
        {tab === "psychology" && <PsychologyTab />}
        {tab === "ecg" && <EcgBoardTab />}
        {tab === "competitors" && <CompetitorsTab />}
      </div>
    </div>
  );
}
