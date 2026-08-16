import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { departmentsQuery, issuesQuery } from "@/lib/issues";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [
      { title: "Departments — CivicConnect AI" },
      { name: "description", content: "Municipal departments and their current complaint workload." },
      { property: "og:title", content: "Departments — CivicConnect AI" },
      { property: "og:description", content: "Workload per municipal department." },
    ],
  }),
  component: Departments,
});

function Departments() {
  const { data: departments, isLoading } = useQuery(departmentsQuery);
  const { data: issues } = useQuery(issuesQuery("all"));

  return (
    <AppShell
      area="admin"
      title="Departments"
      subtitle="Complaint load per department, based on AI routing and manual assignment."
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(departments ?? []).map((d) => {
            const assigned = (issues ?? []).filter((i) => i.department_id === d.id);
            const open = assigned.filter((i) => !["resolved", "verified"].includes(i.status)).length;
            return (
              <li key={d.id} className="clay clay-hover p-6">
                <span className="clay-inset grid size-11 place-items-center rounded-2xl text-primary">
                  <Building2 className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold">{d.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                <dl className="mt-4 flex gap-6 text-sm">
                  <div>
                    <dt className="text-xs text-subtle-foreground">Assigned</dt>
                    <dd className="font-display text-2xl font-bold">{assigned.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-subtle-foreground">Open</dt>
                    <dd className="font-display text-2xl font-bold text-accent">{open}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}