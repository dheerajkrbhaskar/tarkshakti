import { createSupabaseServerClient } from "../db/supabase/server-client"
import { contentBlocksToText, normalizeContentBlocks, normalizeOptionItems } from "../questions/content";

type RpcCurrentQuestionResult = {
    question?: {
        title?: unknown;
        options?: unknown;
    };
    currentIndex?: number;
    totalQuestions?: number;
    remainingTime?: number | null;
    selected_option?: unknown;
};


export async function getCurrentQuestionForSession({ userId, sessionId }: { userId: string, sessionId: string }) {
    if (!sessionId || !userId) throw new Error("Invalid Input")

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.rpc("get_question", {
        p_session_id: sessionId,
    })

    if (error) throw new Error(`Failed to load current question: ${error.message}`)

    const result = data as RpcCurrentQuestionResult | null
    if (!result || !result.question) throw new Error("Question data missing")

    const { question, currentIndex, totalQuestions, remainingTime, selected_option } = result
    let normalizedSelectedOption: string | null
    if (selected_option == null) {
        normalizedSelectedOption = null
    } else if (typeof selected_option === "string") {
        try {
            const parsed = JSON.parse(selected_option)
            normalizedSelectedOption = typeof parsed === "string" ? parsed : JSON.stringify(parsed)
        } catch {
            normalizedSelectedOption = selected_option
        }
    } else {
        normalizedSelectedOption = JSON.stringify(selected_option)
    }

    return {
        question: {
            title: contentBlocksToText(normalizeContentBlocks(question.title)),
            titleBlocks: normalizeContentBlocks(question.title),
            options: normalizeOptionItems(question.options)
        },
        currentIndex: typeof currentIndex === "number" ? currentIndex : 0,
        totalQuestions: totalQuestions ?? 0,
        remainingTime: typeof remainingTime === "number" ? remainingTime : undefined,
        selected_option: normalizedSelectedOption
    }

}