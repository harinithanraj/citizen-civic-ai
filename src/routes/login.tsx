import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/civic/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — CivicConnect AI" },
      { name: "description", content: "Sign in to report civic issues and track their resolution." },
      { property: "og:title", content: "Sign in — CivicConnect AI" },
      { property: "og:description", content: "Access your civic complaints and status updates." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isAdmin, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (loading || !user || role === null) return;
    const target = next && next.startsWith("/") ? next : isAdmin ? "/admin/dashboard" : "/citizen/dashboard";
    void navigate({ to: target, replace: true });
  }, [loading, user, isAdmin, role, next, navigate]);

  async function signInWith(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in with the demo account.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z
      .object({ email: z.string().trim().email(), password: z.string().min(6).max(72) })
      .safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Enter a valid email address and a password of at least 6 characters.");
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "That email and password combination doesn't match an account."
          : error.message,
      );
      return;
    }
    toast.success("Welcome back to CivicConnect.");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="clay-lg w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-bold">Sign in to CivicConnect AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to report issues and follow every status update.
        </p>

        <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="clay-inset h-12 border-0"
              placeholder="you@city.in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="clay-inset h-12 border-0"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="clay-inset mt-6 space-y-3 p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-subtle-foreground uppercase">
            Try a demo account
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-2xl"
              disabled={pending}
              onClick={() => void signInWith("citizen@civicconnect.demo", "Demo1234!")}
            >
              Citizen demo
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-2xl"
              disabled={pending}
              onClick={() => void signInWith("admin@civicconnect.demo", "Demo1234!")}
            >
              Admin demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            citizen@civicconnect.demo / admin@civicconnect.demo — password Demo1234!
          </p>
        </div>


        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create a citizen account
          </Link>
        </p>
      </div>
    </main>
  );
}