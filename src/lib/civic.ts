export const CATEGORIES = [
  "Pothole",
  "Road Damage",
  "Garbage",
  "Water Leakage",
  "Drainage Blockage",
  "Streetlight",
  "Fallen Tree",
  "Waterlogging",
  "Illegal Dumping",
  "Public Infrastructure Damage",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_DEPARTMENT: Record<string, string> = {
  Pothole: "Roads & Infrastructure",
  "Road Damage": "Roads & Infrastructure",
  Garbage: "Waste Management",
  "Illegal Dumping": "Waste Management",
  "Water Leakage": "Water Supply",
  "Drainage Blockage": "Drainage & Sanitation",
  Waterlogging: "Drainage & Sanitation",
  Streetlight: "Electrical Maintenance",
  "Fallen Tree": "Parks & Environment",
  "Public Infrastructure Damage": "Public Works",
  Other: "General Municipal Services",
};

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = [
  "reported",
  "ai_analyzed",
  "assigned",
  "in_progress",
  "resolved",
  "verified",
  "reopened",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  reported: "Reported",
  ai_analyzed: "AI Analyzed",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  verified: "Citizen Verified",
  reopened: "Reopened",
};

export const TIMELINE: Status[] = [
  "reported",
  "ai_analyzed",
  "assigned",
  "in_progress",
  "resolved",
  "verified",
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/** Token-based badge classes — never hardcode raw colors in components. */
export function priorityClasses(priority: Priority): string {
  switch (priority) {
    case "low":
      return "bg-success/15 text-success border-success/30";
    case "medium":
      return "bg-warning/20 text-warning-foreground border-warning/40";
    case "high":
      return "bg-accent/20 text-accent border-accent/40";
    case "critical":
      return "bg-critical/20 text-critical border-critical/40";
  }
}

export function statusClasses(status: Status): string {
  switch (status) {
    case "resolved":
    case "verified":
      return "bg-success/15 text-success border-success/30";
    case "in_progress":
    case "assigned":
      return "bg-primary/12 text-primary border-primary/25";
    case "reopened":
      return "bg-critical/15 text-critical border-critical/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export const PRIORITY_HEX: Record<Priority, string> = {
  low: "#4E9F72",
  medium: "#E8A84E",
  high: "#D95C5C",
  critical: "#7A2E2E",
};

export function metresBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function textSimilarity(a: string, b: string): number {
  const norm = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );
  const sa = norm(a);
  const sb = norm(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let shared = 0;
  sa.forEach((w) => {
    if (sb.has(w)) shared += 1;
  });
  return shared / new Set([...sa, ...sb]).size;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };