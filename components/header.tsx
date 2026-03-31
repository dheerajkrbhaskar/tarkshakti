export default function Header() {
    const navigation = [
        { name: "How it works?", href: "#" },
        { name: "Features", href: "#" },
        { name: "About Us", href: "#" },
    ];
  return (
    <header className="w-full flex items-center justify-between px-6 lg:px-16 py-4 border-b border-foreground/10 sticky top-0 z-50">
      
      {/* Logo */}
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
        <span className="text-accent">Quiz</span>
        <span className="text-foreground">App</span>
      </h1>

      {/* Nav */}
      <nav>
        <ul className="flex items-center gap-2 sm:gap-4 text-sm  sm:font-medium">
          {navigation.map((item) => (
            <li key={item.name}>
              <a href={item.href} className="hover:text-accent transition">
                {item.name}
              </a>
            </li>
          ))}
          
        </ul>
      </nav>

      {/* CTA */}
      <a
        href="/login"
        className=" bg-accent text-background px-3 py-1.5 rounded-md sm:font-medium hover:opacity-90 transition"
      >
        Login
      </a>
    </header>
  );
}