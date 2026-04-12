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

/*
Dashboard should shows all the quizes attempted and score on click it should that result
*/


//GET route for simple rresult print
export async function GET(
    _request: Request,
    { params }: { params: { sessionId: string } }
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
        const score = await getScore(sessionId,user.id);
        const scoreResult  = Array.isArray(score)?score[0]:score;
        const questions = Array.isArray(scoreResult?.questions)
            ? scoreResult.questions.map((question: Record<string, unknown>) => {
                const selectedOption = question.selectedOption;
                const correctOption = question.correctOption;
                const normalizedIsCorrect = isEquivalentOptionValue(selectedOption, correctOption);

                return {
                    ...question,
                    isCorrect: normalizedIsCorrect,
                    questionTitleText: contentValueToText(question.questionTitle),
                    questionTitleBlocks: normalizeContentBlocks(question.questionTitle),
                    selectedOptionText: contentValueToText(selectedOption),
                    correctOptionText: contentValueToText(correctOption),
                    explanationText: contentValueToText(question.explanation),
                    explanationBlocks: normalizeContentBlocks(question.explanation),
                };
            })
            : [];

        const normalizedTotalScore = questions.reduce((sum, question) => {
            return sum + (question.isCorrect ? 1 : 0);
        }, 0);

        const normalizedAttempted = questions.reduce((sum, question) => {
            return sum + (question.selectedOptionText ? 1 : 0);
        }, 0);

        return Response.json({
            success:true,
            data:{
                ...scoreResult,
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