import { createSupabaseServerClient } from "../db/supabase/server-client"

export async function getScore(sessionId: string) {
    if (!sessionId) throw new Error("Invalid session id")

    const supabase = await createSupabaseServerClient()

    const { data: score, error: scoreError } = await supabase.rpc('finalize_quiz_session', { p_session_id: sessionId })

    if (scoreError || score === null) {
        console.error("Loading question failed", scoreError)
        throw new Error("Score fetching failed from db")
    }
    // console.log(score)
    return score;
}