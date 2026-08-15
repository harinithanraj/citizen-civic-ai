import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/civic/AppShell";
import { IssueCard } from "@/components/civic/IssueCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/civic";
import { issuesQuery } from "@/lib/issues";

export const Route = createFileRoute("/admin/issues/")({
  head: () => ({
    meta: [
      { title: "Complaint queue — CivicConnect AI" },
      { name: "description", content: "Filter, prioritise and work through the city complaint queue." },
      { property: "og:title", content: "Complaint queue — CivicConnect AI" },
      { property: "og:description", content: "The full municipal complaint queue with filters." },
    ],
  }),
  component: AdminIssues,
});

function AdminIssues() {
  const { data, isLoading } = useQuery(issuesQuery("all"));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (priority !== "all" && i.priority !== priority) return false;
      if (category !== "all" && i.category !== category) return false;
      if (!term) return true;
      return [i.complaint_number, i.title, i.description, i.address ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [data, q, status, priority, category]);

  return (
    <AppShell
      area="admin"
      title="Complaint queue"
      subtitle={`${filtered.length} complaint${filtered.length === 1 ? "" : "s"} match your filters.`}
    >
      <div className="clay grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <Input
          value={q}
          maxLength={120}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search complaints…"
          aria-label="Search complaints"
          className="clay-inset h-11 border-0"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="clay-inset h-11 border-0" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="clay-inset h-11 border-0" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="clay-inset h-11 border-0" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="clay mt-5 p-10 text-center text-muted-foreground">
          No complaints match these filters.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} area="admin" />
          ))}
        </ul>
      )}
    </AppShell>
  );
}