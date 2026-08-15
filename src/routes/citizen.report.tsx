import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Brain,
  Camera,
  Check,
  Crosshair,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/civic/AppShell";
import { MapPanel } from "@/components/civic/MapPanel";
import { PriorityBadge } from "@/components/civic/Clay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { analyzeIssue, type AiClassification } from "@/lib/ai.functions";
import {
  CATEGORIES,
  CATEGORY_DEPARTMENT,
  DEFAULT_CENTER,
  metresBetween,
  textSimilarity,
  type Priority,
} from "@/lib/civic";
import { blobToDataUrl, compressImage } from "@/lib/image";
import { departmentsQuery, issuesQuery, type IssueRow } from "@/lib/issues";

export const Route = createFileRoute("/citizen/report")({
  head: () => ({
    meta: [
      { title: "Report a civic issue — CivicConnect AI" },
      {
        name: "description",
        content: "Upload a photo, pin the location and let AI classify and route your complaint.",
      },
      { property: "og:title", content: "Report a civic issue — CivicConnect AI" },
      {
        property: "og:description",
        content: "One minute to file a complaint that reaches the right department.",
      },
    ],
  }),
  component: ReportPage,
});

const schema = z.object({
  description: z.string().trim().min(15, "Describe the issue in at least 15 characters").max(2000),
  address: z.string().trim().max(300).optional(),
  category: z.string().min(1),
});

function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const runAnalysis = useServerFn(analyzeIssue);
  const { data: departments } = useQuery(departmentsQuery);
  const { data: myIssues } = useQuery(issuesQuery("mine", user?.id));

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [locating, setLocating] = useState(false);
  const [analysis, setAnalysis] = useState<AiClassification | null>(null);
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const objectUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  function pickFile(next: File | null) {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    setFile(next);
    if (next) {
      objectUrl.current = URL.createObjectURL(next);
      setPreview(objectUrl.current);
    } else {
      objectUrl.current = null;
      setPreview(null);
    }
    setAnalysis(null);
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Location isn't available in this browser — drag the map pin instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Location captured. Drag the pin to fine-tune it.");
      },
      () => {
        setLocating(false);
        toast.error("Couldn't read your location. Drag the map pin to the right spot.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function analyze() {
    const parsed = z.string().trim().min(15).max(2000).safeParse(description);
    if (!parsed.success) {
      toast.error("Add a bit more detail (at least 15 characters) before running AI analysis.");
      return;
    }
    setAnalyzing(true);
    try {
      let imageBase64: string | undefined;
      if (file) {
        imageBase64 = await blobToDataUrl(await compressImage(file, 1024, 0.7));
      }
      const result = await runAnalysis({
        data: { description: parsed.data, imageBase64, address: address.trim() || undefined },
      });
      setAnalysis(result);
      setCategory(result.category);
      setPriority(result.severity);
      toast.success("Civi analysed your report.");
    } catch {
      toast.error("AI analysis failed. You can still choose a category and submit.");
    } finally {
      setAnalyzing(false);
    }
  }

  const possibleDuplicates = (myIssues ?? []).filter((i: IssueRow) => {
    if (["resolved", "verified"].includes(i.status)) return false;
    const near =
      i.latitude != null &&
      i.longitude != null &&
      metresBetween(position, { lat: i.latitude, lng: i.longitude }) < 150;
    return near && textSimilarity(i.description, description) > 0.18;
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      description,
      address,
      category: category || analysis?.category || "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the form.");
      return;
    }
    setSubmitting(true);
    try {
      let imagePath: string | null = null;
      if (file) {
        const blob = await compressImage(file);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("issue-images")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (uploadError) throw uploadError;
        imagePath = path;
      }

      const departmentName =
        analysis?.department ?? CATEGORY_DEPARTMENT[parsed.data.category] ?? "General Municipal Services";
      const department = (departments ?? []).find((d) => d.name === departmentName);

      const { data: inserted, error } = await supabase
        .from("issues")
        .insert({
          user_id: user.id,
          title: analysis?.title || parsed.data.category,
          description: parsed.data.description,
          category: parsed.data.category,
          priority,
          status: analysis ? "ai_analyzed" : "reported",
          address: parsed.data.address || null,
          latitude: position.lat,
          longitude: position.lng,
          image_url: imagePath,
          ai_confidence: analysis?.confidence ?? null,
          department_id: department?.id ?? null,
        })
        .select("id, complaint_number")
        .single();
      if (error) throw error;

      if (analysis) {
        await supabase.from("ai_analysis").insert({
          issue_id: inserted.id,
          detected_category: analysis.category,
          confidence: analysis.confidence,
          severity: analysis.severity,
          recommended_department: analysis.department,
          explanation: analysis.explanation,
          summary: analysis.summary,
          duplicate_probability: possibleDuplicates.length ? 0.6 : 0,
        });
      }

      await supabase.from("issue_updates").insert({
        issue_id: inserted.id,
        user_id: user.id,
        status: analysis ? "ai_analyzed" : "reported",
        message: analysis
          ? `Complaint filed and analysed by Civi — routed to ${departmentName}.`
          : "Complaint filed by citizen.",
      });

      if (possibleDuplicates[0]) {
        await supabase.from("duplicate_links").insert({
          issue_id: inserted.id,
          related_issue_id: possibleDuplicates[0].id,
          similarity_score: 0.6,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success(`Complaint ${inserted.complaint_number} filed.`);
      void navigate({ to: "/citizen/issues/$id", params: { id: inserted.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit the complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      area="citizen"
      title="Report an issue"
      subtitle="Add a photo, confirm the location and let Civi handle the classification."
    >
      <form className="grid gap-6 lg:grid-cols-5" onSubmit={submit} noValidate>
        <div className="space-y-6 lg:col-span-3">
          <section className="clay p-6">
            <h2 className="font-display text-lg font-bold">1. Photo of the issue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional, but a photo makes the AI classification far more accurate.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Label
                htmlFor="photo"
                className="clay-inset clay-hover inline-flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-primary"
              >
                <Camera className="size-4" /> {file ? "Change photo" : "Add photo"}
              </Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <Button type="button" variant="ghost" className="rounded-2xl" onClick={() => pickFile(null)}>
                  Remove
                </Button>
              ) : null}
            </div>
            {preview ? (
              <img
                src={preview}
                alt="Preview of the photo you attached"
                className="clay-inset mt-4 aspect-video w-full object-cover"
              />
            ) : null}
          </section>

          <section className="clay p-6">
            <h2 className="font-display text-lg font-bold">2. What's wrong?</h2>
            <div className="mt-4 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                rows={5}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Large pothole across the left lane near the bus stop; two-wheelers are swerving into traffic."
                className="clay-inset border-0"
              />
              <p className="text-xs text-subtle-foreground">{description.length}/2000</p>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="address">Landmark or address (optional)</Label>
              <Input
                id="address"
                maxLength={300}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Opposite 4th Cross, MG Road"
                className="clay-inset h-12 border-0"
              />
            </div>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="mt-5 rounded-2xl"
              onClick={() => void analyze()}
              disabled={analyzing}
            >
              {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Brain className="size-4" />}
              {analyzing ? "Civi is analysing…" : "Analyse with AI"}
            </Button>
          </section>

          <section className="clay p-6">
            <h2 className="font-display text-lg font-bold">3. Where is it?</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={useMyLocation}
                disabled={locating}
              >
                {locating ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
                Use my location
              </Button>
              <p className="text-xs text-subtle-foreground">
                <MapPin className="mr-1 inline size-3.5" />
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)} — tap or drag the pin to adjust
              </p>
            </div>
            <div className="mt-4 h-72 overflow-hidden rounded-3xl">
              <MapPanel
                center={position}
                draggableMarker={position}
                onMarkerMove={setPosition}
                zoom={16}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <section className="clay p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <h2 className="font-display text-lg font-bold">Civi's assessment</h2>
            </div>
            {analysis ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-subtle-foreground uppercase">
                    Detected category
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">{analysis.category}</p>
                  <p className="text-xs text-subtle-foreground">
                    Confidence {analysis.confidence}% · routed to {analysis.department}
                  </p>
                </div>
                <PriorityBadge priority={priority} />
                {analysis.explanation ? (
                  <p className="clay-inset p-4 text-sm text-muted-foreground">{analysis.explanation}</p>
                ) : null}
                {analysis.degraded ? (
                  <p className="text-xs text-warning-foreground">
                    AI service unavailable — this is a keyword-based estimate you can correct below.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Run the analysis and Civi will suggest the category, severity and responsible
                department. You can always override it.
              </p>
            )}

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="clay-inset h-12 border-0">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Severity</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger id="priority" className="clay-inset h-12 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {possibleDuplicates.length ? (
            <section className="clay border border-warning/40 p-6">
              <div className="flex items-center gap-2 text-warning-foreground">
                <TriangleAlert className="size-4" />
                <h2 className="font-display text-base font-bold">Possible duplicate</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                You already have an open report nearby: {possibleDuplicates[0]?.complaint_number} —{" "}
                {possibleDuplicates[0]?.title || possibleDuplicates[0]?.category}. Submitting will
                link them together for the municipal team.
              </p>
            </section>
          ) : null}

          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {submitting ? "Submitting…" : "Submit complaint"}
          </Button>
          <p className="flex items-center gap-2 text-xs text-subtle-foreground">
            <Check className="size-3.5" /> Photos are stored privately and only shared with the
            assigned department.
          </p>
        </aside>
      </form>
    </AppShell>
  );
}