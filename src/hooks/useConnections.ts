import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlatformConnection } from "@/types";

// Loads and updates platform_connections rows for the current user
export function useConnections() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("platform_connections")
      .select("id, platform, status, platform_username, connected_at");
    setConnections((data ?? []) as PlatformConnection[]);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Returns the connection record for a single platform, if any
  const getFor = (platform: string) =>
    connections.find((c) => c.platform === platform);

  // Removes the row entirely (revokes the connection)
  const disconnect = async (platform: string) => {
    await supabase.from("platform_connections").delete().eq("platform", platform);
    await reload();
  };

  return { connections, loading, reload, getFor, disconnect };
}
