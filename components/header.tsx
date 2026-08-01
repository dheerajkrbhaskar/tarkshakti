


export default function Header() {
  const navigation = [
    { name: "How it works?", href: "/how-it-works" },
    { name: "Features", href: "/features" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header className="w-full flex items-center justify-between px-6 lg:px-16 py-4 border-b border-foreground/10 backdrop-blur-sm sticky top-0 z-50">

      {/* Title */}
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
        <span className="text-accent">Tark</span>
        <span className="text-foreground">shakti</span>
      </h1>

      {/* Nav */}
      {/* <nav>
        <ul className="flex items-center gap-2 sm:gap-4 text-sm  sm:font-medium">
          {navigation.map((item) => (
            <li key={item.name}>
              <a href={item.href} className="hover:text-accent transition">
                {item.name}
              </a>
            </li>
          ))}

        </ul>
      </nav> */}

      {/* CTA */}

      <a
        href="/signin"
        className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-background transition hover:opacity-90"
      >
        Login
      </a>
    </header>
  );
}