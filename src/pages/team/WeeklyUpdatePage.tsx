import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Unlock, Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLatestWeekly, useMonthlyTargets, currentMonday, timeAgo } from "@/hooks/useTeamData";

const TEAM_NAMES = ["Amitav", "Dipali", "Satyam"];
const CONTENT_TYPES = ["Pain Stories", "Founder Story", "Educational", "Memes", "Customer Wins"];
const PLATFORMS = ["LinkedIn", "Instagram", "Facebook", "X"];
const DRAFT_KEY = "weekly_update_draft_v1";

type Form = Record<string, any>;

// The single big input form
export default function WeeklyUpdatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { row: latest } = useLatestWeekly();
  const { row: targets, reload: reloadTargets, month } = useMonthlyTargets();
  const [form, setForm] = useState<Form>(() => {
    const cached = localStorage.getItem(DRAFT_KEY);
    return cached ? JSON.parse(cached) : defaults();
  });
  const [quotes, setQuotes] = useState<Array<{ quote: string; name: string }>>([
    { quote: "", name: "" }, { quote: "", name: "" }, { quote: "", name: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [targetsLocked, setTargetsLocked] = useState(true);
  const [filledBy, setFilledBy] = useState<string>(user?.email?.split("@")[0] ?? TEAM_NAMES[0]);

  // Auto-save draft
  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(form)), 500);
    return () => clearTimeout(id);
  }, [form]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Upload reel thumbnail to storage
  const onUpload = async (file: File) => {
    const path = `weekly/${currentMonday()}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    set("top_reel_thumbnail", data.publicUrl);
    toast.success("Thumbnail uploaded");
  };

  // Save form + customer quotes + (maybe) targets
  const submit = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        week_of: currentMonday(),
        filled_by: filledBy,
        filled_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("weekly_kpis").upsert(payload, { onConflict: "week_of" });
      if (error) throw error;

      // Insert non-empty quotes
      const validQuotes = quotes.filter((q) => q.quote.trim() && q.name.trim());
      if (validQuotes.length) {
        await supabase.from("customer_feedback").insert(
          validQuotes.map((q) => ({ quote: q.quote, customer_name: q.name, source: "demo_call", added_by: filledBy }))
        );
      }

      // Save targets if unlocked
      if (!targetsLocked && targets) {
        await supabase.from("monthly_targets").update({
          demos_target: targets.demos_target,
          leads_target: targets.leads_target,
          emails_target: targets.emails_target,
          rd_tasks_target: targets.rd_tasks_target,
        }).eq("month_year", month);
        await reloadTargets();
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success(`✓ Dashboard updated! Last by ${filledBy}`);
      navigate("/team");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">Weekly KPI Update</h1>
        <p className="text-sm text-ledger/60">Takes 5 minutes. Updates the team dashboard.</p>
        {latest && (
          <p className="text-xs text-ledger/50 mt-1">
            Last filled by {latest.filled_by} · {timeAgo(latest.filled_at)}
          </p>
        )}
      </header>

      <div className="card">
        <label className="label">Who's filling this in?</label>
        <select className="input" value={filledBy} onChange={(e) => setFilledBy(e.target.value)}>
          {TEAM_NAMES.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>

      {/* SECTION 1 — CONTENT */}
      <Section title="1. Content Performance">
        <Field label="Most viewed reel platform">
          <select className="input" value={form.top_reel_platform} onChange={(e) => set("top_reel_platform", e.target.value)}>
            <option value="">—</option>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Reel link / URL">
          <input className="input" value={form.top_reel_url} onChange={(e) => set("top_reel_url", e.target.value)} />
        </Field>
        <Field label="Views">
          <input type="number" className="input" value={form.top_reel_views} onChange={(e) => set("top_reel_views", +e.target.value || 0)} />
        </Field>
        <Field label="Thumbnail">
          <label className="btn-secondary cursor-pointer">
            <Upload size={14} /> {form.top_reel_thumbnail ? "Replace" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </label>
          {form.top_reel_thumbnail && <img src={form.top_reel_thumbnail} className="mt-2 h-24 rounded-lg object-cover" />}
        </Field>
        <Field label="Best performing content type">
          <select className="input" value={form.best_content_type} onChange={(e) => set("best_content_type", e.target.value)}>
            <option value="">—</option>
            {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Why?">
          <input className="input" value={form.best_content_reason} onChange={(e) => set("best_content_reason", e.target.value)} />
        </Field>
        <Field label="Top post platform">
          <select className="input" value={form.top_post_platform} onChange={(e) => set("top_post_platform", e.target.value)}>
            <option value="">—</option>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Top post link">
          <input className="input" value={form.top_post_url} onChange={(e) => set("top_post_url", e.target.value)} />
        </Field>
        <Field label="Engagement (likes + comments)">
          <input type="number" className="input" value={form.top_post_engagement} onChange={(e) => set("top_post_engagement", +e.target.value || 0)} />
        </Field>
      </Section>

      {/* SECTION 2 — FOLLOWERS */}
      <Section title="2. Follower Counts">
        {(["linkedin", "instagram", "facebook", "x"] as const).map((p) => (
          <Field key={p} label={p[0].toUpperCase() + p.slice(1)}>
            <input type="number" className="input" value={form[`${p}_followers`]} onChange={(e) => set(`${p}_followers`, +e.target.value || 0)} />
          </Field>
        ))}
      </Section>

      {/* SECTION 3 — LEADS */}
      <Section title="3. Lead Metrics">
        <Field label="New leads this week">
          <input type="number" className="input" value={form.new_leads} onChange={(e) => set("new_leads", +e.target.value || 0)} />
        </Field>
        <Field label="Demos completed">
          <input type="number" className="input" value={form.demos_completed} onChange={(e) => set("demos_completed", +e.target.value || 0)} />
        </Field>
        <Field label="Pilots started">
          <input type="number" className="input" value={form.pilots_started} onChange={(e) => set("pilots_started", +e.target.value || 0)} />
        </Field>
        <div>
          <label className="label">Customer quotes (1-3)</label>
          {quotes.map((q, i) => (
            <div key={i} className="mb-3 space-y-2">
              <textarea className="input" rows={2} placeholder={`Quote ${i + 1}`}
                value={q.quote} onChange={(e) => setQuotes((qs) => qs.map((x, j) => j === i ? { ...x, quote: e.target.value } : x))} />
              <input className="input" placeholder="Customer name"
                value={q.name} onChange={(e) => setQuotes((qs) => qs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 4 — R&D */}
      <Section title="4. R&D Progress">
        <Field label="Tasks completed">
          <input type="number" className="input" value={form.rd_tasks_completed} onChange={(e) => set("rd_tasks_completed", +e.target.value || 0)} />
        </Field>
        <Field label="Tasks pending">
          <input type="number" className="input" value={form.rd_tasks_pending} onChange={(e) => set("rd_tasks_pending", +e.target.value || 0)} />
        </Field>
        <div>
          <label className="label">Top 3 in-progress items</label>
          {[0, 1, 2].map((i) => (
            <input key={i} className="input mb-2" placeholder={`Item ${i + 1}`}
              value={form.rd_top_items?.[i] ?? ""}
              onChange={(e) => {
                const arr = [...(form.rd_top_items ?? ["", "", ""])];
                arr[i] = e.target.value;
                set("rd_top_items", arr);
              }} />
          ))}
        </div>
      </Section>

      {/* SECTION 5 — TEAM FOCUS */}
      <Section title="5. Team Focus This Week">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["amitav", "dipali", "satyam"] as const).map((name) => (
            <div key={name}>
              <div className="mb-2 font-semibold text-ledger capitalize">{name}</div>
              {[0, 1, 2].map((i) => (
                <input key={i} className="input mb-2" placeholder={`Task ${i + 1}`}
                  value={form[`${name}_tasks`]?.[i] ?? ""}
                  onChange={(e) => {
                    const arr = [...(form[`${name}_tasks`] ?? ["", "", ""])];
                    arr[i] = e.target.value;
                    set(`${name}_tasks`, arr);
                  }} />
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 6 — TARGETS */}
      <Section title="6. Monthly Targets" right={
        <button onClick={() => setTargetsLocked((l) => !l)} className="flex items-center gap-1 text-sm text-ledger/60 hover:text-marigold">
          {targetsLocked ? <Lock size={14} /> : <Unlock size={14} />}
          {targetsLocked ? "Locked" : "Editing"}
        </button>
      }>
        {targets && (
          <>
            <TargetField label="Demos" value={targets.demos_target} disabled={targetsLocked}
              onChange={(v) => Object.assign(targets, { demos_target: v })} />
            <TargetField label="Lead Gen" value={targets.leads_target} disabled={targetsLocked}
              onChange={(v) => Object.assign(targets, { leads_target: v })} />
            <TargetField label="Emails Sent" value={targets.emails_target} disabled={targetsLocked}
              onChange={(v) => Object.assign(targets, { emails_target: v })} />
            <TargetField label="R&D Tasks" value={targets.rd_tasks_target} disabled={targetsLocked}
              onChange={(v) => Object.assign(targets, { rd_tasks_target: v })} />
          </>
        )}
      </Section>

      <button onClick={submit} disabled={busy} className="btn-primary w-full text-base py-3">
        <Save size={16} /> {busy ? "Saving…" : "Save & Update Dashboard"}
      </button>
      <p className="text-center text-xs text-ledger/50">Draft auto-saves as you type</p>
    </div>
  );
}

// Default empty form
function defaults(): Form {
  return {
    top_reel_url: "", top_reel_platform: "", top_reel_views: 0, top_reel_thumbnail: "",
    best_content_type: "", best_content_reason: "",
    top_post_url: "", top_post_platform: "", top_post_engagement: 0,
    linkedin_followers: 0, instagram_followers: 0, facebook_followers: 0, x_followers: 0,
    new_leads: 0, demos_completed: 0, pilots_started: 0,
    rd_tasks_completed: 0, rd_tasks_pending: 0, rd_top_items: ["", "", ""],
    amitav_tasks: ["", "", ""], dipali_tasks: ["", "", ""], satyam_tasks: ["", "", ""],
  };
}

// Section wrapper
function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-ledger">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

// Labeled field row
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

// Editable target with lock state
function TargetField({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (v: number) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <Field label={label}>
      <input type="number" className="input" disabled={disabled} value={local}
        onChange={(e) => { const v = +e.target.value || 0; setLocal(v); onChange(v); }} />
    </Field>
  );
}
