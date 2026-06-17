import { useEffect, useState } from "react";
import {
  Play, Loader2, Check, AlertCircle, Circle,
  Link2, FileSpreadsheet, Zap, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useConnections } from "@/hooks/useConnections";
import { useSheet } from "@/hooks/useSheet";
import type { ContentRun } from "@/types";
import { PLATFORMS } from "@/constants/platforms";

const STEPS = [
  { key: "fetch",        title: "Fetch Today's Content Ideas",   desc: "Read today's row from Google Sheet",          icon: "📋" },
  { key: "posts",        title: "Generate Social Media Posts",   desc: "Claude writes platform-specific posts",       icon: "✍️" },
  { key: "image_prompt", title: "Refine Image Prompt",           desc: "Claude crafts a detailed image description",  icon: "🎨" },
  { key: "save_sheet",   title: "Save Posts to Sheet",           desc: "Write generated content back to your sheet",  icon: "💾" },
  { key: "images",       title: "Generate Platform Images",      desc: "Create optimised images per platform",        icon: "🖼️" },
  { key: "publish",      title: "Publish to Social Media",       desc: "Post to all connected platforms",             icon: "🚀" },
];

const STEP_ORDER = STEPS.map(s => s.key);

function getStepState(key: string, run: ContentRun | null): "waiting" | "running" | "done" | "error" {
  if (!run) return "waiting";
  if (run.status === "error" && run.current_step === key) return "error";
  if (run.status === "completed") return "done";
  const cur = run.current_step ? STEP_ORDER.indexOf(run.current_step) : -1;
  const idx = STEP_ORDER.indexOf(key);
  if (cur < 0) return "waiting";
  if (idx < cur) return "done";
  if (idx === cur) return run.status === "running" ? "running" : "done";
  return "waiting";
}

export default function AutomationPage() {
  const { connections } = useConnections();
  const { sheet } = useSheet();
  const [run, setRun]     = useState<ContentRun | null>(null);
  const [running, setRunning] = useState(false);

  const connectedCount = connections.filter(c => c.status === "connected").length;
  const today = new Date().toISOString().split("T")[0];
  const isSetupDone = !!sheet?.sheet_id && connectedCount > 0;
  const canRun = isSetupDone && !running && run?.status !== "running";

  // Load today's run
  useEffect(() => {
    supabase.from("content_runs")
      .select("*").eq("run_date", today)
      .order("started_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setRun((data as ContentRun) ?? null));
  }, [today]);

  // Live updates
  useEffect(() => {
    if (!run?.id) return;
    const ch = supabase.channel(`run-${run.id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "content_runs", filter: `id=eq.${run.id}` },
        payload => setRun(payload.new as ContentRun))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [run?.id]);

  const startPipeline = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-pipeline");
      if (error) throw error;
      if (data?.runId) {
        const { data: r } = await supabase.from("content_runs").select("*").eq("id", data.runId).single();
        setRun(r as ContentRun);
      }
      toast.success("Pipeline started");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl text-ledger">Automation</h1>
        <p className="text-sm text-ledger/60 mt-0.5">Run the full AI content pipeline for today.</p>
      </div>

      {/* Setup checklist — shown when not configured */}
      {!isSetupDone && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600" />
            <h2 className="font-semibold text-amber-800 text-sm">Complete setup before running the pipeline</h2>
          </div>
          <div className="space-y-2">
            <SetupRow
              done={!!sheet?.sheet_id}
              icon={<FileSpreadsheet size={15} />}
              label="Google Sheet connected"
              subLabel={sheet?.sheet_id ? sheet.sheet_url ?? "" : "Paste your ideas sheet URL"}
              to="/sheet"
            />
            <SetupRow
              done={connectedCount > 0}
              icon={<Link2 size={15} />}
              label={`Social platforms (${connectedCount}/${PLATFORMS.length} connected)`}
              subLabel={connectedCount === 0 ? "Connect at least one social account" : `${connectedCount} platform${connectedCount > 1 ? "s" : ""} ready`}
              to="/connectors"
            />
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-ledger/10 shadow-sm px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-ledger/40">Today</div>
          <div className="text-sm font-semibold text-ledger mt-0.5 leading-tight">{todayLabel}</div>
        </div>
        <div className={`rounded-2xl border shadow-sm px-4 py-3 ${sheet?.sheet_id ? "bg-emerald-50 border-emerald-100" : "bg-white border-ledger/10"}`}>
          <div className="text-[10px] uppercase tracking-wider text-ledger/40">Sheet</div>
          <div className={`text-sm font-semibold mt-0.5 flex items-center gap-1.5 ${sheet?.sheet_id ? "text-emerald-700" : "text-ledger/40"}`}>
            {sheet?.sheet_id ? <><Check size={13} /> Connected</> : "Not connected"}
          </div>
        </div>
        <div className={`rounded-2xl border shadow-sm px-4 py-3 ${connectedCount > 0 ? "bg-emerald-50 border-emerald-100" : "bg-white border-ledger/10"}`}>
          <div className="text-[10px] uppercase tracking-wider text-ledger/40">Platforms</div>
          <div className={`text-sm font-semibold mt-0.5 ${connectedCount > 0 ? "text-emerald-700" : "text-ledger/40"}`}>
            {connectedCount}/{PLATFORMS.length} connected
          </div>
        </div>
      </div>

      {/* Run button */}
      <div className={`rounded-2xl border p-6 text-center transition ${isSetupDone ? "bg-white border-ledger/10 shadow-sm" : "bg-ledger/3 border-ledger/8 opacity-60"}`}>
        <button
          onClick={startPipeline}
          disabled={!canRun}
          className={`mx-auto flex items-center gap-3 text-lg font-semibold px-10 py-4 rounded-2xl transition ${
            canRun
              ? "bg-marigold text-white hover:bg-marigold/90 shadow-lg shadow-marigold/25 hover:shadow-xl hover:-translate-y-0.5"
              : "bg-ledger/10 text-ledger/30 cursor-not-allowed"
          }`}
        >
          {running || run?.status === "running"
            ? <><Loader2 size={22} className="animate-spin" /> Pipeline Running…</>
            : run?.status === "completed"
              ? <><Check size={22} /> Run Again</>
              : <><Play size={22} /> Run Today's Pipeline</>
          }
        </button>
        {run?.status === "completed" && (
          <p className="mt-3 text-sm text-emerald-600 font-medium">✓ Pipeline completed for today</p>
        )}
        {!isSetupDone && (
          <p className="mt-3 text-xs text-ledger/40">Complete setup above first</p>
        )}
      </div>

      {/* Pipeline steps — vertical timeline */}
      <div>
        <h2 className="text-sm font-semibold text-ledger/60 uppercase tracking-wider mb-3">Pipeline Steps</h2>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-ledger/8 rounded-full" />
          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const state = getStepState(s.key, run);
              return (
                <div key={s.key} className={`relative flex items-start gap-4 rounded-2xl px-4 py-3.5 border transition ${
                  state === "running" ? "bg-marigold/5 border-marigold/30 shadow-sm" :
                  state === "done"    ? "bg-emerald-50/50 border-emerald-100" :
                  state === "error"   ? "bg-red-50 border-red-200" :
                  "bg-white border-ledger/8"
                }`}>
                  {/* Step indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold z-10 ${
                    state === "done"    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" :
                    state === "running" ? "bg-marigold text-white shadow-sm shadow-marigold/30" :
                    state === "error"   ? "bg-red-500 text-white" :
                    "bg-white border-2 border-ledger/15 text-ledger/30"
                  }`}>
                    {state === "done" ? <Check size={16} /> :
                     state === "running" ? <Loader2 size={16} className="animate-spin" /> :
                     state === "error" ? <AlertCircle size={16} /> :
                     <span className="text-sm">{s.icon}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-sm ${state === "done" ? "text-emerald-700" : state === "running" ? "text-marigold" : "text-ledger"}`}>
                        {s.title}
                      </h4>
                      {state === "running" && (
                        <span className="text-[10px] bg-marigold/15 text-marigold px-2 py-0.5 rounded-full font-medium animate-pulse">
                          Running
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ledger/50 mt-0.5">{s.desc}</p>
                  </div>

                  <div className="text-xs text-ledger/30 flex-shrink-0 self-center">
                    {i + 1}/{STEPS.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error display */}
      {run?.error_message && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2 text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Pipeline error</p>
              <p className="text-xs mt-0.5 text-red-600">{run.error_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="rounded-2xl bg-khadi/30 border border-ledger/8 p-4">
        <p className="text-xs font-semibold text-ledger/50 uppercase tracking-wider mb-3">Quick Setup Links</p>
        <div className="flex flex-wrap gap-2">
          {[
            { to: "/sheet", icon: FileSpreadsheet, label: "Google Sheet" },
            { to: "/connectors", icon: Link2, label: "Social Connectors" },
            { to: "/gallery", icon: Zap, label: "Image Gallery" },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium bg-white border border-ledger/10 text-ledger/70 hover:text-ledger hover:shadow-sm transition">
              <Icon size={13} /> {label} <ChevronRight size={11} className="text-ledger/30" />
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupRow({ done, icon, label, subLabel, to }: {
  done: boolean; icon: React.ReactNode; label: string; subLabel: string; to: string;
}) {
  return (
    <NavLink to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition hover:shadow-sm ${
        done ? "bg-emerald-50 border-emerald-200" : "bg-white border-amber-200 hover:border-amber-400"
      }`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600"}`}>
        {done ? <Check size={13} /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${done ? "text-emerald-700" : "text-amber-800"}`}>{label}</div>
        <div className="text-xs text-ledger/50 truncate">{subLabel}</div>
      </div>
      {!done && <ChevronRight size={14} className="text-amber-400 flex-shrink-0" />}
    </NavLink>
  );
}
