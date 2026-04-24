import Link from "next/link";

const cards = [
  {
    title: "Question Management",
    description: "Filter, create, edit, and delete questions with JSONB-aware forms and image blocks.",
    href: "/admin/questions",
  },
  {
    title: "Session Analytics",
    description: "Inspect session and answer activity from quiz_sessions and session_answers.",
    href: "/admin/analytics",
  },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin Home</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="mt-2 text-sm text-foreground/70">
          This area is isolated from student-facing pages and backed by admin-only APIs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-foreground/10 bg-white/5 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{card.description}</p>
            <Link
              href={card.href}
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Open
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
