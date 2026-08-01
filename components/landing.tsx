'use client';

import Image from "next/image";
import { useState } from "react";
import ChooseTopic from "@/components/choose-topic";

export default function Landing() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <div className="space-y-24">
      <section id="hero" className="relative overflow-hidden bg-background px-6 py-16 text-foreground lg:px-16 lg:py-20 scroll-mt-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(207,216,109,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,237,223,0.08),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_35%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70 backdrop-blur">
            Practice Aptitude Daily
          </div>

          <div className="space-y-5">
            <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Practice smarter. Improve one topic every day.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-foreground/70 sm:text-lg">
              Tarkshakti gives you short, focused quiz sessions so you can study with clarity, track progress, and stay consistent.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              onClick={() => setMenuVisible(true)}
            >
              Quick Start
            </button>
            <a
              href="#how-it-works"
              className="rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
            >
              How it works
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Clear focus", "Pick topics based on what you need most right now."],
              ["Timed flow", "Practice in realistic conditions without distractions."],
              ["Better revision", "Review mistakes and improve in the next attempt."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-foreground/10 bg-white/5 p-4 backdrop-blur">
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-foreground/65">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-4xl border border-foreground/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-6">
          <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-accent/15 blur-2xl" />
          <div className="absolute -right-6 bottom-8 h-24 w-24 rounded-full bg-foreground/10 blur-2xl" />

          <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-background/60 p-3">
            <Image
              src="/coverImage.svg"
              alt="Quiz Illustration"
              width={900}
              height={900}
              className="h-auto w-full object-contain"
              priority
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-foreground/10 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Focus</p>
              <p className="mt-2 text-sm font-medium">Stay on one topic until it clicks.</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Outcome</p>
              <p className="mt-2 text-sm font-medium">Turn each attempt into a learning step.</p>
            </div>
          </div>
        </div>
      </div>

      {menuVisible && <ChooseTopic setMenuVisible={setMenuVisible} />}
      </section>

      <section id="how-it-works" className="px-6 lg:px-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A clear 3-step flow that is easy to follow.
            </h2>
            <p className="text-base leading-7 text-foreground/70 sm:text-lg">
              Start quickly, practice with focus, and review the result without extra complexity.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Choose your mix", "Select topics and decide how many questions you want in each."],
              ["02", "Take the quiz", "Attempt questions in one focused session with a timer."],
              ["03", "Review results", "See what you got right, find weak spots, and improve next time."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-3xl border border-foreground/10 bg-white/5 p-6 backdrop-blur">
                <span className="text-sm font-semibold tracking-[0.25em] text-accent">{title}</span>
                <p className="mt-3 text-sm leading-6 text-foreground/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 lg:px-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              Features
            </p>
            <p className="text-base leading-7 text-foreground/70 sm:text-lg">
              The platform is intentionally simple, but every part is there to support better preparation.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Topic-based quizzes", "Practice what matters most instead of generic random tests."],
              ["Timed sessions", "Build exam rhythm through focused, time-bound attempts."],
              ["Result review", "Check answers and identify the topics that need revision."],
              ["Distraction control", "Fullscreen and tab-violation rules help you stay concentrated."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-foreground/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-foreground/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-4 lg:px-16 scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              About
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built by a student, for students who want consistency.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/70 sm:text-lg">
              Tarkshakti keeps preparation simple: less confusion, more focused attempts, and a clear path to improve week by week.
            </p>
          </div>

          <aside className="rounded-3xl border border-foreground/10 bg-white/5 p-8 backdrop-blur">
            <h3 className="text-lg font-semibold">What makes it useful</h3>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-foreground/75">
              {[
                "You can start a quiz in seconds without setup headaches.",
                "Sessions are short enough for daily use and serious enough to matter.",
                "Review is built in, so every attempt teaches you something.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}