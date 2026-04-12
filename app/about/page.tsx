const values = [
  "Keep the UI simple enough for a student project, but polished enough for a portfolio.",
  "Use real product structure so the app looks maintainable in an interview.",
  "Focus on clarity first, then add features that improve learning and retention.",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground lg:px-16">
      <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            About us
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            A quiz app built to practice well and present well.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/70 sm:text-lg">
            Tarkshakti is a focused learning app for students who want quick practice sessions, simple auth, and a product that still looks like a real SaaS demo.
          </p>
        </div>

        <aside className="rounded-3xl border border-foreground/10 bg-white/5 p-8 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold">What we care about</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-foreground/75">
            {values.map((value) => (
              <li key={value} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}