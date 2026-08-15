import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type IssueRow = Database["public"]["Tables"]["issues"]["Row"];
export type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];
export type UpdateRow = Database["public"]["Tables"]["issue_updates"]["Row"];
export type AnalysisRow = Database["public"]["Tables"]["ai_analysis"]["Row"];

/** RLS decides the rows: citizens see their own, admins see the whole city. */
export function issuesQuery(scope: "mine" | "all", userId?: string) {
  return queryOptions({
    queryKey: ["issues", scope, userId ?? null],
    enabled: scope === "all" || Boolean(userId),
    queryFn: async (): Promise<IssueRow[]> => {
      let q = supabase.from("issues").select("*").order("created_at", { ascending: false });
      if (scope === "mine" && userId) q = q.eq("user_id", userId);
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function issueDetailQuery(id: string) {
  return queryOptions({
    queryKey: ["issue", id],
    queryFn: async () => {
      const [issue, updates, analysis] = await Promise.all([
        supabase.from("issues").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("issue_updates")
          .select("*")
          .eq("issue_id", id)
          .order("created_at", { ascending: true }),
        supabase.from("ai_analysis").select("*").eq("issue_id", id).maybeSingle(),
      ]);
      if (issue.error) throw issue.error;
      return {
        issue: issue.data as IssueRow | null,
        updates: (updates.data ?? []) as UpdateRow[],
        analysis: (analysis.data ?? null) as AnalysisRow | null,
      };
    },
  });
}

export const departmentsQuery = queryOptions({
  queryKey: ["departments"],
  queryFn: async (): Promise<DepartmentRow[]> => {
    const { data, error } = await supabase.from("departments").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export function summarise(issues: IssueRow[]) {
  const open = issues.filter((i) => !["resolved", "verified"].includes(i.status));
  const resolved = issues.filter((i) => ["resolved", "verified"].includes(i.status));
  const critical = issues.filter((i) => i.priority === "critical" || i.priority === "high");
  const rate = issues.length ? Math.round((resolved.length / issues.length) * 100) : 0;
  const days = resolved
    .map((i) => (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / 86_400_000)
    .filter((d) => d >= 0);
  const avgDays = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0;
  return {
    total: issues.length,
    open: open.length,
    resolved: resolved.length,
    critical: critical.length,
    rate,
    avgDays,
  };
}

export function countBy<T extends string>(rows: IssueRow[], key: (r: IssueRow) => T) {
  const map = new Map<T, number>();
  rows.forEach((r) => {
    const k = key(r);
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}