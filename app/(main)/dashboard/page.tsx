'use client';
import { useEffect, useState } from "react";
import { BadgeCheck, ChartNoAxesCombined, Clock3, LayoutDashboard, LogOut, Mail, ShieldAlert, Target, Trophy } from "lucide-react";
import { useUserAuth } from "@/contexts/user-auth-context";
import ChooseTopic from "@/components/choose-topic";

type QuizHistory = {
  quiz_id: string;
  started_at: string;
  duration: number;
  correct: number;
  total: number;
  score: number | null;
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateValue?: string | null) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds?: number | null) {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds <= 0) {
    return "-";
  }

  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function formatScore(score?: number | null) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "0%";
  }

  return `${Math.round(score * 100)}%`;
}


export default function Dashboard() {
  const { user, signout } = useUserAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [loading, setLoading] = useState(true)

  const joinedDate = formatDate(user?.created_at);
  const lastActive = formatDateTime(user?.last_sign_in_at);
  const emailVerified = user?.email_confirmed_at ? "Verified" : "Pending";
  const email = user?.email || "Not available";

  const totalAttempts = quizHistory.length;
  const totalQuestions = quizHistory.reduce((sum, quiz) => sum + (quiz.total || 0), 0);
  const totalCorrect = quizHistory.reduce((sum, quiz) => sum + (quiz.correct || 0), 0);
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          (quizHistory.reduce((sum, quiz) => sum + (typeof quiz.score === "number" ? quiz.score : 0), 0) /
            totalAttempts) *
            100
        )
      : 0;
  const bestScore =
    totalAttempts > 0
      ? Math.max(...quizHistory.map((quiz) => (typeof quiz.score === "number" ? quiz.score : 0)))
      : 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalMinutes = Math.round(quizHistory.reduce((sum, quiz) => sum + (quiz.duration || 0), 0) / 60);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard", { method: "GET" });
      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to load quiz history")
      }

      setQuizHistory(Array.isArray(payload?.data) ? payload.data : [])
    } catch (error) {
      console.error("Failed to load dashboard", error)
      setQuizHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-12">
      {menuVisible && <ChooseTopic setMenuVisible={setMenuVisible} />}
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-2xl border border-foreground/10 bg-white/5 px-4 py-3 shadow-sm sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4 text-accent" />
              <p className="text-xl font-semibold tracking-wide">Dashboard</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-background/50 px-3 py-1.5 text-xs">
                <Mail className="h-3.5 w-3.5 text-foreground/70" />
                <span className="max-w-52 truncate text-foreground/85">{email}</span>
                {emailVerified === "Verified" ? (
                  <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
                )}
              </div>

              <button
                onClick={() => signout()}
                aria-label="Sign out"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 transition hover:border-accent hover:text-accent"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-white/5 p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/10 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Performance overview</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">Practice Dashboard</h1>
              <p className="mt-2 text-sm text-foreground/70">Track your attempts and start a fresh quiz.</p>
            </div>

            <div className="sm:text-right">
              <p className="pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">Last active: {lastActive}</p>
  
              <button
                onClick={() => setMenuVisible(true)}
                className="app-btn app-btn-accent"
              >
                Start Practice
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-foreground/10 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Attempts</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-semibold">{totalAttempts}</p>
                <ChartNoAxesCombined className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-1 text-xs text-foreground/60">Joined {joinedDate}</p>
            </article>

            <article className="rounded-2xl border border-foreground/10 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Accuracy</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-semibold">{accuracy}%</p>
                <Target className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-1 text-xs text-foreground/60">{totalCorrect} correct out of {totalQuestions}</p>
            </article>

            <article className="rounded-2xl border border-foreground/10 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Average Score</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-semibold">{avgScore}%</p>
                <Trophy className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-1 text-xs text-foreground/60">Best: {formatScore(bestScore)}</p>
            </article>

            <article className="rounded-2xl border border-foreground/10 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Practice Time</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-semibold">{totalMinutes} min</p>
                <Clock3 className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-1 text-xs text-foreground/60">Across completed sessions</p>
            </article>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent Attempts</h2>
              <p className="text-xs text-foreground/60">Completed sessions only</p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 text-sm text-foreground/70">
                Loading dashboard...
              </div>
            ) : quizHistory.length === 0 ? (
              <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 text-sm text-foreground/70">
                No completed attempts yet. Start your first practice round.
              </div>
            ) : null}

            {quizHistory.length > 0 ? (
              <>
                <div className="space-y-3 md:hidden">
                  {quizHistory.map((quiz, index) => (
                    <article key={quiz.quiz_id} className="rounded-2xl border border-foreground/10 bg-background/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-foreground/60">Attempt #{index + 1}</p>
                          <p className="mt-1 text-sm text-foreground/80">{formatDateTime(quiz.started_at)}</p>
                        </div>
                        <span className="rounded-full border border-foreground/15 px-2.5 py-1 text-xs font-semibold text-accent">
                          {formatScore(quiz.score)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-foreground/75">
                        <div className="rounded-xl border border-foreground/10 px-2 py-2">
                          <p className="text-foreground/55">Correct</p>
                          <p className="mt-1 font-semibold text-foreground">{quiz.correct}/{quiz.total}</p>
                        </div>
                        <div className="rounded-xl border border-foreground/10 px-2 py-2">
                          <p className="text-foreground/55">Duration</p>
                          <p className="mt-1 font-semibold text-foreground">{formatDuration(quiz.duration)}</p>
                        </div>
                        <div className="rounded-xl border border-foreground/10 px-2 py-2">
                          <p className="text-foreground/55">Quiz Ref</p>
                          <p className="mt-1 truncate font-semibold text-foreground">#{quiz.quiz_id.slice(0, 6)}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden overflow-hidden rounded-2xl border border-foreground/10 md:block">
                  <table className="w-full text-left text-sm">
              <thead className="bg-background/60 text-foreground/65">
                <tr>
                  <th className="px-4 py-3 font-semibold">Attempt</th>
                  <th className="px-4 py-3 font-semibold">Start Time</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Correct</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((quiz, index) => (
                  <tr key={quiz.quiz_id} className="border-t border-foreground/10 bg-white/5">
                    <td className="px-4 py-3 font-medium text-foreground">{index + 1}</td>
                    
                    <td className="px-4 py-3 text-foreground/80">{formatDateTime(quiz.started_at)}</td>
                    <td className="px-4 py-3 text-foreground/80">{formatDuration(quiz.duration)}</td>
                    <td className="px-4 py-3 text-foreground/80">{quiz.correct}</td>
                    <td className="px-4 py-3 text-foreground/80">{quiz.total}</td>
                    <td className="px-4 py-3 text-accent">{formatScore(quiz.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}