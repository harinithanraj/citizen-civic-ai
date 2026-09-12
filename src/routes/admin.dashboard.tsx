import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ClipboardList, Timer } from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { ClayStat } from "@/components/civic/Clay";
import { IssueCard } from "@/components/civic/IssueCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { countBy, issuesQuery, summarise } from "@/lib/issues";

export const Route = createFileRoute("/admin/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Operations overview — CivicConnect AI" },
      { name: "description", content: "City-wide civic complaint volumes, priorities and resolution rates." },
      { property: "og:title", content: "Operations overview — CivicConnect AI" },
      { property: "og:description", content: "Live municipal complaint operations at a glance." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useQuery(issuesQuery("all"));
  const issues = data ?? [];
  const stats = summarise(issues);
  const byCategory = countBy(issues, (i) => i.category).slice(0, 6);
  const urgent = issues
    .filter((i) => !["resolved", "verified"].includes(i.status))
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return rank[a.priority] - rank[b.priority];
    })
    .slice(0, 5);

  return (
    <AppShell
      area="admin"
      title="City operations"
      subtitle="Every complaint citizens have filed, prioritised by AI severity."
      actions={
        <Button asChild size="lg" className="rounded-2xl">
          <Link to="/admin/issues">Manage complaints</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClayStat label="Total complaints" value={stats.total} icon={<ClipboardList className="size-4" />} />
        <ClayStat label="Open" value={stats.open} tone="accent" icon={<Timer className="size-4" />} />
        <ClayStat
          label="Resolved"
          value={stats.resolved}
          tone="success"
          hint={`${stats.rate}% resolution rate`}
          icon={<CheckCircle2 className="size-4" />}
        />
        <ClayStat
          label="High / critical"
          value={stats.critical}
          tone="critical"
          hint={stats.avgDays ? `Avg ${stats.avgDays.toFixed(1)} days to resolve` : undefined}
          icon={<AlertTriangle className="size-4" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="clay p-6 lg:col-span-1" aria-labelledby="cats">
          <h2 id="cats" className="font-display text-lg font-bold">
            Top categories
          </h2>
          {byCategory.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No complaints yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byCategory.map((c) => (
                <li key={c.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-subtle-foreground">{c.value}</span>
                  </div>
                  <div className="clay-inset mt-1.5 h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((c.value / (byCategory[0]?.value || 1)) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2" aria-labelledby="urgent">
          <h2 id="urgent" className="font-display text-lg font-bold">
            Needs attention first
          </h2>
          {isLoading ? (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-40 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
            </div>
          ) : urgent.length === 0 ? (
            <p className="clay mt-4 p-8 text-center text-muted-foreground">
              Nothing open right now — the queue is clear.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {urgent.map((issue) => (
                <IssueCard key={issue.id} issue={issue} area="admin" />
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}