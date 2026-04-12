import { createSupabaseServerClient } from "../db/supabase/server-client"
import { parseDbTimestamp } from "../utils";
import { getSession } from "../actions/get-session.action";
import { contentBlocksToText, normalizeContentBlocks, normalizeOptionItems } from "../questions/content";


export async function getCurrentQuestionForSession({ userId, sessionId }: { userId: string, sessionId: string }) {
    if (!sessionId || !userId) throw new Error("Invalid Input")

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


    // if valid get current_question_index
    const index = session.current_question_index || 0;

    // from session_questions fetch question_id using session_id, order_index
    const { data: sessionQues, error: sessionQuesError } = await supabase
        .from("session_questions")
        .select("question_id")
        .eq("session_id", sessionId)
        .eq("order_index", index)
        .single()

    //totalQuestions
    const { count: totalQuestions, error: countError } = await supabase
        .from("session_questions")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)

    if (countError) throw new Error("Failed to fetch total questions")
        
    // const totalQuestions = sessionQues?.length || 0
    if (sessionQuesError || !sessionQues) throw new Error("Question not found")

    //from questions fetch actual ques and selected option using question_id
    const { data: question, error: questionError } = await supabase
        .from("questions")
        .select("title,options")
        .eq("id", sessionQues.question_id)
        .single()

    if (questionError || !question) throw new Error("Question fetch failed")

    const { data: answer, error: answerError } = await supabase
        .from("session_answers")
        .select("selected_option")
        .eq("session_id", sessionId)
        .eq("question_id", sessionQues.question_id)
        .maybeSingle()

    if (answerError) throw new Error("Failed to fetch selected option")

    return {
        question: {
            title: contentBlocksToText(normalizeContentBlocks(question.title)),
            titleBlocks: normalizeContentBlocks(question.title),
            options: normalizeOptionItems(question.options)
        },
        currentIndex: index,
        totalQuestions: totalQuestions ?? 0,
        remainingTime: remainingTimeSec,
        selected_option: typeof answer?.selected_option === "string" ? answer.selected_option : null
    }

}