import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Returns the Monday of the current week as YYYY-MM-DD
export function currentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// Returns current YYYY-MM
export function currentMonthYear(): string {
  return new Date().toISOString().slice(0, 7);
}

// Fetches latest weekly_kpis row
export function useLatestWeekly() {
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("weekly_kpis").select("*").order("week_of", { ascending: false }).limit(1).maybeSingle();
    setRow(data); setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { row, loading, reload };
}

// Fetches current month targets (creates default row if missing)
export function useMonthlyTargets() {
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const month = currentMonthYear();
  const reload = useCallback(async () => {
    setLoading(true);
    let { data } = await supabase.from("monthly_targets").select("*").eq("month_year", month).maybeSingle();
    if (!data) {
      const { data: inserted } = await supabase.from("monthly_targets").insert({ month_year: month }).select("*").maybeSingle();
      data = inserted;
    }
    setRow(data); setLoading(false);
  }, [month]);
  useEffect(() => { reload(); }, [reload]);
  return { row, loading, reload, month };
}

// Days remaining in current month
export function daysLeftInMonth(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

// "X days ago" helper
export function timeAgo(iso?: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString();
}
