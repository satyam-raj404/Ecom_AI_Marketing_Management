import { useEffect, useState } from "react";
import { Play, Loader2, Check, AlertCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useConnections } from "@/hooks/useConnections";
import { useSheet } from "@/hooks/useSheet";
import type { ContentRun } from "@/types";
import { PLATFORMS } from "@/constants/platforms";

const STEPS = [
  { key: "fetch",      title: "Fetch Today's Content Ideas",     desc: "Reading today's row from your Google Sheet" },
  { key: "posts",      title: "Generate Social Media Posts",     desc: "Claude writes platform-specific posts" },
  { key: "image_prompt", title: "Refine Image Prompt",           desc: "Claude crafts a detailed image description" },
  { key: "save_sheet", title: "Save Posts to Sheet",             desc: "Writing generated content back to your sheet" },
  { key: "images",     title: "Generate Platform Images",        desc: "Creating optimised images per platform" },
  { key: "publish",    title: "Publish to Social Media",         desc: "Posting to connected platforms" },
];

// Main control room for running the daily content pipeline
export default function AutomationPage() {
  const { connections } = useConnections();
  const { sheet } = useSheet();
  const [run, setRun] = useState<ContentRun | null>(null);
  const [running, setRunning] = useState(false);

  const connectedCount = connections.filter((c) => c.status === "connected").length;
  const today = new Date().toISOString().split("T")[0];

  // Load today's run if it exists
  useEffect(() => {
    supabase.from("content_runs")
      .select("*").eq("run_date", today)
      .order("started_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setRun((data as ContentRun) ?? null));
  }, [today]);

  // Subscribe to live updates of the current run
  useEffect(() => {
    if (!run?.id) return;
    const ch = supabase.channel(`run-${run.id}`)
      .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "content_runs", filter: `id=eq.${run.id}` },
          (payload) => setRun(payload.new as ContentRun))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [run?.id]);

  const canRun = !!sheet?.sheet_id && connectedCount > 0 && !running && run?.status !== "running";

  const startPipeline = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-pipeline");
      if (error) throw error;
      if (data?.runId) {
        const { data: r } = await supabase.from("content_runs")
          .select("*").eq("id", data.runId).single();
        setRun(r as ContentRun);
      }
      toast.success("Pipeline started");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl text-ledger">Automation</h2>
        <p className="mt-1 text-inkblack/60">Run the full content pipeline for today.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Today" value={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })} />
        <StatCard label="Sheet" value={sheet?.sheet_id ? "Connected" : "Not connected"} ok={!!sheet?.sheet_id} />
        <StatCard label="Platforms" value={`${connectedCount}/${PLATFORMS.length} connected`} ok={connectedCount > 0} />
      </div>

      <div className="card text-center">
        <button onClick={startPipeline} disabled={!canRun}
          className="btn-primary mx-auto text-lg px-8 py-4">
          {running || run?.status === "running"
            ? <><Loader2 size={20} className="animate-spin" /> Running…</>
            : <><Play size={20} /> Run Today's Pipeline</>}
        </button>
        {!sheet?.sheet_id && <p className="mt-3 text-xs text-inkblack/50">Connect your Google Sheet first.</p>}
        {sheet?.sheet_id && connectedCount === 0 && <p className="mt-3 text-xs text-inkblack/50">Connect at least one social platform.</p>}
      </div>

      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <StepCard key={s.key} index={i + 1} step={s} run={run} />
        ))}
      </div>

      {run?.error_message && (
        <div className="card border-danger/30 bg-danger/5">
          <div className="flex items-start gap-2 text-danger">
            <AlertCircle size={18} /> <p className="text-sm">{run.error_message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-inkblack/50">{label}</p>
      <p className={`mt-1 font-display text-xl ${ok === false ? "text-danger" : "text-ledger"}`}>{value}</p>
    </div>
  );
}

function StepCard({ index, step, run }: { index: number; step: typeof STEPS[number]; run: ContentRun | null }) {
  const state = getStepState(step.key, run);
  return (
    <div className="card flex items-start gap-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${
        state === "done" ? "bg-success text-white"
        : state === "running" ? "bg-marigold text-white"
        : state === "error" ? "bg-danger text-white"
        : "bg-khadi text-inkblack/60"
      }`}>{state === "done" ? <Check size={16} /> : index}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-ledger">{step.title}</h4>
        <p className="text-sm text-inkblack/60">{step.desc}</p>
      </div>
      <div className="text-sm">
        {state === "running" && <Loader2 size={16} className="animate-spin text-marigold" />}
        {state === "waiting" && <Circle size={16} className="text-inkblack/20" />}
      </div>
    </div>
  );
}

// Maps a step key to its current state for the active run
function getStepState(key: string, run: ContentRun | null): "waiting" | "running" | "done" | "error" {
  if (!run) return "waiting";
  if (run.status === "error" && run.current_step === key) return "error";
  if (run.status === "completed") return "done";
  const order = STEPS.map((s) => s.key);
  const cur = run.current_step ? order.indexOf(run.current_step) : -1;
  const idx = order.indexOf(key);
  if (cur < 0) return "waiting";
  if (idx < cur) return "done";
  if (idx === cur) return run.status === "running" ? "running" : "done";
  return "waiting";
}
