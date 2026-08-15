import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Send, Sparkles } from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/civic/Clay";
import { IssueImage } from "@/components/civic/IssueImage";
import { MapPanel } from "@/components/civic/MapPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  type Priority,
  type Status,
} from "@/lib/civic";
import { departmentsQuery, issueDetailQuery, relativeTime } from "@/lib/issues";

export const Route = createFileRoute("/admin/issues/$id")({
  head: () => ({
    meta: [
      { title: "Manage complaint — CivicConnect AI" },
      { name: "description", content: "Assign, prioritise and update a municipal complaint." },
      { property: "og:title", content: "Manage complaint — CivicConnect AI" },
      { property: "og:description", content: "Full complaint record with AI assessment and timeline." },
    ],
  }),
  component: AdminIssueDetail,
});

function AdminIssueDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(issueDetailQuery(id));
  const { data: departments } = useQuery(departmentsQuery);
  const [message, setMessage] = useState("");
  const [officer, setOfficer] = useState("");
  const [pending, setPending] = useState(false);

  const issue = data?.issue;

  async function apply(patch: Record<string, unknown>, note: string, status?: Status) {
    if (!issue || !user) return;
    setPending(true);
    const { error } = await supabase.from("issues").update(patch).eq("id", issue.id);
    if (error) {
      setPending(false);
      toast.error(error.message);
      return;
    }
    await supabase.from("issue_updates").insert({
      issue_id: issue.id,
      user_id: user.id,
      status: status ?? issue.status,
      message: note,
    });
    await queryClient.invalidateQueries({ queryKey: ["issue", issue.id] });
    await queryClient.invalidateQueries({ queryKey: ["issues"] });
    setPending(false);
    toast.success("Complaint updated.");
  }

  return (
    <AppShell
      area="admin"
      title={issue ? issue.title || issue.category : "Complaint"}
      subtitle={issue ? `${issue.complaint_number} · filed ${relativeTime(issue.created_at)}` : undefined}
      actions={
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link to="/admin/issues">
            <ArrowLeft className="size-4" /> Queue
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
        <p className="clay p-10 text-center text-muted-foreground">This complaint no longer exists.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <section className="clay p-6">
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
                <p className="mt-3 text-sm text-muted-foreground">
                  {data.analysis.summary || data.analysis.explanation || "No AI summary recorded."}
                </p>
                <p className="mt-3 text-xs text-subtle-foreground">
                  {data.analysis.detected_category} · {data.analysis.confidence}% confidence ·
                  recommended {data.analysis.recommended_department ?? "—"}
                </p>
              </section>
            ) : null}

            <section className="clay p-6">
              <h2 className="font-display text-lg font-bold">Timeline</h2>
              {(data?.updates ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No updates recorded yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
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
          </div>

          <aside className="space-y-6 lg:col-span-2">
            <section className="clay space-y-4 p-6">
              <h2 className="font-display text-lg font-bold">Triage</h2>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={issue.status}
                  onValueChange={(v) =>
                    void apply({ status: v }, `Status changed to ${STATUS_LABEL[v as Status]}.`, v as Status)
                  }
                >
                  <SelectTrigger id="status" className="clay-inset h-12 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={issue.priority}
                  onValueChange={(v) =>
                    void apply({ priority: v }, `Priority set to ${PRIORITY_LABEL[v as Priority]}.`)
                  }
                >
                  <SelectTrigger id="priority" className="clay-inset h-12 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={issue.department_id ?? ""}
                  onValueChange={(v) => {
                    const name = (departments ?? []).find((d) => d.id === v)?.name ?? "a department";
                    void apply({ department_id: v, status: "assigned" }, `Assigned to ${name}.`, "assigned");
                  }}
                >
                  <SelectTrigger id="department" className="clay-inset h-12 border-0">
                    <SelectValue placeholder="Assign a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {(departments ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="officer">Assigned officer</Label>
                <div className="flex gap-2">
                  <Input
                    id="officer"
                    maxLength={100}
                    value={officer || issue.assigned_officer || ""}
                    onChange={(e) => setOfficer(e.target.value)}
                    className="clay-inset h-12 border-0"
                    placeholder="Officer name"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12 rounded-2xl"
                    disabled={pending || !officer.trim()}
                    onClick={() =>
                      void apply(
                        { assigned_officer: officer.trim().slice(0, 100) },
                        `Assigned to officer ${officer.trim().slice(0, 100)}.`,
                      )
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>
            </section>

            <section className="clay p-6">
              <h2 className="font-display text-lg font-bold">Post an update</h2>
              <Textarea
                value={message}
                rows={4}
                maxLength={600}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Crew scheduled for tomorrow morning; barricades installed today."
                className="clay-inset mt-3 border-0"
                aria-label="Update message"
              />
              <Button
                className="mt-3 w-full rounded-2xl"
                disabled={pending || message.trim().length < 5}
                onClick={async () => {
                  if (!issue || !user) return;
                  setPending(true);
                  const { error } = await supabase.from("issue_updates").insert({
                    issue_id: issue.id,
                    user_id: user.id,
                    status: issue.status,
                    message: message.trim().slice(0, 600),
                  });
                  setPending(false);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  setMessage("");
                  await queryClient.invalidateQueries({ queryKey: ["issue", issue.id] });
                  toast.success("Update posted for the citizen.");
                }}
              >
                <Send className="size-4" /> Post update
              </Button>
            </section>
          </aside>
        </div>
      )}
    </AppShell>
  );
}