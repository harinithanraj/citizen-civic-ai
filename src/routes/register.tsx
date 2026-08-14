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

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your citizen account — CivicConnect AI" },
      {
        name: "description",
        content: "Register as a citizen to report civic issues and track municipal resolution.",
      },
      { property: "og:title", content: "Create your citizen account — CivicConnect AI" },
      {
        property: "og:description",
        content: "Join CivicConnect AI and help make your neighbourhood better.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Use at least 6 characters").max(72),
  ward: z.string().trim().max(60).optional(),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", ward: "" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/citizen/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name },
        emailRedirectTo: `${window.location.origin}/citizen/dashboard`,
      },
    });
    if (error) {
      setPending(false);
      toast.error(
        error.message.includes("already registered")
          ? "That email already has an account — try signing in."
          : error.message,
      );
      return;
    }
    if (parsed.data.ward) {
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        await supabase
          .from("profiles")
          .update({ ward: parsed.data.ward, name: parsed.data.name })
          .eq("id", session.session.user.id);
      }
    }
    setPending(false);
    toast.success("Account created. Welcome to CivicConnect AI.");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="clay-lg w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Citizens can report issues, track progress and verify fixes.
        </p>

        <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="clay-inset h-12 border-0"
              placeholder="Ananya Rao"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="clay-inset h-12 border-0"
              placeholder="you@city.in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward">Ward or neighbourhood (optional)</Label>
            <Input
              id="ward"
              maxLength={60}
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
              className="clay-inset h-12 border-0"
              placeholder="Ward 12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="clay-inset h-12 border-0"
              placeholder="At least 6 characters"
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}