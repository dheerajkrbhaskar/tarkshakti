'use client';
import { getSupabaseBrowserClient } from "@/lib/db/supabase/browser-client";
import { useState } from "react";

export default function Signin() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      console.error('Sign In Error:', signInError);
    } else {
      console.log('Sign In successful! Data:', data);
      window.location.href = '/dashboard';
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-3xl border border-foreground/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Sign in</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              Sign in to continue your quiz practice.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/75" htmlFor="email">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                className="w-full rounded-2xl border border-foreground/20 bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/75" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-foreground/20 bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-foreground/65 transition hover:text-accent">
                Forgot password?
              </a>
              <a href="/signup" className="font-medium text-accent hover:text-accent/80">
                Create account
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}