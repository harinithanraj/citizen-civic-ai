import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/ai.functions";

export const Route = createFileRoute("/citizen/profile")({
  head: () => ({
    meta: [
      { title: "My profile — CivicConnect AI" },
      { name: "description", content: "Update your contact details and ward information." },
      { property: "og:title", content: "My profile — CivicConnect AI" },
      { property: "og:description", content: "Manage your CivicConnect AI citizen profile." },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s]*$/, "Phone can only contain digits, spaces, + and -")
    .optional(),
  ward: z.string().trim().max(60).optional(),
});

function ProfilePage() {
  const { user, profile, isAdmin, refresh } = useAuth();
  const claim = useServerFn(claimFirstAdmin);
  const [form, setForm] = useState({ name: "", phone: "", ward: "" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name ?? "", phone: profile.phone ?? "", ward: profile.ward ?? "" });
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setPending(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        ward: parsed.data.ward || null,
      })
      .eq("id", user.id);
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Profile updated.");
  }

  return (
    <AppShell area="citizen" title="My profile" subtitle="Keep your details current so updates reach you.">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="clay space-y-4 p-6" onSubmit={save} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="clay-inset h-12 border-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email ?? ""} readOnly className="clay-inset h-12 border-0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              inputMode="tel"
              maxLength={20}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="clay-inset h-12 border-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward">Ward or neighbourhood</Label>
            <Input
              id="ward"
              maxLength={60}
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
              className="clay-inset h-12 border-0"
            />
          </div>
          <Button type="submit" size="lg" className="rounded-2xl" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <section className="clay h-fit p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="font-display text-lg font-bold">Municipal access</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as {isAdmin ? "an administrator" : "a citizen"}. If this city has no
            administrator yet, you can claim the first administrator account to set up departments and
            manage complaints.
          </p>
          {!isAdmin ? (
            <Button
              variant="secondary"
              className="mt-5 rounded-2xl"
              onClick={async () => {
                const res = await claim({});
                if (res.granted) {
                  await refresh();
                  toast.success("You're now an administrator.");
                } else {
                  toast.error(res.reason ?? "Administrator access could not be granted.");
                }
              }}
            >
              Claim administrator access
            </Button>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}