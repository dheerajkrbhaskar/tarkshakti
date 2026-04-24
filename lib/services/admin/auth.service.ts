import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";

type AdminAuthResult = {
  user: { id: string; email?: string | null };
  isAdmin: boolean;
};

function getAdminAllowlist() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const allowlist = getAdminAllowlist();
  if (allowlist.length === 0) {
    return false;
  }

  return allowlist.includes(email.toLowerCase());
}

export async function getAdminAuth(): Promise<AdminAuthResult | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    isAdmin: isAdminEmail(user.email),
  };
}
