import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Opp = {
  id: string;
  subreddit: string;
  post_title: string | null;
  post_url: string | null;
  author: string | null;
  keywords: string[] | null;
  suggested_reply: string | null;
  status: string | null;
  found_at: string | null;
};

const STATUS = ["new", "replied", "skipped"];

// Reddit Outreach — manual opportunity log + per-row status. Auto-scan
// cron job is a follow-up; for now the team can log threads they find.
export default function RedditPage() {
  const [items, setItems] = useState<Opp[]>([]);
  const [form, setForm] = useState({ subreddit: "", post_title: "", post_url: "", keywords: "" });

  const load = async () => {
    const { data, error } = await supabase
      .from("reddit_opportunities")
      .select("*")
      .order("found_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.subreddit.trim()) return toast.error("Subreddit required");
    const { error } = await supabase.from("reddit_opportunities").insert({
      subreddit: form.subreddit.replace(/^r\//, ""),
      post_title: form.post_title || null,
      post_url: form.post_url || null,
      keywords: form.keywords ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
    });
    if (error) return toast.error(error.message);
    setForm({ subreddit: "", post_title: "", post_url: "", keywords: "" });
    load();
    toast.success("Opportunity logged");
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("reddit_opportunities").update({ status }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const updateReply = async (id: string, suggested_reply: string) => {
    await supabase.from("reddit_opportunities").update({ suggested_reply }).eq("id", id);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("reddit_opportunities").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">Reddit Outreach</h1>
        <p className="text-sm text-ledger/60">Log threads worth replying to. Track status so we don't double-post.</p>
      </header>

      <div className="card space-y-3">
        <h3 className="text-sm font-semibold text-ledger">Log new opportunity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className="input" placeholder="Subreddit (r/IndianStartups)" value={form.subreddit} onChange={(e) => setForm({ ...form, subreddit: e.target.value })} />
          <input className="input" placeholder="Post URL" value={form.post_url} onChange={(e) => setForm({ ...form, post_url: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Post title" value={form.post_title} onChange={(e) => setForm({ ...form, post_title: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Keywords (comma separated)" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
        </div>
        <button className="btn-primary text-sm" onClick={add}><Plus size={14} /> Log</button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <div className="text-ledger/50 italic">No opportunities logged yet.</div>}
        {items.map((o) => (
          <div key={o.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-marigold font-medium">r/{o.subreddit}</div>
                <div className="text-ledger font-medium truncate">{o.post_title || "(no title)"}</div>
                {o.keywords && o.keywords.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {o.keywords.map((k) => <span key={k} className="rounded-full bg-khadi px-2 py-0.5 text-[10px] text-ledger">{k}</span>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  className="rounded border border-ledger/15 text-xs py-1 px-2"
                  value={o.status ?? "new"}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                >
                  {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {o.post_url && (
                  <a href={o.post_url} target="_blank" rel="noopener noreferrer" className="text-marigold text-xs inline-flex items-center gap-1">
                    open <ExternalLink size={11} />
                  </a>
                )}
                <button onClick={() => remove(o.id)} className="text-ledger/40 hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <textarea
              className="input mt-3 text-sm"
              rows={2}
              placeholder="Suggested reply draft…"
              defaultValue={o.suggested_reply ?? ""}
              onBlur={(e) => updateReply(o.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
