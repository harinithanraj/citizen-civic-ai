import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/** Complaint photos live in a private bucket, so resolve a short-lived signed URL. */
export function useIssueImageUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    if (path.startsWith("http") || path.startsWith("data:")) {
      setUrl(path);
      return;
    }
    void supabase.storage
      .from("issue-images")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

export function IssueImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = useIssueImageUrl(path);
  if (!url) {
    return (
      <div
        className={cn(
          "clay-inset grid place-items-center text-subtle-foreground",
          className ?? "aspect-video w-full",
        )}
      >
        <ImageOff aria-hidden className="size-6" />
        <span className="sr-only">No photo attached</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className={cn("rounded-3xl object-cover", className ?? "aspect-video w-full")}
    />
  );
}