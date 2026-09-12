import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AppShell } from "@/components/civic/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { setUserRole } from "@/lib/ai.functions";

export const Route = createFileRoute("/admin/users")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Users & roles — CivicConnect AI" },
      { name: "description", content: "Manage citizen and administrator access for the city portal." },
      { property: "og:title", content: "Users & roles — CivicConnect AI" },
      { property: "og:description", content: "Grant or revoke municipal administrator access." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const changeRole = useServerFn(setUserRole);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (profiles.error) throw profiles.error;
      const admins = new Set((roles.data ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
      return (profiles.data ?? []).map((p) => ({ ...p, isAdmin: admins.has(p.id) }));
    },
  });

  return (
    <AppShell area="admin" title="Users & roles" subtitle="Grant municipal access to trusted staff only.">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-3xl" />
          <Skeleton className="h-16 rounded-3xl" />
        </div>
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((p) => (
            <li key={p.id} className="clay flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.name || "Unnamed citizen"}</p>
                <p className="truncate text-sm text-subtle-foreground">
                  {p.email}
                  {p.ward ? ` · ${p.ward}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    p.isAdmin
                      ? "rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary"
                      : "rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {p.isAdmin ? "Administrator" : "Citizen"}
                </span>
                <Button
                  variant={p.isAdmin ? "ghost" : "secondary"}
                  className="rounded-2xl"
                  disabled={p.id === user?.id}
                  onClick={async () => {
                    const res = await changeRole({ data: { userId: p.id, makeAdmin: !p.isAdmin } });
                    if (!res.ok) {
                      toast.error(res.reason ?? "Couldn't update the role.");
                      return;
                    }
                    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                    toast.success(p.isAdmin ? "Administrator access removed." : "Administrator access granted.");
                  }}
                >
                  {p.isAdmin ? "Revoke admin" : "Make admin"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}