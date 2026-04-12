const steps = [
  {
    number: "01",
    title: "Pick a topic",
    description: "Choose the quiz area you want to revise, such as VARC, LR, DI, or QA.",
  },
  {
    number: "02",
    title: "Generate the quiz",
    description: "The app builds a session with questions matched to your selected counts.",
  },
  {
    number: "03",
    title: "Answer and review",
    description: "Submit your quiz, check your result, and use the feedback to improve next time.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground lg:px-16">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
          How it works
        </p>
        <div className="mt-4 max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            A short flow from topic selection to result review.
          </h1>
          <p className="text-base leading-7 text-foreground/70 sm:text-lg">
            The experience is kept intentionally direct so students can start practicing quickly without learning a complex system first.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-foreground/10 bg-white/5 p-6 shadow-sm backdrop-blur"
            >
              <span className="text-sm font-semibold tracking-[0.25em] text-accent">
                {step.number}
              </span>
              <h2 className="mt-4 text-xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/70">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}