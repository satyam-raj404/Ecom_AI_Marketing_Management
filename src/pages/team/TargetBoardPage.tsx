import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Users, Target, Pencil, Check, X, UserCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useAllProfiles, type TeamProfile, type GoalItem, type KpiItem, type UserGoalsRow } from "@/hooks/useProfile";
import { currentMonthYear } from "@/hooks/useTeamData";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const POSITIONS = [
  "Co-Founder",
  "Chief Technical Engineer",
  "Founding Engineer",
  "Growth / Marketing",
  "Intern / Contractor",
];

const ROLES = ["admin", "member", "limited"] as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  member: "Member",
  limited: "Limited",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-marigold/20 text-marigold",
  member: "bg-green-100 text-green-700",
  limited: "bg-ledger/10 text-ledger/50",
};

// ── Avatar ─────────────────────────────────────────────
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sz =
    size === "sm"
      ? "w-8 h-8 text-xs"
      : size === "lg"
      ? "w-14 h-14 text-xl"
      : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full bg-marigold flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials || "?"}
    </div>
  );
}

// ── Profile setup card (first login) ───────────────────
function ProfileSetupCard({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const { saveProfile } = useProfile();
  const [name, setName] = useState(user?.email?.split("@")[0] ?? "");
  const [position, setPosition] = useState(POSITIONS[0]);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    const err = await saveProfile({ display_name: name.trim(), position });
    if (err) toast.error(err.message);
    else { toast.success("Profile created!"); onSaved(); }
    setBusy(false);
  };

  return (
    <div className="card border-2 border-marigold/30 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <UserCircle size={24} className="text-marigold" />
        <div>
          <h2 className="text-lg font-semibold text-ledger">Complete Your Profile</h2>
          <p className="text-sm text-ledger/60">Set up to appear on the Target Board.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="label">Display Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="label">Position</label>
          <select className="input" value={position} onChange={(e) => setPosition(e.target.value)}>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button className="btn-primary w-full" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

// ── Member card on board ────────────────────────────────
function MemberCard({
  profile,
  goals,
  isOwn,
}: {
  profile: TeamProfile;
  goals?: UserGoalsRow;
  isOwn: boolean;
}) {
  const monthlyGoals: GoalItem[] = (goals?.monthly_goals as GoalItem[]) ?? [];
  const weeklyGoals: GoalItem[] = (goals?.weekly_goals as GoalItem[]) ?? [];
  const kpis: KpiItem[] = (goals?.custom_kpis as KpiItem[]) ?? [];
  const hasGoals = monthlyGoals.length > 0 || weeklyGoals.length > 0 || kpis.length > 0;

  return (
    <div className={`card space-y-4 ${isOwn ? "ring-2 ring-marigold/40" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={profile.display_name} />
          <div className="min-w-0">
            <div className="font-semibold text-ledger truncate">{profile.display_name}</div>
            <div className="text-xs text-ledger/60 truncate">{profile.position}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwn && (
            <span className="text-[10px] text-marigold font-semibold uppercase tracking-wider">
              You
            </span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              ROLE_COLORS[profile.role] ?? "bg-ledger/10 text-ledger/50"
            }`}
          >
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        </div>
      </div>

      {!hasGoals ? (
        <p className="text-sm text-ledger/40 italic">
          No goals set yet{isOwn ? " — tap below to add" : ""}.
        </p>
      ) : (
        <>
          {monthlyGoals.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-ledger/40 mb-2">
                Monthly Goals
              </h4>
              <ul className="space-y-1">
                {monthlyGoals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ledger/80">
                    <span className="mt-0.5 text-marigold flex-shrink-0">•</span>
                    <span>
                      {g.label}
                      {g.target && (
                        <span className="text-ledger/40"> — {g.target}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weeklyGoals.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-ledger/40 mb-2">
                This Week
              </h4>
              <ul className="space-y-1">
                {weeklyGoals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ledger/80">
                    <span className="mt-0.5 text-ledger/40 flex-shrink-0">›</span>
                    <span>
                      {g.label}
                      {g.target && (
                        <span className="text-ledger/40"> — {g.target}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {kpis.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-ledger/40 mb-2">KPIs</h4>
              <div className="space-y-2">
                {kpis.map((k, i) => {
                  const pct =
                    k.target > 0
                      ? Math.min(100, Math.round((k.value / k.target) * 100))
                      : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-ledger/70 mb-1">
                        <span className="truncate pr-2">{k.label}</span>
                        <span className="font-medium text-ledger flex-shrink-0">
                          {k.value}{" "}
                          <span className="text-ledger/40">/ {k.target}</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-ledger/10 overflow-hidden">
                        <div
                          className="h-full bg-marigold transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {isOwn && (
        <Link to="/weekly-update" className="btn-secondary text-xs w-full justify-center">
          <Pencil size={12} /> Update My Goals
        </Link>
      )}
    </div>
  );
}

// ── Board tab ───────────────────────────────────────────
function BoardTab({
  profiles,
  allGoals,
  currentUserId,
}: {
  profiles: TeamProfile[];
  allGoals: UserGoalsRow[];
  currentUserId: string;
}) {
  if (profiles.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-ledger/60">No team members have profiles yet.</p>
        <p className="text-sm text-ledger/40 mt-1">
          Complete your profile above to appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile) => {
        const goals = allGoals.find((g) => g.user_id === profile.user_id);
        return (
          <MemberCard
            key={profile.user_id}
            profile={profile}
            goals={goals}
            isOwn={profile.user_id === currentUserId}
          />
        );
      })}
    </div>
  );
}

// ── Editable member row ─────────────────────────────────
function MemberRow({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: {
  profile: TeamProfile;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: Pick<TeamProfile, "display_name" | "position" | "role">) => Promise<void>;
}) {
  const [name, setName] = useState(profile.display_name);
  const [position, setPosition] = useState(profile.position);
  const [role, setRole] = useState(profile.role);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await onSave({ display_name: name, position, role });
    setBusy(false);
  };

  return (
    <tr className="border-t border-faded">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <Avatar name={profile.display_name} size="sm" />
          {isEditing ? (
            <input
              className="input py-1 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <span className="text-sm font-medium text-ledger">{profile.display_name}</span>
          )}
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-ledger/50 hidden md:table-cell">
        {profile.email ?? "—"}
      </td>
      <td className="py-3 pr-4">
        {isEditing ? (
          <select
            className="input py-1 text-sm"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        ) : (
          <span className="text-sm text-ledger/80">{profile.position}</span>
        )}
      </td>
      <td className="py-3 pr-4">
        {isEditing ? (
          <select
            className="input py-1 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              ROLE_COLORS[profile.role] ?? "bg-ledger/10 text-ledger/50"
            }`}
          >
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        )}
      </td>
      <td className="py-3">
        {isEditing ? (
          <div className="flex gap-1">
            <button
              onClick={save}
              disabled={busy}
              className="p-1.5 rounded hover:bg-green-50 text-green-600"
            >
              <Check size={14} />
            </button>
            <button
              onClick={onCancel}
              className="p-1.5 rounded hover:bg-red-50 text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-ledger/40 hover:text-ledger hover:bg-ledger/5"
          >
            <Pencil size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Members tab (admin) ─────────────────────────────────
function MembersTab({
  profiles,
  reload,
}: {
  profiles: TeamProfile[];
  reload: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = async (
    userId: string,
    updates: Pick<TeamProfile, "display_name" | "position" | "role">
  ) => {
    const { error } = await supabase
      .from("team_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Member updated");
    setEditingId(null);
    reload();
  };

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-ledger">Team Members</h2>
        <div className="flex items-center gap-1.5 text-sm text-ledger/40">
          <Shield size={14} />
          Admin view
        </div>
      </div>

      {profiles.length === 0 ? (
        <p className="text-center text-sm text-ledger/40 py-8">No team members yet.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              {["Name", "Email", "Position", "Role", ""].map((h) => (
                <th
                  key={h}
                  className="pb-3 pr-4 text-xs uppercase tracking-wider text-ledger/40 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <MemberRow
                key={p.user_id}
                profile={p}
                isEditing={editingId === p.user_id}
                onEdit={() => setEditingId(p.user_id)}
                onCancel={() => setEditingId(null)}
                onSave={(updates) => save(p.user_id, updates)}
              />
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-4 text-xs text-ledger/40 border-t border-faded pt-4">
        To add new members: create their account in Supabase Auth dashboard → they log in and complete profile → appear here.
      </p>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────
export default function TargetBoardPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, reload: reloadProfile, isAdmin } = useProfile();
  const { profiles, reload: reloadProfiles } = useAllProfiles();
  const [tab, setTab] = useState<"board" | "members">("board");
  const [allGoals, setAllGoals] = useState<UserGoalsRow[]>([]);

  const now = new Date();
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const thisMonth = currentMonthYear();

  const loadGoals = useCallback(async () => {
    const { data } = await supabase
      .from("user_goals")
      .select("user_id, week_of, month_year, monthly_goals, weekly_goals, custom_kpis, id, filled_at")
      .eq("month_year", thisMonth)
      .order("week_of", { ascending: false });

    // Keep only latest row per user
    const seen = new Set<string>();
    const latest: UserGoalsRow[] = [];
    for (const row of (data ?? []) as UserGoalsRow[]) {
      if (!seen.has(row.user_id)) {
        seen.add(row.user_id);
        latest.push(row);
      }
    }
    setAllGoals(latest);
  }, [thisMonth]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleProfileSaved = () => {
    reloadProfile();
    reloadProfiles();
  };

  if (profileLoading) {
    return <div className="text-ledger/60">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Target Board — {monthLabel}</h1>
          <p className="text-sm text-ledger/60">Team goals, weekly focus, and personal KPIs.</p>
        </div>
        <Link to="/weekly-update" className="btn-primary text-sm self-start">
          <Target size={16} /> Update My Goals
        </Link>
      </header>

      {/* Profile setup if missing */}
      {!profile && <ProfileSetupCard onSaved={handleProfileSaved} />}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-faded">
        {(
          [
            { key: "board", label: "Target Board", Icon: Target },
            ...(isAdmin ? [{ key: "members", label: "Team Members", Icon: Users }] : []),
          ] as { key: "board" | "members"; label: string; Icon: typeof Target }[]
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              tab === key
                ? "border-marigold text-marigold"
                : "border-transparent text-ledger/50 hover:text-ledger"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "board" && (
        <BoardTab
          profiles={profiles}
          allGoals={allGoals}
          currentUserId={user?.id ?? ""}
        />
      )}

      {tab === "members" && isAdmin && (
        <MembersTab profiles={profiles} reload={reloadProfiles} />
      )}
    </div>
  );
}
