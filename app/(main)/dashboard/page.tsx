'use client';
import { useEffect, useState } from "react";
import { BadgeCheck, LayoutDashboard, LogOut, Mail, ShieldAlert } from "lucide-react";
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


export default function Dashboard() {
  const { user, signout } = useUserAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [loading, setLoading] = useState(true)

  const joinedDate = formatDate(user?.created_at);
  const lastActive = formatDateTime(user?.last_sign_in_at);
  const emailVerified = user?.email_confirmed_at ? "Verified" : "Pending";
  const email = user?.email || "Not available";

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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground lg:px-16">
      {menuVisible && <ChooseTopic setMenuVisible={setMenuVisible} />}
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-2xl border border-foreground/10 bg-white/5 px-4 py-3 shadow-sm">
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

        <section className="rounded-3xl border border-foreground/10 bg-white/5 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Main</p> */}
              {/* <h1 className="mt-2 text-2xl font-bold tracking-tight">Practice Dashboard</h1> */}
              <p className="mt-2 text-sm text-foreground/70">Track your attempts and start a fresh quiz.</p>
            </div>

            <div className="text-right">
              <p className="text-xs pb-5 font-semibold uppercase tracking-[0.18em] text-foreground/55">Last active: {lastActive}</p>
  
              <button
                onClick={() => setMenuVisible(true)}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Start Practice
              </button>
            </div>
          </div>


          <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-background/60 text-foreground/65">
                <tr>
                  <th className="px-4 py-3 font-semibold">Quiz ID</th>
                  <th className="px-4 py-3 font-semibold">Start Time</th>
                  <th className="px-4 py-3 font-semibold">Duration(min)</th>
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
                    <td className="px-4 py-3 text-foreground/80">{quiz.duration/60}</td>
                    <td className="px-4 py-3 text-foreground/80">{quiz.correct}</td>
                    <td className="px-4 py-3 text-foreground/80">{quiz.total}</td>
                    <td className="px-4 py-3 text-accent">{quiz.score ? Math.round(quiz.score * 100) + "%" : "0%"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}