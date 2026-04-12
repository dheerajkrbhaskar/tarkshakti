import { attachQuestions, fetchRandomQuestions, scheduleQuiz, startSession } from "../actions/quiz.action";
import { QuizSizeType } from "../constants";
import { parseDbTimestamp } from "../utils";
import { createSupabaseServerClient } from "../db/supabase/server-client";
import { getAttemptedQues } from "../actions/get-attempted-ques.action";



export async function createQuizSession({ userId, quizSize }: { userId: string; quizSize: QuizSizeType }) {
    let quizId: string | null = null
    let sessionId: string | null = null
    try {
        const supabase = await createSupabaseServerClient()

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

        if (profileError) {
            throw new Error(`Profile check failed: ${profileError.message}`);
        }

        if (!profile) {
            throw new Error("Profile missing for authenticated user. Ensure signup trigger inserts into profiles.");
        }

        const totalQuestions = Object.values(quizSize)
            .reduce((a, b) => a + b, 0);
        const duration = totalQuestions * 60 // seconds

        const quiz = await scheduleQuiz("practice", duration);
        quizId = quiz.id
        const session = await startSession(userId, quiz.id, duration);
        sessionId = session.id

        const questions = await fetchRandomQuestions(quizSize);
        if (!questions.length) {
            throw new Error(`Failed to fetch questions for quiz session: no questions returned for quizSize=${JSON.stringify(quizSize)}`);
        }

        await attachQuestions(session.id, questions)


        const now = new Date();
        const expiresAt = parseDbTimestamp(session.expires_at);

        const remainingTime = Math.max(
            Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
            0
        );

        return { quiz, session, totalQuestions, remainingTime };

    } catch (error) {
        await rollbackQuizSession({ quizId, sessionId })
        const message = error instanceof Error ? error.message : "Unknown quiz session creation error";
        throw new Error(`createQuizSession failed: ${message}`);
    }

}

async function rollbackQuizSession({ quizId, sessionId }: { quizId: string | null, sessionId: string | null }) {
    const supabase = await createSupabaseServerClient()

    try {
        if (sessionId) {
            await supabase.from("session_questions").delete().eq("session_id", sessionId);
            await supabase.from("quiz_sessions").delete().eq("id", sessionId)

        }
        if (quizId) {
            await supabase.from("quizzes").delete().eq("id", quizId)
        }
    } catch (error) {
        console.error("Rollback failed", { error, quizId, sessionId })
    }

}

