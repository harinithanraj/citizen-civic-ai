import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";

import { DEFAULT_CENTER, PRIORITY_HEX, type Priority } from "@/lib/civic";
import { cn } from "@/lib/utils";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  priority: Priority;
  popupHtml: string;
};

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

export default function CivicMap({
  markers = [],
  center,
  zoom = 13,
  heatmap = false,
  draggableMarker = null,
  onMarkerMove,
  onMarkerClick,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const pinRef = useRef<ReturnType<typeof import("leaflet").marker> | null>(null);
  const moveRef = useRef(onMarkerMove);
  moveRef.current = onMarkerMove;
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;

  // Create the map once.
  useEffect(() => {
    let disposed = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: [center?.lat ?? DEFAULT_CENTER.lat, center?.lng ?? DEFAULT_CENTER.lng],
        zoom,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      map.whenReady(() => map.invalidateSize());
    })();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      pinRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render issue markers / heat circles.
  useEffect(() => {
    let disposed = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      if (disposed) return;
      const layer = layerRef.current;
      if (!layer) return;
      layer.clearLayers();
      markers.forEach((m) => {
        const color = PRIORITY_HEX[m.priority];
        if (heatmap) {
          L.circle([m.lat, m.lng], {
            radius: 220,
            color,
            weight: 0,
            fillColor: color,
            fillOpacity: 0.28,
          }).addTo(layer);
          return;
        }
        const marker = L.circleMarker([m.lat, m.lng], {
          radius: 9,
          color: "#ffffff",
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
        })
          .bindPopup(m.popupHtml)
          .addTo(layer);
        marker.on("mouseover", () => marker.setStyle({ radius: 12 }));
        marker.on("mouseout", () => marker.setStyle({ radius: 9 }));
        marker.on("click", () => clickRef.current?.(m.id));
      });
    })();
    return () => {
      disposed = true;
    };
  }, [markers, heatmap]);

  // Draggable "my location" pin.
  useEffect(() => {
    let disposed = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (disposed || !map || !draggableMarker) return;
      if (!pinRef.current) {
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#176B68;border:3px solid #fff;box-shadow:0 6px 14px rgba(23,107,104,.45)"></span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        pinRef.current = L.marker([draggableMarker.lat, draggableMarker.lng], {
          draggable: true,
          icon,
          keyboard: true,
          title: "Drag to adjust the exact issue location",
        }).addTo(map);
        pinRef.current.on("dragend", () => {
          const pos = pinRef.current?.getLatLng();
          if (pos) moveRef.current?.({ lat: pos.lat, lng: pos.lng });
        });
        map.on("click", (e) => {
          pinRef.current?.setLatLng(e.latlng);
          moveRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      } else {
        pinRef.current.setLatLng([draggableMarker.lat, draggableMarker.lng]);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [draggableMarker]);

  // Recenter when the caller moves the view.
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom());
    }
  }, [center]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Civic issue map"
      className={cn("clay-inset h-full w-full overflow-hidden", className)}
    />
  );
}