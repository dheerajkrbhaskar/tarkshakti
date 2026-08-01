"use client";

import { useEffect, useMemo, useState } from "react";

type ImageRow = {
  question_id: number;
  question_title: string;
  image_url: string;
  source: "title" | "options" | "explanation";
};

type ApiResponse = {
  success: boolean;
  data?: ImageRow[];
  error?: string;
};

export default function AdminImagesPage() {
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/images");
        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load images");
        }

        setRows(Array.isArray(payload.data) ? payload.data : []);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load images");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    void loadImages();
  }, []);

  const sourceStats = useMemo(() => {
    return {
      total: rows.length,
      title: rows.filter((row) => row.source === "title").length,
      options: rows.filter((row) => row.source === "options").length,
      explanation: rows.filter((row) => row.source === "explanation").length,
    };
  }, [rows]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-foreground/10 bg-white/5 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin Images</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">See All Images</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Every question image with URL and attached question name.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Total Images</p>
            <p className="mt-1 text-xl font-semibold">{sourceStats.total}</p>
          </article>
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Title Images</p>
            <p className="mt-1 text-xl font-semibold">{sourceStats.title}</p>
          </article>
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Option Images</p>
            <p className="mt-1 text-xl font-semibold">{sourceStats.options}</p>
          </article>
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Explanation Images</p>
            <p className="mt-1 text-xl font-semibold">{sourceStats.explanation}</p>
          </article>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-foreground/10 bg-white/5 p-4 text-sm text-foreground/70">Loading images...</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-white/5 p-4 text-sm text-foreground/70">No images found in the question bank.</div>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row, index) => (
            <article key={`${row.question_id}-${row.image_url}-${index}`} className="rounded-2xl border border-foreground/10 bg-white/5 p-3 shadow-sm">
              <div className="rounded-xl border border-foreground/10 bg-background/40 p-2">
                <img
                  src={row.image_url}
                  alt={row.question_title}
                  className="h-44 w-full rounded-lg object-contain"
                />
              </div>

              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-foreground/60">Attached Question</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium">{row.question_title}</p>

              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-foreground/60">Source</p>
              <p className="mt-1 text-sm font-medium capitalize">{row.source}</p>

              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-foreground/60">Image URL</p>
              <a
                href={row.image_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-sm text-accent underline-offset-2 hover:underline"
                title={row.image_url}
              >
                {row.image_url}
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}