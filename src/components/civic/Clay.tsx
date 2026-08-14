import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  priorityClasses,
  statusClasses,
  type Priority,
  type Status,
} from "@/lib/civic";

export function ClayCard({
  children,
  className,
  interactive,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag className={cn("clay p-6", interactive && "clay-hover", className)}>{children}</Tag>
  );
}

export function ClayStat({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "accent" | "success" | "critical";
}) {
  const toneRing =
    tone === "accent"
      ? "bg-accent/15 text-accent"
      : tone === "success"
        ? "bg-success/15 text-success"
        : tone === "critical"
          ? "bg-critical/15 text-critical"
          : "bg-primary/10 text-primary";
  return (
    <div className="clay clay-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span className={cn("grid size-9 place-items-center rounded-2xl", toneRing)}>{icon}</span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-subtle-foreground">{hint}</p> : null}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        priorityClasses(priority),
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {PRIORITY_LABEL[priority]} priority
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        statusClasses(status),
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-bold tracking-[0.18em] text-primary-soft uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function DemoDataNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning-foreground",
        className,
      )}
    >
      Sample / demo data
    </p>
  );
}