import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Save, Plus, Trash2, Upload, Lock, Unlock, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, type GoalItem, type KpiItem } from "@/hooks/useProfile";
import { useMonthlyTargets, currentMonday, currentMonthYear } from "@/hooks/useTeamData";

const POSITIONS = [
  "Co-Founder",
  "Chief Technical Engineer",
  "Founding Engineer",
  "Growth / Marketing",
  "Intern / Contractor",
];

const CONTENT_TYPES = ["Pain Stories", "Founder Story", "Educational", "Memes", "Customer Wins"];
const PLATFORMS = ["LinkedIn", "Instagram", "Facebook", "X"];
const COMPANY_DRAFT_KEY = "weekly_update_company_draft_v2";

// ── Goal list editor ────────────────────────────────────
function GoalList({
  items,
  onChange,
  placeholder = "Goal…",
  targetPlaceholder = "Target",
}: {
  items: GoalItem[];
  onChange: (items: GoalItem[]) => void;
  placeholder?: string;
  targetPlaceholder?: string;
}) {
  const add = () => onChange([...items, { label: "", target: "" }]);
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const update = (i: number, field: keyof GoalItem, val: string) =>
    onChange(items.map((item, j) => (j === i ? { ...item, [field]: val } : item)));

  return (
    <div className="space-y-2">
      {items.map((g, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input flex-[3]"
            value={g.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder={placeholder}
          />
          <input
            className="input flex-1 min-w-[80px]"
            value={g.target}
            onChange={(e) => update(i, "target", e.target.value)}
            placeholder={targetPlaceholder}
          />
          <button
            onClick={() => remove(i)}
            className="p-2 text-ledger/30 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1 text-sm text-marigold hover:text-marigold/70 transition"
      >
        <Plus size={14} /> Add
      </button>
    </div>
  );
}

// ── KPI metric editor ───────────────────────────────────
function KpiList({
  items,
  onChange,
}: {
  items: KpiItem[];
  onChange: (items: KpiItem[]) => void;
}) {
  const add = () => onChange([...items, { label: "", value: 0, target: 0 }]);
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const update = (i: number, field: keyof KpiItem, val: string | number) =>
    onChange(items.map((item, j) => (j === i ? { ...item, [field]: val } : item)));

  return (
    <div className="space-y-2">
      {items.map((k, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="input flex-[3]"
            value={k.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Metric (e.g. LinkedIn Followers)"
          />
          <input
            type="number"
            className="input flex-1 min-w-[70px]"
            value={k.value || ""}
            onChange={(e) => update(i, "value", +e.target.value || 0)}
            placeholder="Now"
          />
          <span className="text-ledger/40 text-sm flex-shrink-0">/</span>
          <input
            type="number"
            className="input flex-1 min-w-[70px]"
            value={k.target || ""}
            onChange={(e) => update(i, "target", +e.target.value || 0)}
            placeholder="Target"
          />
          <button
            onClick={() => remove(i)}
            className="p-2 text-ledger/30 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1 text-sm text-marigold hover:text-marigold/70 transition"
      >
        <Plus size={14} /> Add KPI
      </button>
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────
function Section({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg text-ledger">{title}</h2>
          {subtitle && <p className="text-sm text-ledger/50 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function TargetField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <Field label={label}>
      <input
        type="number"
        className="input"
        disabled={disabled}
        value={local}
        onChange={(e) => {
          const v = +e.target.value || 0;
          setLocal(v);
          onChange(v);
        }}
      />
    </Field>
  );
}

type CompanyForm = Record<string, any>;

function companyDefaults(): CompanyForm {
  return {
    top_reel_url: "", top_reel_platform: "", top_reel_views: 0, top_reel_thumbnail: "",
    best_content_type: "", best_content_reason: "",
    top_post_url: "", top_post_platform: "", top_post_engagement: 0,
    linkedin_followers: 0, instagram_followers: 0, facebook_followers: 0, x_followers: 0,
    new_leads: 0, demos_completed: 0, pilots_started: 0,
    rd_tasks_completed: 0, rd_tasks_pending: 0, rd_top_items: ["", "", ""],
  };
}

// ── Main page ───────────────────────────────────────────
export default function WeeklyUpdatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, saveProfile, reload: reloadProfile } = useProfile();
  const { row: targets, reload: reloadTargets, month } = useMonthlyTargets();

  // Profile fields
  const [profileName, setProfileName] = useState("");
  const [profilePosition, setProfilePosition] = useState(POSITIONS[0]);
  const [profileBusy, setProfileBusy] = useState(false);

  // Personal goals
  const [monthlyGoals, setMonthlyGoals] = useState<GoalItem[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<GoalItem[]>([]);
  const [customKpis, setCustomKpis] = useState<KpiItem[]>([]);

  // Company KPIs
  const [form, setForm] = useState<CompanyForm>(() => {
    const cached = localStorage.getItem(COMPANY_DRAFT_KEY);
    return cached ? JSON.parse(cached) : companyDefaults();
  });
  const [quotes, setQuotes] = useState([
    { quote: "", name: "" },
    { quote: "", name: "" },
    { quote: "", name: "" },
  ]);
  const [targetsLocked, setTargetsLocked] = useState(true);
  const [busy, setBusy] = useState(false);

  // Sync profile form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileName(profile.display_name);
      setProfilePosition(profile.position);
    } else if (user) {
      setProfileName(user.email?.split("@")[0] ?? "");
    }
  }, [profile, user]);

  // Load personal goals
  useEffect(() => {
    if (!user) return;
    const monday = currentMonday();
    const monthYear = currentMonthYear();

    supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_of", monday)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setWeeklyGoals((data.weekly_goals as GoalItem[]) ?? []);
          setCustomKpis((data.custom_kpis as KpiItem[]) ?? []);
          setMonthlyGoals((data.monthly_goals as GoalItem[]) ?? []);
        } else {
          // Pre-fill monthly goals from latest row this month
          supabase
            .from("user_goals")
            .select("monthly_goals")
            .eq("user_id", user.id)
            .eq("month_year", monthYear)
            .order("week_of", { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data: prev }) => {
              if (prev?.monthly_goals) {
                setMonthlyGoals(prev.monthly_goals as GoalItem[]);
              }
            });
        }
      });
  }, [user?.id]);

  // Pre-fill company form from latest weekly_kpis
  useEffect(() => {
    supabase
      .from("weekly_kpis")
      .select("*")
      .order("week_of", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        // Only pre-fill if no draft saved
        if (!localStorage.getItem(COMPANY_DRAFT_KEY)) {
          setForm({
            top_reel_url: data.top_reel_url ?? "",
            top_reel_platform: data.top_reel_platform ?? "",
            top_reel_views: data.top_reel_views ?? 0,
            top_reel_thumbnail: data.top_reel_thumbnail ?? "",
            best_content_type: data.best_content_type ?? "",
            best_content_reason: data.best_content_reason ?? "",
            top_post_url: data.top_post_url ?? "",
            top_post_platform: data.top_post_platform ?? "",
            top_post_engagement: data.top_post_engagement ?? 0,
            linkedin_followers: data.linkedin_followers ?? 0,
            instagram_followers: data.instagram_followers ?? 0,
            facebook_followers: data.facebook_followers ?? 0,
            x_followers: data.x_followers ?? 0,
            new_leads: data.new_leads ?? 0,
            demos_completed: data.demos_completed ?? 0,
            pilots_started: data.pilots_started ?? 0,
            rd_tasks_completed: data.rd_tasks_completed ?? 0,
            rd_tasks_pending: data.rd_tasks_pending ?? 0,
            rd_top_items: data.rd_top_items ?? ["", "", ""],
          });
        }
      });
  }, []);

  // Auto-save company draft
  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(COMPANY_DRAFT_KEY, JSON.stringify(form)), 500);
    return () => clearTimeout(id);
  }, [form]);

  const setField = useCallback((k: string, v: any) => setForm((f) => ({ ...f, [k]: v })), []);

  const saveProfileInfo = async () => {
    if (!profileName.trim()) { toast.error("Name required"); return; }
    setProfileBusy(true);
    const err = await saveProfile({ display_name: profileName.trim(), position: profilePosition });
    if (err) toast.error(err.message);
    else { toast.success("Profile saved"); reloadProfile(); }
    setProfileBusy(false);
  };

  const onUpload = async (file: File) => {
    const path = `weekly/${currentMonday()}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setField("top_reel_thumbnail", data.publicUrl);
    toast.success("Thumbnail uploaded");
  };

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const monday = currentMonday();
      const monthYear = currentMonthYear();
      const userName = profile?.display_name ?? user.email?.split("@")[0] ?? "Team";

      // Save personal goals
      const { error: goalsErr } = await supabase.from("user_goals").upsert(
        {
          user_id: user.id,
          week_of: monday,
          month_year: monthYear,
          monthly_goals: monthlyGoals,
          weekly_goals: weeklyGoals,
          custom_kpis: customKpis,
          filled_at: new Date().toISOString(),
        },
        { onConflict: "user_id,week_of" }
      );
      if (goalsErr) throw goalsErr;

      // Save company KPIs
      const { error: kpiErr } = await supabase.from("weekly_kpis").upsert(
        {
          ...form,
          week_of: monday,
          filled_by: userName,
          filled_at: new Date().toISOString(),
        },
        { onConflict: "week_of" }
      );
      if (kpiErr) throw kpiErr;

      // Customer quotes
      const validQuotes = quotes.filter((q) => q.quote.trim() && q.name.trim());
      if (validQuotes.length) {
        await supabase.from("customer_feedback").insert(
          validQuotes.map((q) => ({
            quote: q.quote,
            customer_name: q.name,
            source: "demo_call",
            added_by: userName,
          }))
        );
      }

      // Targets
      if (!targetsLocked && targets) {
        await supabase
          .from("monthly_targets")
          .update({
            demos_target: targets.demos_target,
            leads_target: targets.leads_target,
            emails_target: targets.emails_target,
            rd_tasks_target: targets.rd_tasks_target,
          })
          .eq("month_year", month);
        await reloadTargets();
      }

      localStorage.removeItem(COMPANY_DRAFT_KEY);
      toast.success("Saved!");
      navigate("/team");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const monday = currentMonday();
  const monthYear = currentMonthYear();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">Weekly KPI Update</h1>
        <p className="text-sm text-ledger/60">
          Week of {monday} · {monthYear}
        </p>
      </header>

      {/* ── Profile Info ── */}
      <Section
        title="Profile Info"
        subtitle="Your name and role shown on the Target Board."
      >
        <div className="flex items-center gap-3 pb-2">
          <div className="w-10 h-10 rounded-full bg-marigold flex items-center justify-center text-white font-semibold flex-shrink-0">
            {(profileName || "?")[0].toUpperCase()}
          </div>
          <span className="text-sm text-ledger/50">{user?.email}</span>
        </div>
        <Field label="Display Name">
          <input
            className="input"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Your name"
          />
        </Field>
        <Field label="Position">
          <select
            className="input"
            value={profilePosition}
            onChange={(e) => setProfilePosition(e.target.value)}
          >
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <button
          onClick={saveProfileInfo}
          disabled={profileBusy}
          className="btn-secondary text-sm"
        >
          <UserCircle size={14} /> {profileBusy ? "Saving…" : "Save Profile"}
        </button>
      </Section>

      {/* ── Monthly Goals ── */}
      <Section
        title="Monthly Goals"
        subtitle={`What do you want to achieve in ${monthYear}? (Goal + target)`}
      >
        <GoalList
          items={monthlyGoals}
          onChange={setMonthlyGoals}
          placeholder="e.g. Publish 30 reels"
          targetPlaceholder="e.g. 30"
        />
      </Section>

      {/* ── Weekly Focus ── */}
      <Section
        title="This Week's Focus"
        subtitle="Top priorities for this week."
      >
        <GoalList
          items={weeklyGoals}
          onChange={setWeeklyGoals}
          placeholder="e.g. Record 3 reels"
          targetPlaceholder="e.g. 3"
        />
      </Section>

      {/* ── Custom KPIs ── */}
      <Section
        title="Your KPIs"
        subtitle="Metrics you track personally. Current value + target."
      >
        <KpiList items={customKpis} onChange={setCustomKpis} />
      </Section>

      {/* ── Company Content KPIs ── */}
      <Section title="Company Content KPIs">
        <Field label="Top reel platform">
          <select
            className="input"
            value={form.top_reel_platform}
            onChange={(e) => setField("top_reel_platform", e.target.value)}
          >
            <option value="">—</option>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Reel URL">
          <input
            className="input"
            value={form.top_reel_url}
            onChange={(e) => setField("top_reel_url", e.target.value)}
          />
        </Field>
        <Field label="Views">
          <input
            type="number"
            className="input"
            value={form.top_reel_views}
            onChange={(e) => setField("top_reel_views", +e.target.value || 0)}
          />
        </Field>
        <Field label="Thumbnail">
          <label className="btn-secondary cursor-pointer">
            <Upload size={14} /> {form.top_reel_thumbnail ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>
          {form.top_reel_thumbnail && (
            <img src={form.top_reel_thumbnail} className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </Field>
        <Field label="Best content type">
          <select
            className="input"
            value={form.best_content_type}
            onChange={(e) => setField("best_content_type", e.target.value)}
          >
            <option value="">—</option>
            {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Why?">
          <input
            className="input"
            value={form.best_content_reason}
            onChange={(e) => setField("best_content_reason", e.target.value)}
          />
        </Field>
        <Field label="Top post platform">
          <select
            className="input"
            value={form.top_post_platform}
            onChange={(e) => setField("top_post_platform", e.target.value)}
          >
            <option value="">—</option>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Top post URL">
          <input
            className="input"
            value={form.top_post_url}
            onChange={(e) => setField("top_post_url", e.target.value)}
          />
        </Field>
        <Field label="Engagement (likes + comments)">
          <input
            type="number"
            className="input"
            value={form.top_post_engagement}
            onChange={(e) => setField("top_post_engagement", +e.target.value || 0)}
          />
        </Field>
      </Section>

      {/* ── Follower Counts ── */}
      <Section title="Follower Counts">
        {(["linkedin", "instagram", "facebook", "x"] as const).map((p) => (
          <Field key={p} label={p[0].toUpperCase() + p.slice(1)}>
            <input
              type="number"
              className="input"
              value={form[`${p}_followers`]}
              onChange={(e) => setField(`${p}_followers`, +e.target.value || 0)}
            />
          </Field>
        ))}
      </Section>

      {/* ── Lead Metrics ── */}
      <Section title="Lead Metrics">
        <Field label="New leads this week">
          <input
            type="number"
            className="input"
            value={form.new_leads}
            onChange={(e) => setField("new_leads", +e.target.value || 0)}
          />
        </Field>
        <Field label="Demos completed">
          <input
            type="number"
            className="input"
            value={form.demos_completed}
            onChange={(e) => setField("demos_completed", +e.target.value || 0)}
          />
        </Field>
        <Field label="Pilots started">
          <input
            type="number"
            className="input"
            value={form.pilots_started}
            onChange={(e) => setField("pilots_started", +e.target.value || 0)}
          />
        </Field>
        <div>
          <label className="label">Customer quotes (1-3)</label>
          {quotes.map((q, i) => (
            <div key={i} className="mb-3 space-y-2">
              <textarea
                className="input"
                rows={2}
                placeholder={`Quote ${i + 1}`}
                value={q.quote}
                onChange={(e) =>
                  setQuotes((qs) => qs.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))
                }
              />
              <input
                className="input"
                placeholder="Customer name"
                value={q.name}
                onChange={(e) =>
                  setQuotes((qs) => qs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── R&D ── */}
      <Section title="R&D Progress">
        <Field label="Tasks completed">
          <input
            type="number"
            className="input"
            value={form.rd_tasks_completed}
            onChange={(e) => setField("rd_tasks_completed", +e.target.value || 0)}
          />
        </Field>
        <Field label="Tasks pending">
          <input
            type="number"
            className="input"
            value={form.rd_tasks_pending}
            onChange={(e) => setField("rd_tasks_pending", +e.target.value || 0)}
          />
        </Field>
        <div>
          <label className="label">Top 3 in-progress items</label>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              className="input mb-2"
              placeholder={`Item ${i + 1}`}
              value={form.rd_top_items?.[i] ?? ""}
              onChange={(e) => {
                const arr = [...(form.rd_top_items ?? ["", "", ""])];
                arr[i] = e.target.value;
                setField("rd_top_items", arr);
              }}
            />
          ))}
        </div>
      </Section>

      {/* ── Monthly Targets (admin lock) ── */}
      <Section
        title="Monthly Targets"
        right={
          <button
            onClick={() => setTargetsLocked((l) => !l)}
            className="flex items-center gap-1 text-sm text-ledger/50 hover:text-marigold transition"
          >
            {targetsLocked ? <Lock size={14} /> : <Unlock size={14} />}
            {targetsLocked ? "Locked" : "Editing"}
          </button>
        }
      >
        {targets && (
          <>
            <TargetField label="Demos" value={targets.demos_target} disabled={targetsLocked} onChange={(v) => Object.assign(targets, { demos_target: v })} />
            <TargetField label="Lead Gen" value={targets.leads_target} disabled={targetsLocked} onChange={(v) => Object.assign(targets, { leads_target: v })} />
            <TargetField label="Emails Sent" value={targets.emails_target} disabled={targetsLocked} onChange={(v) => Object.assign(targets, { emails_target: v })} />
            <TargetField label="R&D Tasks" value={targets.rd_tasks_target} disabled={targetsLocked} onChange={(v) => Object.assign(targets, { rd_tasks_target: v })} />
          </>
        )}
      </Section>

      <button onClick={submit} disabled={busy} className="btn-primary w-full text-base py-3">
        <Save size={16} /> {busy ? "Saving…" : "Save & Update"}
      </button>
      <p className="text-center text-xs text-ledger/40 pb-4">
        Company KPI draft auto-saves as you type
      </p>
    </div>
  );
}
