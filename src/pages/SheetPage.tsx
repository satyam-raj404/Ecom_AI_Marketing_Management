import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSheet } from "@/hooks/useSheet";

// Extracts the sheet ID segment from a Google Sheets URL
function extractSheetId(url: string): string | null {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

export default function SheetPage() {
  const { sheet, reload } = useSheet();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setUrl(sheet?.sheet_url ?? ""); }, [sheet?.sheet_url]);

  // Listen for OAuth popup completion
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

  // Saves the sheet URL/ID without re-running OAuth
  const saveSheet = async () => {
    const id = extractSheetId(url);
    if (!id) { toast.error("That doesn't look like a valid Google Sheets URL"); return; }
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

  // Starts Google OAuth for Sheets API access
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

  const hasGoogle = !!sheet?.id;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl text-ledger">Google Sheet</h2>
        <p className="mt-1 text-inkblack/60">Connect a sheet that holds your daily content ideas.</p>
      </header>

      <section className="card">
        <h3 className="text-xl text-ledger mb-1">1. Authorise Google</h3>
        <p className="text-sm text-inkblack/60 mb-4">
          Grants this app permission to read and update your sheets.
        </p>
        {hasGoogle ? (
          <div className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success flex items-center gap-2">
            <Check size={16} /> Google connected
          </div>
        ) : (
          <button className="btn-primary" onClick={connectGoogle} disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} Connect Google
          </button>
        )}
      </section>

      <section className="card">
        <h3 className="text-xl text-ledger mb-1">2. Sheet URL</h3>
        <p className="text-sm text-inkblack/60 mb-4">
          Paste the URL of your ideas sheet.
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btn-primary" onClick={saveSheet} disabled={busy || !url}>Save</button>
        </div>
        {sheet?.sheet_url && (
          <a href={sheet.sheet_url} target="_blank" rel="noreferrer"
             className="mt-3 inline-flex items-center gap-1 text-sm text-marigold hover:underline">
            Open sheet <ExternalLink size={14} />
          </a>
        )}
      </section>

      <section className="card bg-khadi/40">
        <h3 className="text-xl text-ledger mb-2">Required columns</h3>
        <p className="text-sm text-inkblack/70 mb-3">Your sheet must have a header row with these columns:</p>
        <code className="block rounded bg-white p-3 text-xs font-mono text-inkblack/80 leading-6">
          date · linkedin_idea · instagram_idea · facebook_idea · x_idea · image_prompt · posted
        </code>
      </section>
    </div>
  );
}
