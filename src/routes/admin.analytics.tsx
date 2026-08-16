import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/civic/AppShell";
import { ClayStat } from "@/components/civic/Clay";
import { PRIORITY_HEX, STATUS_LABEL, type Priority, type Status } from "@/lib/civic";
import { countBy, issuesQuery, summarise } from "@/lib/issues";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Civic analytics — CivicConnect AI" },
      { name: "description", content: "Category trends, priority mix and resolution performance." },
      { property: "og:title", content: "Civic analytics — CivicConnect AI" },
      { property: "og:description", content: "Understand where civic issues concentrate and how fast they close." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data } = useQuery(issuesQuery("all"));
  const issues = data ?? [];
  const stats = summarise(issues);
  const byCategory = countBy(issues, (i) => i.category);
  const byPriority = countBy(issues, (i) => i.priority as Priority);
  const byStatus = countBy(issues, (i) => STATUS_LABEL[i.status as Status]);

  const last14 = [...Array(14)].map((_, idx) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (13 - idx));
    const next = new Date(day.getTime() + 86_400_000);
    const count = issues.filter((i) => {
      const t = new Date(i.created_at).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
    return { name: day.toLocaleDateString(undefined, { day: "numeric", month: "short" }), count };
  });

  return (
    <AppShell
      area="admin"
      title="Analytics"
      subtitle="Where issues concentrate, and how quickly the city closes them."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClayStat label="Complaints" value={stats.total} />
        <ClayStat label="Resolution rate" value={`${stats.rate}%`} tone="success" />
        <ClayStat label="Open" value={stats.open} tone="accent" />
        <ClayStat
          label="Avg resolution time"
          value={stats.avgDays ? `${stats.avgDays.toFixed(1)}d` : "—"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="clay p-6">
          <h2 className="font-display text-lg font-bold">Reports over the last 14 days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={false}
                />
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
                    <Cell key={entry.name} fill={PRIORITY_HEX[entry.name as Priority]} />
                  ))}
                </Pie>
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
                <YAxis type="category" dataKey="name" width={130} fontSize={11} />
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
    </AppShell>
  );
}