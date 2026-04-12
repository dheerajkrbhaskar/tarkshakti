//PUT request api/quiz/session/[sessionId]/score
/*
1. put request
triggered by 1. submit button, 2. timeout 3.suspicion_score exceeded(future work)
request for end of quiz_session(status = closed,cheating, timeout)
returns quizId, quiz time, duration, question.title, your ans, correct ans,+1, explanation,time taken, total_score

*/

import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import { contentValueToText, isEquivalentOptionValue, normalizeContentBlocks } from "@/lib/questions/content";
import { getScore } from "@/lib/services/scoring.service";

type RawScoreQuestion = Record<string, unknown>;
type NormalizedScoreQuestion = RawScoreQuestion & {
    isCorrect: boolean;
    selectedOption: unknown;
};

function parseMaybeJson(value: unknown): unknown {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
}

function getRawQuestions(scoreResult: Record<string, unknown> | null): RawScoreQuestion[] {
    if (!scoreResult) return [];

    const source = scoreResult.questions ?? scoreResult.question_list;
    const parsed = parseMaybeJson(source);

    return Array.isArray(parsed)
        ? parsed.filter((item): item is RawScoreQuestion => Boolean(item && typeof item === "object"))
        : [];
}

function hasAnswerValue(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
}

/*
Dashboard should shows all the quizes attempted and score on click it should that result
*/


//GET route for simple rresult print
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return Response.json(
                { success: false, error: "Unauthorized" },
                { status: 401 })
        }
        const {sessionId} = await params;
        const score = await getScore(sessionId);
        const scoreResult = (Array.isArray(score) ? score[0] : score) as Record<string, unknown> | null;
        const rawQuestions = getRawQuestions(scoreResult);

        const questions: NormalizedScoreQuestion[] = rawQuestions
            .map((question: RawScoreQuestion, index: number) => {
                const selectedOption = question.selectedOption ?? question.selected_option;
                const correctOption = question.correctOption ?? question.correct_option;
                const questionTitle = question.questionTitle ?? question.question_title;
                const explanation = question.explanation;
                const orderIndex = typeof question.orderIndex === "number"
                    ? question.orderIndex
                    : typeof question.order_index === "number"
                        ? question.order_index
                        : index;
                const normalizedIsCorrect = isEquivalentOptionValue(selectedOption, correctOption);

                return {
                    ...question,
                    orderIndex,
                    selectedOption,
                    correctOption,
                    questionTitle,
                    explanation,
                    isCorrect: normalizedIsCorrect,
                    questionTitleText: contentValueToText(questionTitle),
                    questionTitleBlocks: normalizeContentBlocks(questionTitle),
                    selectedOptionText: contentValueToText(selectedOption),
                    correctOptionText: contentValueToText(correctOption),
                    explanationText: contentValueToText(explanation),
                    explanationBlocks: normalizeContentBlocks(explanation),
                };
            });

        const normalizedTotalScore = questions.reduce((sum: number, question: NormalizedScoreQuestion) => {
            return sum + (question.isCorrect ? 1 : 0);
        }, 0);

        const normalizedAttempted = questions.reduce((sum: number, question: NormalizedScoreQuestion) => {
            return sum + (hasAnswerValue(question.selectedOption) ? 1 : 0);
        }, 0);

        const totalQuestions = Number(scoreResult?.total_questions ?? scoreResult?.totalQuestions);
        const normalizedTotalQuestions = Number.isFinite(totalQuestions) && totalQuestions >= 0
            ? Math.max(totalQuestions, questions.length)
            : questions.length;

        return Response.json({
            success:true,
            data:{
                ...scoreResult,
                total_questions: normalizedTotalQuestions,
                total_score: normalizedTotalScore,
                attempted: normalizedAttempted,
                questions,
            },
            error:null
        },{status:200})

    } catch (error) {
        console.error("Loading question failed", error)
        return Response.json(
            {success:false, error:`Failed to load question`},
            {status:400}
        )

    }

}