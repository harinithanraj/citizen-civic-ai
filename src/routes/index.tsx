import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  Camera,
  CheckCircle2,
  MapPin,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import heroImage from "@/assets/civic-hero.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/civic/Logo";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "CivicConnect AI — Report Civic Issues, Get Them Fixed" },
      {
        name: "description",
        content:
          "Snap a photo, drop a pin and let AI classify, prioritise and route your civic complaint to the right municipal department.",
      },
      { property: "og:title", content: "CivicConnect AI — Report Civic Issues, Get Them Fixed" },
      {
        property: "og:description",
        content:
          "AI-powered civic issue reporting: instant classification, severity scoring and department routing with live status tracking.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: Camera,
    title: "Report in seconds",
    body: "Take a photo, add a short note and confirm the location on the map. That's the whole form.",
  },
  {
    icon: Brain,
    title: "AI understands it",
    body: "Civi classifies the issue, estimates severity and writes a clear summary for the municipal team.",
  },
  {
    icon: RouteIcon,
    title: "Routed to the right desk",
    body: "Each complaint is matched to the responsible department with a priority the crew can act on.",
  },
  {
    icon: CheckCircle2,
    title: "Tracked until verified",
    body: "Follow every status change and confirm the fix yourself once the work is done.",
  },
];

const features = [
  { icon: MapPin, title: "Live civic map", body: "See reported issues around you and avoid duplicate complaints." },
  { icon: TrendingUp, title: "Ward analytics", body: "Resolution rates, category trends and hotspots for the whole city." },
  { icon: Sparkles, title: "Civi assistant", body: "Ask “where is my complaint?” in plain language, any time." },
  { icon: ShieldCheck, title: "Private by default", body: "Photos live in protected storage; personal details are never sent to the AI." },
];

function Index() {
  const { user, isAdmin } = useAuth();
  const dashboardTo = isAdmin ? "/admin/dashboard" : "/citizen/dashboard";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <Logo />
        <nav className="flex items-center gap-2" aria-label="Account">
          {user ? (
            <Button asChild size="lg" className="rounded-2xl">
              <Link to={dashboardTo}>Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-2xl">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="lg" className="rounded-2xl">
                <Link to="/register">Report an issue</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24">
        <section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
          <div>
            <span className="clay-inset inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">
              <Sparkles className="size-3.5" /> AI-assisted civic action
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-extrabold sm:text-6xl">
              Report a civic issue.
              <span className="block text-primary">Watch it get resolved.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              CivicConnect AI turns a photo and a pin into a properly classified, prioritised and
              routed municipal complaint — then keeps you posted until the fix is verified.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl px-7">
                <Link to={user ? "/citizen/report" : "/register"}>
                  <Camera className="size-4" /> Report an issue
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-2xl px-7">
                <Link to={user ? dashboardTo : "/login"}>Municipal sign in</Link>
              </Button>
            </div>
          </div>
          <div className="clay-lg overflow-hidden p-3">
            <img
              src={heroImage}
              alt="Clay-style illustration of municipal workers repairing a pothole while a citizen reports it from a phone"
              width={1280}
              height={960}
              className="h-full w-full rounded-3xl object-cover"
            />
          </div>
        </section>

        <section className="py-8" aria-labelledby="how">
          <h2 id="how" className="font-display text-3xl font-bold">
            How it works
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <article key={s.title} className="clay clay-hover p-6">
                <span className="clay-inset grid size-11 place-items-center rounded-2xl text-primary">
                  <s.icon className="size-5" />
                </span>
                <p className="mt-5 text-xs font-bold tracking-[0.16em] text-subtle-foreground uppercase">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12" aria-labelledby="features">
          <h2 id="features" className="font-display text-3xl font-bold">
            Built for citizens and city teams
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <article key={f.title} className="clay flex gap-4 p-6">
                <span className="clay-inset grid size-11 shrink-0 place-items-center rounded-2xl text-accent">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="clay-lg mt-6 flex flex-wrap items-center justify-between gap-6 p-8 sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Something broken in your neighbourhood?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              It takes under a minute. Your report reaches the right department with the context they
              need.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-2xl px-8">
            <Link to={user ? "/citizen/report" : "/register"}>Get started</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-subtle-foreground">
          <Logo compact />
          <p>CivicConnect AI — crowdsourced civic issue reporting and resolution.</p>
        </div>
      </footer>
    </div>
  );
}
