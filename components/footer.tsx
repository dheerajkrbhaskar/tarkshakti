export default function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-background/80 px-6 lg:px-16 py-10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            <span className="text-accent">Tark</span>
            <span className="text-foreground">shakti</span>
          </h2>
          <p className="text-sm leading-6 text-foreground/70">
            A focused quiz platform for sharper practice, stronger consistency, and meaningful score improvement.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li>
                <a href="#hero" className="hover:text-accent transition">Home</a>
              </li>
              <li>
                <a href="#features" className="hover:text-accent transition">Features</a>
              </li>
              <li>
                <a href="#about" className="hover:text-accent transition">About</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Learn
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li>
                <a href="#how-it-works" className="hover:text-accent transition">How it works</a>
              </li>
              <li>
                <a href="/signup" className="hover:text-accent transition">Create account</a>
              </li>
              <li>
                <a href="/signin" className="hover:text-accent transition">Sign in</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-foreground/10 pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Tarkshakti. Built for focused practice.</p>
        <p>Practice daily. Improve weekly.</p>
      </div>
    </footer>
  );
}