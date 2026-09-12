import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, MapPin, RotateCcw, Sparkles } from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/civic/Clay";
import { IssueImage } from "@/components/civic/IssueImage";
import { MapPanel } from "@/components/civic/MapPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, TIMELINE, type Priority, type Status } from "@/lib/civic";
import { issueDetailQuery, relativeTime } from "@/lib/issues";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/issues/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Complaint details — CivicConnect AI" },
      { name: "description", content: "Follow the resolution timeline of your civic complaint." },
      { property: "og:title", content: "Complaint details — CivicConnect AI" },
      { property: "og:description", content: "Status, AI assessment and municipal updates." },
    ],
  }),
  component: IssueDetail,
});

function IssueDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(issueDetailQuery(id));
  const [pending, setPending] = useState(false);

  const issue = data?.issue;

  async function setStatus(status: Status, message: string) {
    if (!issue || !user) return;
    setPending(true);
    const { error } = await supabase.from("issues").update({ status }).eq("id", issue.id);
    if (error) {
      setPending(false);
      toast.error(error.message);
      return;
    }
    await supabase.from("issue_updates").insert({
      issue_id: issue.id,
      user_id: user.id,
      status,
      message,
    });
    await queryClient.invalidateQueries({ queryKey: ["issue", issue.id] });
    await queryClient.invalidateQueries({ queryKey: ["issues"] });
    setPending(false);
    toast.success("Thanks — the municipal team has been notified.");
  }

  return (
    <AppShell
      area="citizen"
      title={issue ? issue.title || issue.category : "Complaint"}
      subtitle={issue ? `${issue.complaint_number} · reported ${relativeTime(issue.created_at)}` : undefined}
      actions={
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link to="/citizen/issues">
            <ArrowLeft className="size-4" /> All complaints
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : !issue ? (
        <p className="clay p-10 text-center text-muted-foreground">
          This complaint doesn't exist or you don't have access to it.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <section className="clay overflow-hidden p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={issue.status as Status} />
                <PriorityBadge priority={issue.priority as Priority} />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                  {issue.category}
                </span>
              </div>
              <IssueImage
                path={issue.image_url}
                alt={`Photo submitted with ${issue.complaint_number}`}
                className="mt-5 aspect-video w-full object-cover"
              />
              <p className="mt-5 whitespace-pre-line text-muted-foreground">{issue.description}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-subtle-foreground">
                <MapPin className="size-4" /> {issue.address || "Pinned on the map"}
              </p>
            </section>

            {issue.latitude != null && issue.longitude != null ? (
              <section className="clay p-3">
                <div className="h-64 overflow-hidden rounded-3xl">
                  <MapPanel
                    center={{ lat: issue.latitude, lng: issue.longitude }}
                    zoom={16}
                    markers={[
                      {
                        id: issue.id,
                        lat: issue.latitude,
                        lng: issue.longitude,
                        priority: issue.priority as Priority,
                        popupHtml: `<strong>${issue.complaint_number}</strong><br/>${issue.category}`,
                      },
                    ]}
                  />
                </div>
              </section>
            ) : null}

            {data?.analysis ? (
              <section className="clay p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  <h2 className="font-display text-lg font-bold">AI assessment</h2>
                </div>
                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-subtle-foreground">Detected</dt>
                    <dd className="font-semibold">{data.analysis.detected_category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-subtle-foreground">Confidence</dt>
                    <dd className="font-semibold">{data.analysis.confidence}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-subtle-foreground">Department</dt>
                    <dd className="font-semibold">{data.analysis.recommended_department ?? "—"}</dd>
                  </div>
                </dl>
                {data.analysis.explanation ? (
                  <p className="clay-inset mt-4 p-4 text-sm text-muted-foreground">
                    {data.analysis.explanation}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:col-span-2">
            <section className="clay p-6">
              <h2 className="font-display text-lg font-bold">Progress</h2>
              <ol className="mt-5 space-y-4">
                {TIMELINE.map((step) => {
                  const reached =
                    TIMELINE.indexOf(issue.status as Status) >= TIMELINE.indexOf(step) &&
                    issue.status !== "reopened";
                  return (
                    <li key={step} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                          reached
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-subtle-foreground",
                        )}
                        aria-hidden
                      >
                        {reached ? "✓" : ""}
                      </span>
                      <span className={cn("text-sm", reached ? "font-semibold" : "text-subtle-foreground")}>
                        {STATUS_LABEL[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {issue.status === "resolved" ? (
                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full rounded-2xl"
                    disabled={pending}
                    onClick={() =>
                      void setStatus("verified", "Citizen confirmed the issue is fixed.")
                    }
                  >
                    <CheckCircle2 className="size-4" /> Confirm it's fixed
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full rounded-2xl"
                    disabled={pending}
                    onClick={() =>
                      void setStatus("reopened", "Citizen reopened the complaint — issue persists.")
                    }
                  >
                    <RotateCcw className="size-4" /> Still not fixed
                  </Button>
                </div>
              ) : null}
            </section>

            <section className="clay p-6">
              <h2 className="font-display text-lg font-bold">Updates</h2>
              {(data?.updates ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {(data?.updates ?? []).map((u) => (
                    <li key={u.id} className="clay-inset p-4">
                      <p className="text-sm">{u.message}</p>
                      <p className="mt-1 text-xs text-subtle-foreground">
                        {u.status ? `${STATUS_LABEL[u.status as Status]} · ` : ""}
                        {relativeTime(u.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}
    </AppShell>
  );
}