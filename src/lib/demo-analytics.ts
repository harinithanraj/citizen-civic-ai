import { CATEGORIES, PRIORITIES, STATUSES, type Priority, type Status } from "@/lib/civic";

export type DemoIssue = {
  complaint_number: string;
  title: string;
  category: string;
  status: Status;
  priority: Priority;
  ward: string;
  created_at: string;
  resolved_days: number | null;
};

export const WARDS = ["Ward 1 — Central", "Ward 2 — North", "Ward 3 — East", "Ward 4 — South", "Ward 5 — West"];

/** Deterministic PRNG so server and client render the same demo dataset. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TITLES: Record<string, string> = {
  Pothole: "Deep pothole near junction",
  "Road Damage": "Cracked road surface",
  Garbage: "Uncollected garbage pile",
  "Water Leakage": "Pipeline leaking on street",
  "Drainage Blockage": "Blocked storm drain",
  Streetlight: "Streetlight not working",
  "Fallen Tree": "Tree blocking footpath",
  Waterlogging: "Waterlogging after rain",
  "Illegal Dumping": "Construction debris dumped",
  "Public Infrastructure Damage": "Damaged bus shelter",
  Other: "General civic complaint",
};

/** 420 synthetic complaints spread across the last 180 days. */
export function buildDemoIssues(): DemoIssue[] {
  const rand = mulberry(20260816);
  const now = Date.now();
  const rows: DemoIssue[] = [];
  for (let i = 0; i < 420; i += 1) {
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)]!;
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]!;
    const priority = PRIORITIES[Math.floor(rand() * PRIORITIES.length)]!;
    const ward = WARDS[Math.floor(rand() * WARDS.length)]!;
    const daysAgo = Math.floor(rand() * 180);
    const closed = status === "resolved" || status === "verified";
    rows.push({
      complaint_number: `CIV-${2000 + i}`,
      title: TITLES[category] ?? "Civic complaint",
      category,
      status,
      priority,
      ward,
      created_at: new Date(now - daysAgo * 86_400_000).toISOString(),
      resolved_days: closed ? Math.round((1 + rand() * 20) * 10) / 10 : null,
    });
  }
  return rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function toCsv(rows: DemoIssue[]): string {
  const header = [
    "complaint_number",
    "title",
    "category",
    "status",
    "priority",
    "ward",
    "created_at",
    "resolution_days",
  ];
  const escape = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [
      r.complaint_number,
      r.title,
      r.category,
      r.status,
      r.priority,
      r.ward,
      r.created_at,
      r.resolved_days,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}