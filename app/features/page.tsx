const features = [
  {
    title: "Focused practice",
    description: "Build short quiz sessions around the exact topic you want to revise without extra clutter.",
  },
  {
    title: "Clean auth flow",
    description: "Supabase login and signup are kept simple so the app feels like a real SaaS product.",
  },
  {
    title: "Quiz review",
    description: "Track answers, compare results, and revisit weak areas after each attempt.",
  },
  {
    title: "Scalable structure",
    description: "The app uses route groups and reusable sections so it can grow without becoming messy.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground lg:px-16">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
          Features
        </p>
        <div className="mt-4 max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Small, focused quiz tools that still feel professional.
          </h1>
          <p className="text-base leading-7 text-foreground/70 sm:text-lg">
            This app is intentionally simple, but it is structured like a real product: clear auth, quiz flow, and pages that can grow into a SaaS.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-foreground/10 bg-white/5 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-accent/40"
            >
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/70">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}