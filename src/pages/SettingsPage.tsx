import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import type { UserSettings } from "@/types";

// User-facing settings page for API keys, model choice, and automation schedule
export default function SettingsPage() {
  const { settings, save, loading } = useSettings();
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setDraft(settings); }, [settings]);

  const update = <K extends keyof UserSettings>(k: K, v: UserSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const persist = async () => {
    setBusy(true);
    try { await save(draft); toast.success("Settings saved"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  if (loading) return <p className="text-inkblack/60">Loading…</p>;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl text-ledger">Settings</h2>
        <p className="mt-1 text-inkblack/60">API keys and pipeline preferences.</p>
      </header>

      <section className="card space-y-4">
        <h3 className="text-xl text-ledger">AI Model Keys</h3>
        <div>
          <label className="label">Claude (Anthropic) API Key</label>
          <input type="password" className="input" placeholder="sk-ant-…"
                 value={draft.anthropic_key ?? ""} onChange={(e) => update("anthropic_key", e.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Image Provider</label>
            <select className="input" value={draft.image_model_provider}
                    onChange={(e) => update("image_model_provider", e.target.value)}>
              <option value="openai">DALL·E 3 (OpenAI)</option>
              <option value="ideogram">Ideogram</option>
              <option value="stability">Stability AI</option>
            </select>
          </div>
          <div>
            <label className="label">Image API Key</label>
            <input type="password" className="input"
                   value={draft.image_model_key ?? ""} onChange={(e) => update("image_model_key", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="text-xl text-ledger">AI Model</h3>
        <select className="input" value={draft.ai_model} onChange={(e) => update("ai_model", e.target.value)}>
          <option value="claude-opus-4-5">claude-opus-4-5 (Best)</option>
          <option value="claude-haiku-4-5">claude-haiku-4-5 (Fastest)</option>
          <option value="claude-sonnet-4-5">claude-sonnet-4-5 (Balanced)</option>
        </select>
      </section>

      <section className="card space-y-4">
        <h3 className="text-xl text-ledger">Schedule</h3>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={draft.auto_run_enabled}
                 onChange={(e) => update("auto_run_enabled", e.target.checked)} />
          <span>Run pipeline automatically each day</span>
        </label>
        <div>
          <label className="label">Time (IST)</label>
          <input type="time" className="input max-w-xs" value={draft.auto_run_time}
                 onChange={(e) => update("auto_run_time", e.target.value)} />
        </div>
      </section>

      <button className="btn-primary" onClick={persist} disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
