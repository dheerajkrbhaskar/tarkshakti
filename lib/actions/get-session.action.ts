import { createSupabaseServerClient } from "../db/supabase/server-client"

export async function getSession(sessionId: string|null=null) {
    if (!sessionId) throw new Error("Invalid session id")

    const supabase = await createSupabaseServerClient()
    const { data: session, error: sessionError } = await supabase
        .from("quiz_sessions")
        .select()
        .eq("id", sessionId)
        .single()

    if (sessionError || !session) throw new Error("Session Not Found")

    return session

}