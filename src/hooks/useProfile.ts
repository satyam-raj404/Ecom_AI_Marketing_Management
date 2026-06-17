import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const ADMIN_EMAIL = "getdev24@gmail.com";

export type TeamProfile = {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string;
  position: string;
  role: string;
  invited_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type GoalItem = { label: string; target: string };
export type KpiItem = { label: string; value: number; target: number };

export type UserGoalsRow = {
  id: string;
  user_id: string;
  week_of: string;
  month_year: string;
  monthly_goals: GoalItem[];
  weekly_goals: GoalItem[];
  custom_kpis: KpiItem[];
  filled_at: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = !!(user?.email === ADMIN_EMAIL || profile?.role === "admin");

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("team_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((data as TeamProfile) ?? null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Upserts name + position only — does NOT touch role (preserved by DB)
  const saveProfile = useCallback(async (updates: { display_name: string; position: string }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("team_profiles")
      .upsert(
        {
          user_id: user.id,
          email: user.email ?? null,
          display_name: updates.display_name,
          position: updates.position,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .maybeSingle();
    if (!error && data) setProfile(data as TeamProfile);
    return error;
  }, [user?.id, user?.email]);

  return { profile, loading, isAdmin, reload: load, saveProfile };
}

export function useAllProfiles() {
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("team_profiles")
      .select("*")
      .order("created_at");
    setProfiles((data as TeamProfile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { profiles, loading, reload: load };
}
