import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Clock, Flame, PlusCircle } from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { ClayStat } from "@/components/civic/Clay";
import { IssueCard } from "@/components/civic/IssueCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { greeting } from "@/lib/civic";
import { issuesQuery, summarise } from "@/lib/issues";

export const Route = createFileRoute("/citizen/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Citizen dashboard — CivicConnect AI" },
      { name: "description", content: "Track your civic complaints and their resolution status." },
      { property: "og:title", content: "Citizen dashboard — CivicConnect AI" },
      { property: "og:description", content: "Your reports, statuses and resolution progress." },
    ],
  }),
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const { user, profile } = useAuth();
  const { data: issues, isLoading } = useQuery(issuesQuery("mine", user?.id));
  const stats = summarise(issues ?? []);
  const firstName = (profile?.name || "there").split(" ")[0];

  return (
    <AppShell
      area="citizen"
      title={`Citizen dashboard — ${greeting()}, ${firstName}`}
      subtitle="Here's what's happening with the issues you've reported."
      actions={
        <Button asChild size="lg" className="rounded-2xl">
          <Link to="/citizen/report">
            <PlusCircle className="size-4" /> Report an issue
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClayStat label="Total reports" value={stats.total} icon={<ClipboardList className="size-4" />} />
        <ClayStat label="Open" value={stats.open} tone="accent" icon={<Clock className="size-4" />} />
        <ClayStat
          label="Resolved"
          value={stats.resolved}
          tone="success"
          hint={`${stats.rate}% resolution rate`}
          icon={<CheckCircle2 className="size-4" />}
        />
        <ClayStat
          label="High priority"
          value={stats.critical}
          tone="critical"
          icon={<Flame className="size-4" />}
        />
      </div>

      <section className="mt-10" aria-labelledby="recent">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent" className="font-display text-2xl font-bold">
            Your recent reports
          </h2>
          <Button asChild variant="ghost" className="rounded-2xl">
            <Link to="/citizen/issues">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-4">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        ) : (issues ?? []).length === 0 ? (
          <div className="clay mt-5 p-10 text-center">
            <h3 className="font-display text-xl font-bold">No reports yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Spotted a pothole, overflowing bin or broken streetlight? Report it in under a minute.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-2xl">
              <Link to="/citizen/report">Report your first issue</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {(issues ?? []).slice(0, 5).map((issue) => (
              <IssueCard key={issue.id} issue={issue} area="citizen" />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}