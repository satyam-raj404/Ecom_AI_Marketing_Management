import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PencilLine, TrendingUp, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLatestWeekly, useMonthlyTargets, daysLeftInMonth, timeAgo } from "@/hooks/useTeamData";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Read-only Team HQ dashboard
export default function DashboardPage() {
  const { row, loading } = useLatestWeekly();
  const { row: targets } = useMonthlyTargets();
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("customer_feedback").select("*").order("added_at", { ascending: false }).limit(3)
      .then(({ data }) => setFeedback(data ?? []));
  }, []);

  const now = new Date();
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const demosTarget = targets?.demos_target ?? 50;
  const demos = row?.demos_completed ?? 0;
  const pct = Math.min(100, Math.round((demos / demosTarget) * 100));

  if (loading) return <div className="text-ledger/60">Loading…</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Team HQ — {monthLabel}</h1>
          <p className="text-sm text-ledger/60">Hi team — here's where we stand.</p>
          <p className="text-xs text-ledger/50 mt-1">
            Updated {timeAgo(row?.filled_at)} {row?.filled_by ? `by ${row.filled_by}` : ""}
          </p>
        </div>
        <Link to="/weekly-update" className="btn-primary text-sm">
          <PencilLine size={16} /> Update KPIs Now
        </Link>
      </header>

      {/* HERO METRIC */}
      <div className="rounded-2xl bg-marigold p-6 text-cream shadow-lg">
        <div className="flex items-center gap-2 text-cream/80 text-xs uppercase tracking-widest">
          <TrendingUp size={14} /> This Month's #1 — Demos Booked
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-5xl md:text-6xl">{demos}</span>
          <span className="text-2xl text-cream/70">/ {demosTarget}</span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-cream/20">
          <div className="h-full bg-cream transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-sm text-cream/80">{daysLeftInMonth()} days left</div>
      </div>

      {/* KPI GRID */}
      {!row ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Most Viewed Reel">
            {row.top_reel_thumbnail && (
              <img src={row.top_reel_thumbnail} alt="" className="mb-2 h-32 w-full rounded-lg object-cover" />
            )}
            <Badge>{row.top_reel_platform || "—"}</Badge>
            <div className="mt-2 text-2xl font-semibold text-ledger">{(row.top_reel_views ?? 0).toLocaleString()}</div>
            <div className="text-xs text-ledger/60">views</div>
            {row.top_reel_url && <ExtLink href={row.top_reel_url} />}
          </KpiCard>

          <KpiCard title="Best Content Type">
            <div className="text-lg font-semibold text-ledger">{row.best_content_type || "—"}</div>
            <p className="mt-1 text-sm text-ledger/60 italic">{row.best_content_reason || "Add a reason in the weekly update"}</p>
          </KpiCard>

          <KpiCard title="Follower Growth">
            {[
              ["LinkedIn", row.linkedin_followers, targets?.follower_targets?.linkedin ?? 500],
              ["Instagram", row.instagram_followers, targets?.follower_targets?.instagram ?? 1000],
              ["Facebook", row.facebook_followers, targets?.follower_targets?.facebook ?? 500],
              ["X", row.x_followers, targets?.follower_targets?.x ?? 300],
            ].map(([n, v, t]) => (
              <div key={n as string} className="flex items-center justify-between py-1 text-sm">
                <span className="text-ledger/70">{n}</span>
                <span className="font-medium text-ledger">{v} <span className="text-ledger/40 text-xs">/ {t}</span></span>
              </div>
            ))}
          </KpiCard>

          <KpiCard title="Top Post This Week">
            <Badge>{row.top_post_platform || "—"}</Badge>
            <div className="mt-2 text-2xl font-semibold text-ledger">{(row.top_post_engagement ?? 0).toLocaleString()}</div>
            <div className="text-xs text-ledger/60">engagements</div>
            {row.top_post_url && <ExtLink href={row.top_post_url} />}
          </KpiCard>

          <KpiCard title="Lead Generation">
            <div className="text-2xl font-semibold text-ledger">
              {row.new_leads} <span className="text-base text-ledger/40">/ {targets?.leads_target ?? 150}</span>
            </div>
            <div className="text-xs text-ledger/60">leads this week</div>
          </KpiCard>

          <KpiCard title="Demos & Pilots">
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-semibold text-ledger">{row.demos_completed}</div>
                <div className="text-xs text-ledger/60">demos</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-ledger">{row.pilots_started}</div>
                <div className="text-xs text-ledger/60">pilots</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-marigold font-medium">
              {row.demos_completed > 0 ? `${Math.round((row.pilots_started / row.demos_completed) * 100)}% convert` : "—"}
            </div>
          </KpiCard>

          <KpiCard title="R&D Sprint">
            <div className="text-2xl font-semibold text-ledger">
              {row.rd_tasks_completed} <span className="text-base text-ledger/40">/ {(row.rd_tasks_completed ?? 0) + (row.rd_tasks_pending ?? 0)}</span>
            </div>
            <div className="text-xs text-ledger/60">tasks done</div>
            <ul className="mt-2 space-y-0.5 text-sm text-ledger/70">
              {(row.rd_top_items ?? []).slice(0, 3).map((t: string, i: number) => <li key={i}>• {t}</li>)}
            </ul>
          </KpiCard>

          <KpiCard title="Latest Customer Quotes">
            {feedback.length === 0 ? (
              <p className="text-sm text-ledger/50 italic">No quotes yet</p>
            ) : (
              <ul className="space-y-2">
                {feedback.map((q) => (
                  <li key={q.id} className="text-sm">
                    <p className="text-ledger/80 italic">"{q.quote}"</p>
                    <p className="mt-0.5 text-xs text-ledger/50">— {q.customer_name}</p>
                  </li>
                ))}
              </ul>
            )}
          </KpiCard>
        </div>
      )}

      {/* TEAM ACTIVITY */}
      <div className="card">
        <h2 className="mb-4 text-lg text-ledger">This Week's Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TeamCol name="Amitav" emoji="🛠" role="Tech" tasks={row?.amitav_tasks} />
          <TeamCol name="Dipali" emoji="🎯" role="Ops" tasks={row?.dipali_tasks} />
          <TeamCol name="Satyam" emoji="📣" role="Marketing" tasks={row?.satyam_tasks} />
        </div>
      </div>
    </div>
  );
}

// Reusable KPI card
function KpiCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="mb-2 text-xs uppercase tracking-wider text-ledger/50">{title}</h3>
      {children}
    </div>
  );
}

// Small platform badge
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-khadi px-2 py-0.5 text-[10px] uppercase tracking-wider text-ledger">{children}</span>;
}

// External link
function ExtLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-marigold hover:underline">
      Open <ExternalLink size={11} />
    </a>
  );
}

// Per-person task column
function TeamCol({ name, emoji, role, tasks }: { name: string; emoji: string; role: string; tasks?: string[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="font-semibold text-ledger">{name}</div>
          <div className="text-xs text-ledger/60">{role}</div>
        </div>
      </div>
      <ul className="space-y-1 text-sm text-ledger/80">
        {(tasks ?? []).filter(Boolean).length === 0
          ? <li className="text-ledger/40 italic">No tasks set</li>
          : (tasks ?? []).filter(Boolean).map((t, i) => <li key={i}>• {t}</li>)
        }
      </ul>
    </div>
  );
}

// Friendly empty state when no week has been filled yet
function EmptyState() {
  return (
    <div className="card text-center py-12">
      <p className="text-lg text-ledger">No KPIs filled yet this week.</p>
      <p className="mt-2 text-sm text-ledger/60">Drop in your first weekly update — takes 5 minutes 💪</p>
      <Link to="/weekly-update" className="btn-primary mt-4 inline-flex">
        <PencilLine size={16} /> Fill Weekly Update
      </Link>
    </div>
  );
}
