import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, FileSpreadsheet, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSheet } from "@/hooks/useSheet";

function extractSheetId(url: string): string | null {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

const REQUIRED_COLS = ["date", "linkedin_idea", "instagram_idea", "facebook_idea", "x_idea", "image_prompt", "posted"];

export default function SheetPage() {
  const { sheet, reload } = useSheet();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [urlError, setUrlError] = useState("");

  useEffect(() => { setUrl(sheet?.sheet_url ?? ""); }, [sheet?.sheet_url]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "oauth-complete" && e.data.platform === "google") {
        reload();
        if (e.data.success) toast.success("Google account connected");
        else toast.error(`Failed: ${e.data.error ?? "unknown"}`);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [reload]);

  const validateUrl = (val: string) => {
    if (!val) { setUrlError(""); return; }
    if (!extractSheetId(val)) setUrlError("Not a valid Google Sheets URL");
    else setUrlError("");
  };

  const saveSheet = async () => {
    const id = extractSheetId(url);
    if (!id) { toast.error("Not a valid Google Sheets URL"); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("sheet_connections").upsert(
      { user_id: u.user.id, sheet_url: url, sheet_id: id },
      { onConflict: "user_id" }
    );
    await reload();
    toast.success("Sheet saved");
    setBusy(false);
  };

  const connectGoogle = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-connect", { body: { platform: "google" } });
      if (error || !data?.authUrl) throw new Error(error?.message ?? "No auth URL");
      const w = 600, h = 720;
      window.open(data.authUrl, "connect_google",
        `width=${w},height=${h},left=${(window.outerWidth - w) / 2},top=${(window.outerHeight - h) / 2}`);
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };

  const hasSheet  = !!sheet?.sheet_id;
  const isFullyReady = hasSheet;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl text-ledger">Google Sheet</h1>
        <p className="text-sm text-ledger/60 mt-0.5">Connect the sheet that holds your daily content ideas.</p>
      </div>

      {/* Overall status */}
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        isFullyReady ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isFullyReady ? "bg-emerald-500" : "bg-amber-400"
        }`}>
          {isFullyReady ? <Check size={15} className="text-white" /> : <AlertCircle size={15} className="text-white" />}
        </div>
        <div>
          <p className={`text-sm font-semibold ${isFullyReady ? "text-emerald-700" : "text-amber-700"}`}>
            {isFullyReady ? "Sheet connected and ready" : "Sheet not connected yet"}
          </p>
          {hasSheet && sheet.sheet_url && (
            <p className="text-xs text-ledger/50 truncate max-w-sm">{sheet.sheet_url}</p>
          )}
        </div>
        {hasSheet && (
          <button onClick={reload} className="ml-auto p-1.5 rounded-lg text-ledger/30 hover:text-ledger transition">
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      {/* Step 1: Google OAuth */}
      <div className="rounded-2xl bg-white border border-ledger/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ledger/5 bg-khadi/20">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
              sheet?.id ? "bg-emerald-500 text-white" : "bg-ledger/15 text-ledger/60"
            }`}>1</div>
            <h3 className="font-semibold text-ledger">Authorise Google</h3>
            {sheet?.id && <Check size={14} className="text-emerald-500 ml-auto" />}
          </div>
          <p className="text-xs text-ledger/50 mt-1 ml-8">Grant permission to read and update your sheets</p>
        </div>
        <div className="px-5 py-4">
          {sheet?.id ? (
            <div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 font-medium flex items-center gap-2">
              <Check size={15} /> Google account connected
            </div>
          ) : (
            <button className="btn-primary text-sm flex items-center gap-2" onClick={connectGoogle} disabled={busy}>
              {busy && <Loader2 size={15} className="animate-spin" />}
              {!busy && <FileSpreadsheet size={15} />}
              Connect Google
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Sheet URL */}
      <div className="rounded-2xl bg-white border border-ledger/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ledger/5 bg-khadi/20">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
              hasSheet ? "bg-emerald-500 text-white" : "bg-ledger/15 text-ledger/60"
            }`}>2</div>
            <h3 className="font-semibold text-ledger">Sheet URL</h3>
            {hasSheet && <Check size={14} className="text-emerald-500 ml-auto" />}
          </div>
          <p className="text-xs text-ledger/50 mt-1 ml-8">Paste the URL of your ideas Google Sheet</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                className={`input w-full text-sm ${urlError ? "border-red-300 focus:ring-red-200" : ""}`}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={url}
                onChange={e => { setUrl(e.target.value); validateUrl(e.target.value); }}
              />
              {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
            </div>
            <button className="btn-primary text-sm px-4 flex-shrink-0" onClick={saveSheet}
              disabled={busy || !url || !!urlError}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : "Save"}
            </button>
          </div>
          {hasSheet && sheet.sheet_url && (
            <a href={sheet.sheet_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-marigold hover:underline">
              <ExternalLink size={13} /> Open sheet
            </a>
          )}
        </div>
      </div>

      {/* Required columns */}
      <div className="rounded-2xl border border-ledger/8 bg-cream/40 p-5">
        <h3 className="font-semibold text-ledger text-sm mb-2">Required sheet columns</h3>
        <p className="text-xs text-ledger/50 mb-3">Add a header row with exactly these column names:</p>
        <div className="flex flex-wrap gap-2">
          {REQUIRED_COLS.map(col => (
            <code key={col}
              className="px-2.5 py-1 rounded-lg bg-white border border-ledger/10 text-xs font-mono text-ledger/70 shadow-sm">
              {col}
            </code>
          ))}
        </div>
        <p className="text-xs text-ledger/40 mt-3">Each row = one day's content. Set <code className="font-mono">date</code> to YYYY-MM-DD format.</p>
      </div>
    </div>
  );
}
