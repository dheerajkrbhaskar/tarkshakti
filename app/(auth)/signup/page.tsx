'use client';
import { getSupabaseBrowserClient } from "@/lib/db/supabase/browser-client";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Signup() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success,setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if(loading) return //prevent multiple submits

    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);


    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullname.trim() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signin`
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      console.error('Signup Error:', signUpError);
    } else {
      setSuccess(true)
      // console.log('Signup successful! Data:', data);
     }
    
    
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-3xl border border-foreground/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Sign up</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              Make a new account to start practicing quizzes.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/75" htmlFor="email">
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full rounded-2xl border border-foreground/20 bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/75" htmlFor="email">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-foreground/20 bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/75" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-foreground/20 bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-green-400 text-sm">Check your email to verify your account before signing in.
</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>

            <div className="text-center text-sm">
              <a href="/signin" className="font-medium text-accent hover:text-accent/80">
                Already have an account? Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}