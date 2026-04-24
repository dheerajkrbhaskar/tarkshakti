import Link from "next/link";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/analytics", label: "Session Analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-64 shrink-0 border-r border-foreground/10 bg-white/5 p-5 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin</p>
          <h1 className="mt-2 text-2xl font-bold">Dashboard</h1>

          <nav className="mt-6 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-foreground/10 px-3 py-2 text-sm text-foreground/80 transition hover:border-accent hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-foreground/10 bg-white/5 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground/70">Admin surface isolated from user app routes</p>
              <Link
                href="/dashboard"
                className="rounded-lg border border-foreground/15 px-3 py-1 text-xs font-semibold text-foreground/70 transition hover:border-accent hover:text-accent"
              >
                Back to User App
              </Link>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
