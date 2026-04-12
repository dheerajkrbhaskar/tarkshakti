'use client'
import { useUserAuth } from "@/contexts/user-auth-context";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, signout } = useUserAuth()

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";

  const [fullname, setFullname] = useState(displayName);
  

  const [newFullname, setNewFullname] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullname(displayName);
    setNewFullname(displayName);
  }, [displayName]);

  const joinedDate = formatDate(user?.created_at);
  const lastActive = formatDate(user?.last_sign_in_at);
  const emailVerified = user?.email_confirmed_at ? "Verified" : "Pending";


  async function handleUpdate() {
    try {
      setLoading(true);

      const response = await fetch(`/api/edit-profile`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname:newFullname })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const payload = await response.json();
      const profile = payload?.data;

      if (!profile?.full_name) {
        throw new Error("Invalid profile response");
      }

      setFullname(profile.full_name);
      setNewFullname(profile.full_name);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-foreground/10 bg-white/5 p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Profile</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Update Profile</h1>
            </div>
            <div className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              {emailVerified}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoField label="Email" value={user?.email || "Not available"} />
            <InfoField label="Joined" value={joinedDate} />
            <InfoField label="Last active" value={lastActive} />
            <InfoField label="Status" value={emailVerified} />
          </div>

          <div className="mt-6 space-y-4 border-t border-foreground/10 pt-6">
            <label className="block text-sm font-medium text-foreground/80">
              Full name
              <input
                type="text"
                value={newFullname}
                onChange={(e) => setNewFullname(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-2xl border border-foreground/10 bg-background/60 px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/40 focus:border-accent"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleUpdate}
                disabled={loading || !newFullname.trim()}
                className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating..." : "Save changes"}
              </button>

              <button
                onClick={() => {
                  setNewFullname(fullname);
                }}
                disabled={loading}
                className="rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>

              <button
                onClick={signout}
                className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:border-red-400/40 hover:bg-red-500/15"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">{label}</p>
      <p className="mt-2 wrap-break-word text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}