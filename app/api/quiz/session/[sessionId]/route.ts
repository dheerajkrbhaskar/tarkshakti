// Route for resume, ownership validation, expiry check, and progress.

import { getAttemptedQues } from "@/lib/actions/get-attempted-ques.action";
import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import { getTargetQuestion } from "@/lib/services/get-target-question.service";
import { getCurrentQuestionForSession } from "@/lib/services/load-question.service";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    //1. validate user,check expiry time and fetch currentIdx ques from session_questions
    try {
        const supabase = await createSupabaseServerClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return Response.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { sessionId } = await params;
        // console.log("Session Id", sessionId)


        const result = await getCurrentQuestionForSession({ userId: user.id, sessionId })
        
        //get indices of attempted ques
        const attemptedIndices = await getAttemptedQues(sessionId)



        return Response.json({ success: true, data:{...result, attemptedIndices}, error:null })



    } catch (error) {
        console.error("Loading question failed", error)

        return Response.json(
            { success: false, error: `Failed to load question` },
            { status: 400 }
        );
    }
}


export async function PATCH(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const supabase = await createSupabaseServerClient()
        const { targetQuestionIndex } = await request.json() as { targetQuestionIndex: number }

        if (typeof targetQuestionIndex !== "number" || targetQuestionIndex < 0) {
            return Response.json(
                { success: false, data: null, error: "Invalid Target Question Index" },
                { status: 400 }
            )
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return Response.json(
                { success: false, data: null, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { sessionId } = await params;
        const { question, currentIndex, totalQuestions, remainingTime, selected_option }
            = await getTargetQuestion({ userId: user.id, sessionId, targetQuestionIndex });

        return Response.json(
            {
                success: true,
                data: {
                    sessionId,
                    question,
                    totalQuestions,
                    currentIndex,
                    remainingTime,
                    selected_option,
                },
                error: null,
            },
            { status: 200 }
        )

    } catch (error) {
        console.error("Navigation failed:", error)
        return Response.json(
            { success: false, data: null, error: "Navigation failed" },
            { status: 500 }
        )
    }

}