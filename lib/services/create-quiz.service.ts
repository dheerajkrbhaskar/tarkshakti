import { QuizSizeType } from "../constants";
import { createSupabaseServerClient } from "../db/supabase/server-client";
type RpcCreateQuizSessionResponse = {
    sessionId?: string;
    totalQuestions?: number;
    remainingTime?: number | null;
};

export async function createQuizSession({ quizSize }: { quizSize: QuizSizeType }) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("create_quiz_session", {
        p_quiz_size: quizSize,
    });

    if (error) {
        throw new Error(`createQuizSession failed: ${error.message}`);
    }

    const result = data as RpcCreateQuizSessionResponse | null;
    if (!result?.sessionId) {
        throw new Error("createQuizSession failed: sessionId missing from RPC result");
    }

    return {
        session: { id: result.sessionId },
        totalQuestions: typeof result.totalQuestions === "number" ? result.totalQuestions : 0,
        remainingTime: typeof result.remainingTime === "number" ? result.remainingTime : 0,
    };
}

