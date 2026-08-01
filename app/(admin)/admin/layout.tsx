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
        

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-foreground/10 bg-white/5 px-4 py-3 sm:px-6">
              <Link
                href="/dashboard"
                className="rounded-lg border border-foreground/15 px-3 py-1 text-xs font-semibold text-foreground/70 transition hover:border-accent hover:text-accent"
              >
                Back to User App
              </Link>
         
          </header>

          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
