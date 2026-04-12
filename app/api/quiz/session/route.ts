//This file schedules quiz and create sessionand response with sesionId

import { QuizSizeType } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import { createQuizSession } from "@/lib/services/create-quiz.service";



export async function POST(request: Request) {

    try {
        const { quizSize } = await request.json() as { quizSize: QuizSizeType };
        const supabase = await createSupabaseServerClient();

        if (
            !quizSize ||
            typeof quizSize !== "object" ||
            Object.values(quizSize).some(v => typeof v !== "number" || v < 0)
        ) {
            return Response.json(
                { success: false, error: "Invalid quizSize" },
                { status: 400 }
            );
        }

        const total = Object.values(quizSize).reduce((a, b) => a + b, 0);

        if (total <= 0) {
            return Response.json(
                {
                    success: false,
                    data: null,
                    error: "Select at least one question",
                },
                { status: 400 }
            );
        }
        //auth
        const {
            data: { user }, error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401 }
            )
        }

        const { session, totalQuestions, remainingTime } = await createQuizSession({ userId: user.id, quizSize })

        return new Response(
            JSON.stringify({
                success: true,
                sessionId: session.id,
                totalQuestions,
                remainingTime
            }),
            { status: 200 }
        );

    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate quiz";
        console.error("quiz session creation failed", { error: message })

        const exposeError = process.env.NODE_ENV !== "production";
        return Response.json(
            {
                success: false,
                error: exposeError ? message : 'Failed to generate quiz',
            },
            { status: 500 }
        );
    }
}