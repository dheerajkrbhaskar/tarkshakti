import { createSupabaseServerClient } from "../db/supabase/server-client"

export async function getScore(sessionId: string, userId:string) {
    if (!sessionId || !userId) throw new Error("Invalid session id")

    const supabase = await createSupabaseServerClient()

    const { data: score, error: scoreError } = await supabase.rpc('get_quiz_score', { p_session_id: sessionId, p_user_id:userId })

    if (scoreError || score === null) {
        console.error("Loading question failed", scoreError)
        throw new Error("Score fetching failed from db")
    }
    // console.log(score)
    return score;
}