import { CATEGORIES, CATEGORY_DEPARTMENT } from "./civic";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

export async function callGateway(
  apiKey: string,
  messages: ChatMessage[],
  options?: { model?: string; jsonOnly?: boolean },
): Promise<string> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options?.model ?? "google/gemini-2.5-flash",
      messages,
      ...(options?.jsonOnly ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI gateway error ${res.status}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

/** Strip obvious personal data before sending citizen text to the model. */
export function redactPii(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/\+?\d[\d\s-]{8,}\d/g, "[phone]")
    .slice(0, 2000);
}

export function parseJsonBlock<T>(raw: string): T | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

export const CLASSIFY_SYSTEM = `You are the classification engine of CivicConnect AI, a municipal civic-issue platform.
Given a citizen photo and description, identify the civic problem.
Allowed categories: ${CATEGORIES.join(", ")}.
Allowed severities: low, medium, high, critical.
Departments: ${[...new Set(Object.values(CATEGORY_DEPARTMENT))].join(", ")}.
Respond ONLY with JSON:
{"category":"...","confidence":0-100,"severity":"...","department":"...","title":"short 3-6 word title","explanation":"2-3 sentences of decision support explaining the severity","summary":"one-line administrator summary"}
You provide decision support only, never a final government decision. Never invent statistics.`;

export function fallbackClassification(description: string) {
  const text = description.toLowerCase();
  const guess =
    CATEGORIES.find((c) => text.includes(c.toLowerCase())) ??
    (text.includes("garbage") || text.includes("trash")
      ? "Garbage"
      : text.includes("light")
        ? "Streetlight"
        : text.includes("water")
          ? "Water Leakage"
          : text.includes("road") || text.includes("hole")
            ? "Pothole"
            : "Other");
  return {
    category: guess,
    confidence: 45,
    severity: "medium" as const,
    department: CATEGORY_DEPARTMENT[guess] ?? "General Municipal Services",
    title: guess,
    explanation:
      "AI analysis was unavailable, so this classification comes from keyword matching only. An administrator should review and correct it.",
    summary: description.slice(0, 120),
    degraded: true,
  };
}