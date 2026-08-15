import { Link } from "@tanstack/react-router";
import { MapPin, MessageSquare } from "lucide-react";

import { IssueImage } from "./IssueImage";
import { PriorityBadge, StatusBadge } from "./Clay";
import { relativeTime, type IssueRow } from "@/lib/issues";
import type { Priority, Status } from "@/lib/civic";

export function IssueCard({ issue, area }: { issue: IssueRow; area: "citizen" | "admin" }) {
  return (
    <li className="clay clay-hover overflow-hidden p-0">
      <Link
        to={area === "admin" ? "/admin/issues/$id" : "/citizen/issues/$id"}
        params={{ id: issue.id }}
        className="flex flex-col gap-4 p-5 sm:flex-row"
      >
        <IssueImage
          path={issue.image_url}
          alt={`Photo attached to ${issue.complaint_number}`}
          className="h-32 w-full shrink-0 rounded-3xl object-cover sm:w-44"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-primary">
              {issue.complaint_number}
            </span>
            <StatusBadge status={issue.status as Status} />
            <PriorityBadge priority={issue.priority as Priority} />
          </div>
          <h3 className="mt-3 truncate font-display text-lg font-bold">
            {issue.title || issue.category}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-subtle-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {issue.address || "Location pinned on map"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="size-3.5" /> {issue.category}
            </span>
            <span>{relativeTime(issue.created_at)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}