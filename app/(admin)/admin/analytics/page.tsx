"use client";

import { useEffect, useState } from "react";

type AnalyticsRow = {
  id: string;
  user_id: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  current_question_index: number | null;
  answers_count: number;
};

type AnalyticsPayload = {
  totalSessions: number;
  totalAnswers: number;
  activeSessions: number;
  completedSessions: number;
  rows: AnalyticsRow[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/analytics");
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load analytics");
        }

        setData(payload.data as AnalyticsPayload);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin Analytics</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Session Activity</h1>
        <p className="mt-1 text-sm text-foreground/70">Metrics from quiz_sessions and session_answers.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4 text-sm text-foreground/70">
          Loading analytics...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-foreground/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Total Sessions</p>
              <p className="mt-2 text-2xl font-semibold">{data.totalSessions}</p>
            </article>
            <article className="rounded-2xl border border-foreground/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Total Answers</p>
              <p className="mt-2 text-2xl font-semibold">{data.totalAnswers}</p>
            </article>
            <article className="rounded-2xl border border-foreground/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Active</p>
              <p className="mt-2 text-2xl font-semibold">{data.activeSessions}</p>
            </article>
            <article className="rounded-2xl border border-foreground/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Completed</p>
              <p className="mt-2 text-2xl font-semibold">{data.completedSessions}</p>
            </article>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-foreground/10">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-background/60 text-foreground/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Session ID</th>
                  <th className="px-4 py-3 font-semibold">User ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Started</th>
                  <th className="px-4 py-3 font-semibold">Expires</th>
                  <th className="px-4 py-3 font-semibold">Answers</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.id} className="border-t border-foreground/10 bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.user_id}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{formatDate(row.started_at)}</td>
                    <td className="px-4 py-3">{formatDate(row.expires_at)}</td>
                    <td className="px-4 py-3">{row.answers_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
