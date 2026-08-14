import { Suspense, lazy } from "react";
import { ClientOnly } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import type { MapMarker } from "./CivicMap";

const CivicMap = lazy(() => import("./CivicMap"));

type Props = {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  heatmap?: boolean;
  draggableMarker?: { lat: number; lng: number } | null;
  onMarkerMove?: (pos: { lat: number; lng: number }) => void;
  onMarkerClick?: (id: string) => void;
  className?: string;
};

/** Leaflet is browser-only, so the map module is never imported during SSR. */
export function MapPanel(props: Props) {
  const fallback = <Skeleton className={props.className ?? "h-full w-full rounded-3xl"} />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <CivicMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}