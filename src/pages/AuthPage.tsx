import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Login-only auth page — access granted by admin via Supabase dashboard
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/team");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-cream p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-ledger">EcomBharat AI</h1>
          <p className="mt-1 text-sm text-inkblack/60">Team HQ</p>
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-ledger">Log in</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-ledger/40">
            No account? Contact your admin to get access.
          </p>
        </div>
      </div>
    </div>
  );
}
