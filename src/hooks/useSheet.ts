import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SheetConnection } from "@/types";

// Loads + updates the user's Google Sheet connection
export function useSheet() {
  const [sheet, setSheet] = useState<SheetConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("sheet_connections")
      .select("id, sheet_url, sheet_id, sheet_name, connected_at")
      .maybeSingle();
    setSheet((data as SheetConnection | null) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { sheet, loading, reload };
}
