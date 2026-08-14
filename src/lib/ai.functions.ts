import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AiClassification = {
  category: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  department: string;
  title: string;
  explanation: string;
  summary: string;
  degraded?: boolean;
};

export const analyzeIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        description: z.string().trim().min(5).max(2000),
        imageBase64: z.string().max(9_000_000).optional(),
        address: z.string().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<AiClassification> => {
    const { callGateway, redactPii, parseJsonBlock, CLASSIFY_SYSTEM, fallbackClassification } =
      await import("./ai.server");
    const { CATEGORY_DEPARTMENT } = await import("./civic");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return fallbackClassification(data.description);

    const userContent: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: `Citizen description: ${redactPii(data.description)}\nReported location: ${data.address ?? "unknown"}`,
      },
    ];
    if (data.imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: data.imageBase64 } });
    }

    try {
      const raw = await callGateway(
        apiKey,
        [
          { role: "system", content: CLASSIFY_SYSTEM },
          { role: "user", content: userContent },
        ],
        { jsonOnly: true },
      );
      const parsed = parseJsonBlock<AiClassification>(raw);
      if (!parsed?.category) return fallbackClassification(data.description);
      const severities = ["low", "medium", "high", "critical"] as const;
      return {
        category: parsed.category,
        confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 60))),
        severity: severities.includes(parsed.severity) ? parsed.severity : "medium",
        department:
          parsed.department || CATEGORY_DEPARTMENT[parsed.category] || "General Municipal Services",
        title: parsed.title || parsed.category,
        explanation: parsed.explanation ?? "",
        summary: parsed.summary ?? "",
      };
    } catch {
      return fallbackClassification(data.description);
    }
  });

export const askCivi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string().trim().min(2).max(600),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
          .max(10)
          .optional(),
        isAdmin: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ answer: string }> => {
    const { callGateway, redactPii } = await import("./ai.server");
    const apiKey = process.env["LOVABLE_API_KEY"];

    // Context is limited to rows the caller may read (RLS applies).
    const { data: issues } = await context.supabase
      .from("issues")
      .select("complaint_number, title, category, priority, status, address, created_at")
      .order("created_at", { ascending: false })
      .limit(60);

    const factSheet =
      (issues ?? [])
        .map(
          (i) =>
            `${i.complaint_number} | ${i.title || i.category} | ${i.category} | ${i.priority} | ${i.status} | ${i.address ?? "no address"} | ${new Date(i.created_at).toISOString().slice(0, 10)}`,
        )
        .join("\n") || "No complaints are visible for this account yet.";

    if (!apiKey) {
      return {
        answer:
          "I can't reach the AI service right now. You can still browse your complaints from the dashboard — status updates keep working.",
      };
    }

    try {
      const answer = await callGateway(apiKey, [
        {
          role: "system",
          content: `You are Civi, the assistant inside CivicConnect AI, ${
            data.isAdmin ? "speaking to a municipal administrator" : "speaking to a citizen"
          }.
Answer only from the COMPLAINT DATA below plus general guidance about how the platform works.
Never invent complaint numbers, statuses, wards or statistics. If the data does not contain the answer, say so plainly.
Keep answers under 120 words, warm and concrete.

COMPLAINT DATA (id | title | category | priority | status | address | date):
${factSheet}`,
        },
        ...(data.history ?? []).map((m) => ({ role: m.role, content: m.content }) as const),
        { role: "user", content: redactPii(data.question) },
      ]);
      return { answer: answer || "I couldn't produce an answer just now — please try rephrasing." };
    } catch {
      return {
        answer:
          "The AI assistant is temporarily unavailable. Everything else in CivicConnect keeps working — try again in a moment.",
      };
    }
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ granted: boolean; reason?: string }> => {
    const { count } = await context.supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      return { granted: false, reason: "An administrator already exists for this city." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) return { granted: false, reason: error.message };
    return { granted: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), makeAdmin: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean; reason?: string }> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false, reason: "Forbidden" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) return { ok: false, reason: error.message };
      return { ok: true };
    }
    if (data.userId === context.userId) {
      return { ok: false, reason: "You cannot remove your own administrator access." };
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  });