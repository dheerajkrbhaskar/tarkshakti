//POST api/quiz/session/[sessionId]/put-option when user selects option

import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import { putOption } from "@/lib/services/put-option.service";
import { error } from "console";

function mapPutOptionError(error: unknown): { status: number; message: string } {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Unauthorized user") {
        return { status: 403, message };
    }

    if (message === "Session Not Found") {
        return { status: 404, message };
    }

    if (message === "Session not active") {
        return { status: 409, message };
    }

    if (message === "Session Expired") {
        return { status: 410, message };
    }

    if (message === "Question not found") {
        return { status: 404, message };
    }

    if (message === "Invalid session id" || message === "Invalid Input") {
        return { status: 400, message };
    }

    if (
        message.startsWith("failed to check existing answer:") ||
        message.startsWith("failed to update answer:") ||
        message.startsWith("failed to save answer:")
    ) {
        return { status: 500, message };
    }

    return { status: 500, message };
}


export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient()
        const body = await request.json();
        const { selected_option, time_taken_s } = body ?? {};

        //VALIDATION
        if (typeof selected_option !== "string" || selected_option.length === 0) {
            return Response.json(
                { success: false, error: "Invalid selected_option" },
                { status: 400 }
            );
        }

        if (typeof time_taken_s !== "number" || time_taken_s < 0) {
            return Response.json(
                { success: false, error: "Invalid time_taken_s" },
                { status: 400 }
            );
        }

        const {
            data: { user }, error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401 }
            )
        }

        const { sessionId } = await params;

        if (!sessionId) {
            return Response.json(
                { success: false, error: "Invalid session id" },
                { status: 400 }
            );
        }

        const remainingTime = await putOption({
            userId: user.id,
            sessionId,
            selected_option,
            time_taken_s
        })

        return Response.json({ success: true,data: remainingTime, error:null })

    } catch (error) {
        const mappedError = mapPutOptionError(error);
        console.error("Uploading option failed", { error, mappedError })
        return Response.json(
            { success: false, error: mappedError.message },
            { status: mappedError.status }
        );
    }

}