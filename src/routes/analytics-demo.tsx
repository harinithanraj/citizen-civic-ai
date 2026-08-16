import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { ClayStat, DemoDataNote, SectionHeading, StatusBadge, PriorityBadge } from "@/components/civic/Clay";
import { Logo } from "@/components/civic/Logo";
import {
  CATEGORIES,
  PRIORITY_HEX,
  STATUSES,
  STATUS_LABEL,
  type Priority,
  type Status,
} from "@/lib/civic";
import { buildDemoIssues, downloadCsv, toCsv, WARDS, type DemoIssue } from "@/lib/demo-analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics-demo")({
  head: () => ({
    meta: [
      { title: "Analytics demo — explore civic complaint trends" },
      {
        name: "description",
        content:
          "Interactive demo dashboard: filter sample civic complaints by category, status, ward and time, then download the filtered rows as CSV.",
      },
      { property: "og:title", content: "Analytics demo — explore civic complaint trends" },
      {
        property: "og:description",
        content: "Filter sample complaint data by category, status and time range, and export CSV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsDemo,
});

const RANGES = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "6 months", days: 180 },
] as const;

const BUCKETS = ["day", "week", "month"] as const;
type Bucket = (typeof BUCKETS)[number];

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function bucketKey(iso: string, bucket: Bucket) {
  const d = new Date(iso);
  if (bucket === "month") return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  if (bucket === "week") {
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return `w/c ${monday.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
  }
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function AnalyticsDemo() {
  const all = useMemo(() => buildDemoIssues(), []);
  const [days, setDays] = useState<number>(90);
  const [bucket, setBucket] = useState<Bucket>("week");
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [ward, setWard] = useState<string>("all");

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const rows = useMemo(() => {
    const cutoff = Date.now() - days * 86_400_000;
    return all.filter(
      (r) =>
        new Date(r.created_at).getTime() >= cutoff &&
        (categories.length === 0 || categories.includes(r.category)) &&
        (statuses.length === 0 || statuses.includes(r.status)) &&
        (ward === "all" || r.ward === ward),
    );
  }, [all, days, categories, statuses, ward]);

  const stats = useMemo(() => {
    const closed = rows.filter((r) => r.resolved_days !== null);
    const avg = closed.length
      ? closed.reduce((a, r) => a + (r.resolved_days ?? 0), 0) / closed.length
      : 0;
    return {
      total: rows.length,
      open: rows.length - closed.length,
      rate: rows.length ? Math.round((closed.length / rows.length) * 100) : 0,
      avg,
    };
  }, [rows]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    [...rows]
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .forEach((r) => {
        const k = bucketKey(r.created_at, bucket);
        map.set(k, (map.get(k) ?? 0) + 1);
      });
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [rows, bucket]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.category, (map.get(r.category) ?? 0) + 1));
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(STATUS_LABEL[r.status], (map.get(STATUS_LABEL[r.status]) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  const byPriority = useMemo(() => {
    const map = new Map<Priority, number>();
    rows.forEach((r) => map.set(r.priority, (map.get(r.priority) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  const preview: DemoIssue[] = rows.slice(0, 12);

  const reset = () => {
    setCategories([]);
    setStatuses([]);
    setWard("all");
    setDays(90);
    setBucket("week");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <DemoDataNote />
          <Button
            onClick={() => downloadCsv(`civic-complaints-${days}d.csv`, toCsv(rows))}
            disabled={rows.length === 0}
          >
            Download CSV ({rows.length})
          </Button>
        </div>
      </header>

      <SectionHeading
        className="mt-8"
        eyebrow="Analytics demo"
        title="Explore complaint trends"
        description="Filter a sample city dataset by category, status, ward and time range. Every chart and the CSV export follow your filters."
      />

      <section className="clay mt-8 p-6" aria-label="Filters">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Time range</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RANGES.map((r) => (
                <Chip key={r.days} active={days === r.days} onClick={() => setDays(r.days)}>
                  {r.label}
                </Chip>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Group trend by
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BUCKETS.map((b) => (
                <Chip key={b} active={bucket === b} onClick={() => setBucket(b)}>
                  {b}
                </Chip>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Ward</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip active={ward === "all"} onClick={() => setWard("all")}>
                All wards
              </Chip>
              {WARDS.map((w) => (
                <Chip key={w} active={ward === w} onClick={() => setWard(w)}>
                  {w}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  active={categories.includes(c)}
                  onClick={() => toggle(categories, c as string, setCategories)}
                >
                  {c}
                </Chip>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Chip key={s} active={statuses.includes(s)} onClick={() => toggle(statuses, s, setStatuses)}>
                  {STATUS_LABEL[s]}
                </Chip>
              ))}
            </div>
            <Button variant="outline" className="mt-6" onClick={reset}>
              Reset filters
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClayStat label="Complaints in view" value={stats.total} />
        <ClayStat label="Still open" value={stats.open} tone="accent" />
        <ClayStat label="Resolution rate" value={`${stats.rate}%`} tone="success" />
        <ClayStat label="Avg resolution time" value={stats.avg ? `${stats.avg.toFixed(1)}d` : "—"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="clay p-6">
          <h2 className="font-display text-lg font-bold">Reports over time</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="clay p-6">
          <h2 className="font-display text-lg font-bold">Priority mix</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPriority} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {byPriority.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_HEX[entry.name]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="clay p-6">
          <h2 className="font-display text-lg font-bold">Complaints by category</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="name" width={140} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="clay p-6">
          <h2 className="font-display text-lg font-bold">Status breakdown</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="clay mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Filtered rows</h2>
          <p className="text-xs text-muted-foreground">
            Showing {preview.length} of {rows.length} — the CSV contains every filtered row.
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-2 pr-4">Complaint</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Priority</th>
                <th className="py-2 pr-4">Ward</th>
                <th className="py-2">Reported</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r) => (
                <tr key={r.complaint_number} className="border-t border-border/70">
                  <td className="py-3 pr-4 font-semibold">{r.complaint_number}</td>
                  <td className="py-3 pr-4">{r.category}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.ward}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {preview.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No complaints match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}