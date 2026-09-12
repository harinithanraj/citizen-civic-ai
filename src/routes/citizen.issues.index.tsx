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
import { useAuth } from "@/hooks/useAuth";
import { STATUSES, STATUS_LABEL } from "@/lib/civic";
import { issuesQuery } from "@/lib/issues";

export const Route = createFileRoute("/citizen/issues/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My complaints — CivicConnect AI" },
      { name: "description", content: "Search and filter every civic issue you have reported." },
      { property: "og:title", content: "My complaints — CivicConnect AI" },
      { property: "og:description", content: "Every report you filed, with live status." },
    ],
  }),
  component: MyIssues,
});

function MyIssues() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery(issuesQuery("mine", user?.id));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (!term) return true;
      return [i.complaint_number, i.title, i.description, i.category, i.address ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [data, q, status]);

  return (
    <AppShell
      area="citizen"
      title="My complaints"
      subtitle="Every issue you've reported, with its current status."
    >
      <div className="clay flex flex-wrap gap-3 p-4">
        <label className="sr-only" htmlFor="search">
          Search complaints
        </label>
        <Input
          id="search"
          value={q}
          maxLength={120}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by complaint number, category or place…"
          className="clay-inset h-11 min-w-56 flex-1 border-0"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="clay-inset h-11 w-48 border-0" aria-label="Filter by status">
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
            <IssueCard key={issue.id} issue={issue} area="citizen" />
          ))}
        </ul>
      )}
    </AppShell>
  );
}