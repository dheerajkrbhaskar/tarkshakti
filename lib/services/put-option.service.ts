import { getSession } from "../actions/get-session.action";
import { createSupabaseServerClient } from "../db/supabase/server-client";
import { parseDbTimestamp } from "../utils";

type PutOption = {
    userId: string;
    sessionId: string;
    selected_option: string;
    time_taken_s: number;

}
export async function putOption({ userId, sessionId, selected_option, time_taken_s }: PutOption) {
    if (!userId || !sessionId || !selected_option || typeof time_taken_s !== "number" || time_taken_s < 0) {
        throw new Error("Invalid Input")
    }
    const supabase = await createSupabaseServerClient()

    // 1. Fetch session  
    const session = await getSession(sessionId)

    //Check ownership , session_status 
    if (session.user_id !== userId) throw new Error("Unauthorized user")
    if (session.status !== 'active') throw new Error("Session not active")

    //Check expiry
    const now = new Date()
    const expires_at = parseDbTimestamp(session.expires_at)
    const remainingTimeMs = expires_at.getTime() - now.getTime();

    if (remainingTimeMs <= 0) throw new Error("Session Expired")

    const remainingTimeSec = Math.max(Math.floor(remainingTimeMs / 1000), 0);

    // if valid get current_question_index
    const index = session.current_question_index || 0;

    // 2. fetch question_id from session_questions using session_id and order_index,
    const { data: sessionQues, error: sessionQuesError } = await supabase
        .from("session_questions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("order_index", index)
        .single()
    if (sessionQuesError || !sessionQues) throw new Error("Question not found")

    const payload = {
        session_id: sessionId,
        question_id: sessionQues.question_id,
        selected_option,
        time_taken_ms: Math.floor(time_taken_s * 1000),
        answered_at: now.toISOString(),
    };

    // 3. atomic UPSERT(race condtion safe)
    const { error } = await supabase
        .from("session_answers")
        .upsert(payload, {
            onConflict: "session_id,question_id",
        });

    if (error) {
        throw new Error(`failed to upsert answer: ${error.message}`);
    }

    return remainingTimeSec

}