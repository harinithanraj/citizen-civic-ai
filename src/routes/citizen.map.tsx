import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/civic/AppShell";
import { MapPanel } from "@/components/civic/MapPanel";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_CENTER, PRIORITY_HEX, PRIORITY_LABEL, type Priority } from "@/lib/civic";
import { issuesQuery } from "@/lib/issues";

export const Route = createFileRoute("/citizen/map")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Issues near me — CivicConnect AI" },
      { name: "description", content: "See your reported civic issues plotted on an interactive map." },
      { property: "og:title", content: "Issues near me — CivicConnect AI" },
      { property: "og:description", content: "An interactive map of the issues you reported." },
    ],
  }),
  component: CitizenMap,
});

function CitizenMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data } = useQuery(issuesQuery("mine", user?.id));
  const located = (data ?? []).filter((i) => i.latitude != null && i.longitude != null);
  const center = located[0]
    ? { lat: located[0].latitude as number, lng: located[0].longitude as number }
    : DEFAULT_CENTER;

  return (
    <AppShell
      area="citizen"
      title="Issues near me"
      subtitle="Tap a marker to open the complaint. Colours show priority."
    >
      <div className="clay p-3">
        <div className="h-[65vh] min-h-96 overflow-hidden rounded-3xl">
          <MapPanel
            center={center}
            zoom={13}
            markers={located.map((i) => ({
              id: i.id,
              lat: i.latitude as number,
              lng: i.longitude as number,
              priority: i.priority as Priority,
              popupHtml: `<strong>${i.complaint_number}</strong><br/>${i.title || i.category}`,
            }))}
            onMarkerClick={(id) => void navigate({ to: "/citizen/issues/$id", params: { id } })}
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-subtle-foreground">
        {(["low", "medium", "high", "critical"] as Priority[]).map((p) => (
          <li key={p} className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="size-3 rounded-full"
              style={{ backgroundColor: PRIORITY_HEX[p] }}
            />
            {PRIORITY_LABEL[p]}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}