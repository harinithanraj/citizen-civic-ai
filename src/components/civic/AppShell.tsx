import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  PlusCircle,
  UserCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { CiviAssistant } from "./CiviAssistant";
import { Logo } from "./Logo";

type NavItem = { to: string; label: string; icon: ReactNode };

const citizenNav: NavItem[] = [
  { to: "/citizen/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { to: "/citizen/report", label: "Report", icon: <PlusCircle className="size-4" /> },
  { to: "/citizen/issues", label: "My issues", icon: <ClipboardList className="size-4" /> },
  { to: "/citizen/map", label: "Nearby", icon: <MapIcon className="size-4" /> },
  { to: "/citizen/profile", label: "Profile", icon: <UserCircle className="size-4" /> },
];

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { to: "/admin/issues", label: "Complaints", icon: <ClipboardList className="size-4" /> },
  { to: "/admin/map", label: "City map", icon: <MapIcon className="size-4" /> },
  { to: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { to: "/admin/departments", label: "Departments", icon: <Building2 className="size-4" /> },
  { to: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
];

export function AppShell({
  area,
  title,
  subtitle,
  actions,
  children,
}: {
  area: "citizen" | "admin";
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  const { loading, user, isAdmin, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = area === "admin" ? adminNav : citizenNav;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/login", search: { next: pathname } });
      return;
    }
    if (area === "admin" && !isAdmin) {
      void navigate({ to: "/citizen/dashboard" });
    }
  }, [loading, user, isAdmin, area, navigate, pathname]);

  if (loading || !user || (area === "admin" && !isAdmin)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <Skeleton className="h-12 w-64 rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="clay sticky top-0 z-30 m-0 flex items-center gap-2 overflow-x-auto rounded-none p-3 lg:m-4 lg:h-[calc(100vh-2rem)] lg:w-64 lg:flex-col lg:items-stretch lg:rounded-4xl lg:p-5">
        <div className="hidden lg:block">
          <Logo />
          <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-subtle-foreground uppercase">
            {area === "admin" ? "Operations" : "Citizen"}
          </p>
        </div>
        <nav className="flex flex-1 gap-2 lg:mt-2 lg:flex-col" aria-label="Main navigation">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? "clay-press bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-primary",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:block">
          <div className="clay-inset mb-3 p-3">
            <p className="truncate text-sm font-semibold">{profile?.name || "Citizen"}</p>
            <p className="truncate text-xs text-subtle-foreground">{profile?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl"
            onClick={async () => {
              await signOut();
              void navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto shrink-0 rounded-2xl lg:hidden"
          aria-label="Sign out"
          onClick={async () => {
            await signOut();
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" />
        </Button>
      </aside>

      <main className="min-w-0 flex-1 px-4 pt-6 pb-24 sm:px-6 lg:py-8 lg:pr-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
        {children}
      </main>

      <CiviAssistant />
    </div>
  );
}