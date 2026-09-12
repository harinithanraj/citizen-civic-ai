import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/civic/AppShell";
import { MapPanel } from "@/components/civic/MapPanel";
import { Button } from "@/components/ui/button";
import { DEFAULT_CENTER, PRIORITY_HEX, PRIORITY_LABEL, type Priority } from "@/lib/civic";
import { issuesQuery } from "@/lib/issues";

export const Route = createFileRoute("/admin/map")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "City complaint map — CivicConnect AI" },
      { name: "description", content: "Geographic view of every civic complaint, with hotspot heatmap." },
      { property: "og:title", content: "City complaint map — CivicConnect AI" },
      { property: "og:description", content: "Spot recurring civic hotspots across the city." },
    ],
  }),
  component: AdminMap,
});

function AdminMap() {
  const navigate = useNavigate();
  const { data } = useQuery(issuesQuery("all"));
  const [heatmap, setHeatmap] = useState(false);
  const located = (data ?? []).filter((i) => i.latitude != null && i.longitude != null);
  const center = located[0]
    ? { lat: located[0].latitude as number, lng: located[0].longitude as number }
    : DEFAULT_CENTER;

  return (
    <AppShell
      area="admin"
      title="City map"
      subtitle={`${located.length} located complaint${located.length === 1 ? "" : "s"}.`}
      actions={
        <Button
          variant="secondary"
          className="rounded-2xl"
          aria-pressed={heatmap}
          onClick={() => setHeatmap((v) => !v)}
        >
          {heatmap ? "Show markers" : "Show hotspots"}
        </Button>
      }
    >
      <div className="clay p-3">
        <div className="h-[65vh] min-h-96 overflow-hidden rounded-3xl">
          <MapPanel
            center={center}
            zoom={12}
            heatmap={heatmap}
            markers={located.map((i) => ({
              id: i.id,
              lat: i.latitude as number,
              lng: i.longitude as number,
              priority: i.priority as Priority,
              popupHtml: `<strong>${i.complaint_number}</strong><br/>${i.title || i.category}<br/>${i.status}`,
            }))}
            onMarkerClick={(id) => void navigate({ to: "/admin/issues/$id", params: { id } })}
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-subtle-foreground">
        {(["low", "medium", "high", "critical"] as Priority[]).map((p) => (
          <li key={p} className="inline-flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: PRIORITY_HEX[p] }} />
            {PRIORITY_LABEL[p]}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}