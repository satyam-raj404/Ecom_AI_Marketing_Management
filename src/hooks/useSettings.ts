import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserSettings } from "@/types";

const DEFAULTS: UserSettings = {
  anthropic_key: "",
  image_model_key: "",
  image_model_provider: "openai",
  auto_run_enabled: false,
  auto_run_time: "09:00",
  ai_model: "claude-opus-4-5",
};

// Loads + saves the user_settings row for the current user
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .maybeSingle();
    setSettings({ ...DEFAULTS, ...(data ?? {}) } as UserSettings);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Persists settings via upsert on user_id
  const save = async (patch: Partial<UserSettings>) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not signed in");
    const next = { ...settings, ...patch, user_id: u.user.id };
    await supabase.from("user_settings").upsert(next, { onConflict: "user_id" });
    await reload();
  };

  return { settings, loading, save, reload };
}
