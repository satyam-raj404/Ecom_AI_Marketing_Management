import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Auth page with explicit Login / Sign up tabs
export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/team");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/team` },
        });
        if (error) throw error;
        // Try immediate login (works when email confirmation is disabled)
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) {
          toast.success("Account created. Please log in.");
          setMode("login");
        } else {
          navigate("/team");
        }
      }
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
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-cream p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md py-2 text-sm font-medium transition ${
                mode === "login" ? "bg-white text-ledger shadow-sm" : "text-inkblack/60"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md py-2 text-sm font-medium transition ${
                mode === "signup" ? "bg-white text-ledger shadow-sm" : "text-inkblack/60"
              }`}
            >
              Sign up
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
