'use client';
import { getSupabaseBrowserClient } from "@/lib/db/supabase/browser-client";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.8S6.8 21.2 12 21.2c6.9 0 9.2-4.8 9.2-7.2 0-.5 0-.9-.1-1.2H12z" />
      <path fill="#34A853" d="M3.7 7.5l3.2 2.3c.9-2.3 2.9-3.8 5.1-3.8 1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4c-3.6 0-6.7 2.1-8.3 5.1z" />
      <path fill="#4A90E2" d="M12 21.2c2.5 0 4.7-.8 6.2-2.3l-2.9-2.3c-.8.6-1.8 1-3.3 1-3.1 0-5.4-2-6.3-4.8l-3.1 2.4c1.6 3.1 4.8 5.1 8.4 5.1z" />
      <path fill="#FBBC05" d="M5.7 12.8c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L2.6 6.6C2 7.8 1.7 9.2 1.7 10.9s.3 3.1.9 4.3l3.1-2.4z" />
    </svg>
  );
}



export default function Signin() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth(
      {
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/callback`,
          skipBrowserRedirect: false
        }

      }
    )
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

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
            <button
              type="button"
              onClick={handleGoogleSignin}
              disabled={loading}
              className="mx-auto mt-4 w-55 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#131314] px-3 py-3 text-sm text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img src="/google.svg" alt="Google" className="h-5 w-5" />
              {loading ? "Redirecting..." : "Continue with Google"}
            </button>
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