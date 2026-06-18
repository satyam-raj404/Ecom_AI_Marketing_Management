import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  UserPlus, Trash2, X, Copy, Check, RefreshCw,
  Shield, Eye, Users, KeyRound, Crown, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8002";

const ROLES = [
  { value: "admin",  label: "Admin",  icon: Crown,       color: "bg-amber-100 text-amber-800",   desc: "Full access — invite, delete, edit all" },
  { value: "member", label: "Member", icon: ShieldCheck,  color: "bg-blue-100 text-blue-800",     desc: "Can view and edit most sections" },
  { value: "viewer", label: "Viewer", icon: Eye,          color: "bg-slate-100 text-slate-600",   desc: "Read-only access" },
];

const ROLE_STYLE: Record<string, string> = {
  admin:  "bg-amber-100 text-amber-800",
  member: "bg-blue-100 text-blue-800",
  viewer: "bg-slate-100 text-slate-600",
};

const ROLE_ICON: Record<string, typeof Crown> = {
  admin: Crown, member: ShieldCheck, viewer: Eye,
};

type Member = {
  id: string; user_id: string; email: string;
  display_name: string; position: string; role: string; created_at: string;
};

type CreatedUser = { email: string; temp_password: string };

async function apiCall(path: string, method: string, token: string, body?: object) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Request failed");
  return data;
}

export default function AccessManagementPage() {
  const { isAdmin, loading: profileLoading } = useProfile();
  const { session, loading: authLoading } = useAuth();

  if (authLoading || profileLoading) return (
    <div className="flex items-center justify-center py-20 text-ledger/40 text-sm">Loading…</div>
  );
  if (!isAdmin) return <Navigate to="/team" replace />;

  return <AccessManagementContent token={session?.access_token ?? ""} />;
}

function AccessManagementContent({ token }: { token: string }) {
  const [members, setMembers]       = useState<Member[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [copied, setCopied]         = useState<"email" | "pass" | null>(null);
  const [form, setForm]             = useState({ email: "", display_name: "", position: "", role: "member" });
  const [busy, setBusy]             = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const data = await apiCall("/api/admin/users", "GET", token);
      setMembers(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const invite = async () => {
    if (!form.email.trim() || !form.display_name.trim()) {
      toast.error("Email and name required"); return;
    }
    setBusy(true);
    try {
      const data = await apiCall("/api/admin/invite", "POST", token, form);
      setCreatedUser({ email: data.email, temp_password: data.temp_password });
      setForm({ email: "", display_name: "", position: "", role: "member" });
      setShowForm(false);
      toast.success(`${data.email} invited`);
      loadMembers();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const updateRole = async (user_id: string, role: string) => {
    try {
      await apiCall(`/api/admin/users/${user_id}/role`, "PATCH", token, { role });
      setMembers(m => m.map(u => u.user_id === user_id ? { ...u, role } : u));
      toast.success("Role updated");
    } catch (e) { toast.error((e as Error).message); }
  };

  const resetPassword = async (user_id: string, email: string) => {
    try {
      const data = await apiCall(`/api/admin/users/${user_id}/reset-password`, "POST", token);
      setCreatedUser({ email, temp_password: data.temp_password });
      toast.success("New password generated");
    } catch (e) { toast.error((e as Error).message); }
  };

  const revokeAccess = async (user_id: string, name: string) => {
    if (!confirm(`Revoke access for ${name}? This deletes their account.`)) return;
    try {
      await apiCall(`/api/admin/users/${user_id}`, "DELETE", token);
      setMembers(m => m.filter(u => u.user_id !== user_id));
      toast.success(`${name}'s access revoked`);
    } catch (e) { toast.error((e as Error).message); }
  };

  const copyText = (text: string, key: "email" | "pass") => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Role counts
  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r.value] = members.filter(m => m.role === r.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Access Management</h1>
          <p className="text-sm text-ledger/60 mt-0.5">Invite team members, assign roles, revoke access.</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setCreatedUser(null); }}
          className="btn-primary text-sm flex items-center gap-2">
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-3">
        {ROLES.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.value} className="rounded-2xl bg-white border border-ledger/10 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <div className="text-xl font-semibold text-ledger">{roleCounts[r.value] ?? 0}</div>
                <div className="text-xs text-ledger/50">{r.label}{(roleCounts[r.value] ?? 0) !== 1 ? "s" : ""}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {showForm && (
        <div className="rounded-2xl border border-marigold/30 bg-white shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-ledger">Invite New Member</h2>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-ledger/40" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="name@company.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="e.g. Amitav Das"
                value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Position / Title</label>
              <input className="input" placeholder="e.g. Growth Intern"
                value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <strong>Note:</strong> A temporary password will be generated. Share it with the user via WhatsApp or email so they can log in immediately.
          </div>

          <div className="flex gap-2">
            <button onClick={invite} disabled={busy} className="btn-primary text-sm flex items-center gap-2">
              {busy ? <><RefreshCw size={14} className="animate-spin" /> Creating…</> : <><UserPlus size={14} /> Create & Get Password</>}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Generated credentials box */}
      {createdUser && (
        <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Account created!</p>
                <p className="text-xs text-emerald-700">Share these credentials with the user</p>
              </div>
            </div>
            <button onClick={() => setCreatedUser(null)} className="text-emerald-600 hover:text-emerald-800">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <CredentialRow
              label="Email / Login ID"
              value={createdUser.email}
              copied={copied === "email"}
              onCopy={() => copyText(createdUser.email, "email")}
            />
            <CredentialRow
              label="Temporary Password"
              value={createdUser.temp_password}
              copied={copied === "pass"}
              onCopy={() => copyText(createdUser.temp_password, "pass")}
              mono
            />
          </div>

          <div className="rounded-xl bg-white/70 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
            User can log in immediately at <strong>{window.location.origin}/auth</strong>. They should change their password from Settings after first login.
          </div>
        </div>
      )}

      {/* Members list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ledger flex items-center gap-2">
            <Users size={16} className="text-marigold" /> Team Members ({members.length})
          </h2>
          <button onClick={loadMembers} className="p-1.5 rounded-lg text-ledger/30 hover:text-ledger hover:bg-cream transition">
            <RefreshCw size={13} />
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-ledger/40 py-8 text-center">Loading members…</div>
        ) : members.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-ledger/15 py-14 text-center">
            <Users size={28} className="mx-auto text-ledger/20 mb-2" />
            <p className="text-sm text-ledger/40">No team members yet. Invite someone above.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {members.map(m => {
              const RoleIcon = ROLE_ICON[m.role] ?? Shield;
              return (
                <div key={m.user_id}
                  className="rounded-2xl bg-white border border-ledger/8 shadow-sm px-4 py-3.5 flex items-center gap-4 flex-wrap">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-marigold/15 text-marigold font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {(m.display_name || m.email)[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ledger text-sm">{m.display_name || "—"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${ROLE_STYLE[m.role] ?? ROLE_STYLE.viewer}`}>
                        <RoleIcon size={9} /> {m.role}
                      </span>
                    </div>
                    <div className="text-xs text-ledger/50 mt-0.5">{m.email}</div>
                    {m.position && <div className="text-xs text-ledger/40">{m.position}</div>}
                  </div>

                  {/* Joined date */}
                  <div className="text-xs text-ledger/30 hidden md:block flex-shrink-0">
                    {m.created_at ? new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Role selector */}
                    <select
                      value={m.role}
                      onChange={e => updateRole(m.user_id, e.target.value)}
                      className={`rounded-lg text-xs py-1.5 px-2 border font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-marigold/30 ${ROLE_STYLE[m.role] ?? ROLE_STYLE.viewer}`}
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>

                    {/* Reset password */}
                    <button onClick={() => resetPassword(m.user_id, m.email)}
                      title="Reset password"
                      className="p-1.5 rounded-lg text-ledger/30 hover:text-amber-600 hover:bg-amber-50 transition">
                      <KeyRound size={14} />
                    </button>

                    {/* Revoke */}
                    <button onClick={() => revokeAccess(m.user_id, m.display_name || m.email)}
                      title="Revoke access"
                      className="p-1.5 rounded-lg text-ledger/30 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="rounded-2xl bg-khadi/30 border border-ledger/8 p-4">
        <p className="text-xs font-semibold text-ledger/50 uppercase tracking-wider mb-2">Role Permissions</p>
        <div className="space-y-1.5">
          {ROLES.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.value} className="flex items-center gap-2.5 text-sm">
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${r.color}`}>
                  <Icon size={10} /> {r.label}
                </span>
                <span className="text-ledger/50 text-xs">{r.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CredentialRow({ label, value, copied, onCopy, mono = false }: {
  label: string; value: string; copied: boolean; onCopy: () => void; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white border border-emerald-200 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">{label}</div>
        <div className={`text-sm text-ledger font-medium truncate ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
      <button onClick={onCopy}
        className={`flex-shrink-0 p-1.5 rounded-lg transition ${copied ? "bg-emerald-100 text-emerald-600" : "text-ledger/40 hover:text-ledger hover:bg-ledger/5"}`}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
