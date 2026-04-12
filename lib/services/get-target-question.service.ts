import { createSupabaseServerClient } from "../db/supabase/server-client"
import { parseDbTimestamp } from "../utils";
import { getSession } from "../actions/get-session.action";
import { contentBlocksToText, normalizeContentBlocks, normalizeOptionItems } from "../questions/content";


export async function getTargetQuestion(
    { userId, sessionId, targetQuestionIndex }:
        { userId: string, sessionId: string, targetQuestionIndex: number }
) {
    if (!sessionId || !userId || targetQuestionIndex == null) throw new Error("Invalid Input")

    const supabase = await createSupabaseServerClient()

    //from quiz_session get get session using id
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
    // console.log("Time Remaining: ", remainingTimeSec)


   

    //totalQuestions
    const { count: totalQuestions, error: countError } = await supabase
        .from("session_questions")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)

    if (countError) throw new Error("Failed to fetch total questions")


    if (totalQuestions && targetQuestionIndex >= totalQuestions)
        throw new Error("targetQuestionIndex out of bounds")

    // from session_questions fetch question_id using session_id, targetQuestionIndex
    const { data: sessionQues, error: sessionQuesError } = await supabase
        .from("session_questions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("order_index", targetQuestionIndex)
        .single()

    if (sessionQuesError || !sessionQues) throw new Error("Question not found")

    //from questions fetch actual ques using question_id
    const { data: question, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("id", sessionQues.question_id)
        .single()

    if (questionError || !question) throw new Error("Question fetch failed")

    //fetch selected option
    const { data: answer, error: answerError } = await supabase
        .from("session_answers")
        .select("selected_option")
        .eq("session_id", sessionId)
        .eq("question_id", sessionQues.question_id)
        .maybeSingle()

    if (answerError) throw new Error("Failed to fetch selected option")

    //update current_index_index in quiz_sessions

    const { error: updateError } = await supabase
        .from("quiz_sessions")
        .update({ current_question_index: targetQuestionIndex })
        .eq("id", sessionId)

    if (updateError) {
        throw new Error(`failed to update answer: ${updateError.message}`)
    }

    return {
        question: {
            title: contentBlocksToText(normalizeContentBlocks(question.title)),
            titleBlocks: normalizeContentBlocks(question.title),
            options: normalizeOptionItems(question.options)
        },
        currentIndex: targetQuestionIndex,
        totalQuestions: totalQuestions ?? 0,
        remainingTime: remainingTimeSec,
        selected_option: typeof answer?.selected_option === "string" ? answer.selected_option : null
    }

}