//POST api/quiz/session/[sessionId]/put-option when user selects option

import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import { putOption } from "@/lib/services/put-option.service";

function mapPutOptionError(error: unknown): { status: number; message: string } {
    const message = error instanceof Error ? error.message : "Internal server error";
    const normalized = message.toLowerCase();

    if (normalized === "unauthorized user") {
        return { status: 403, message };
    }

    if (normalized === "session not found") {
        return { status: 404, message };
    }

    if (normalized === "session not active") {
        return { status: 409, message };
    }

    if (normalized === "session expired") {
        return { status: 410, message };
    }

    if (normalized === "question not found") {
        return { status: 404, message };
    }

    if (message === "Invalid session id" || message === "Invalid Input") {
        return { status: 400, message };
    }

    if (normalized.includes("invalid input syntax for type uuid")) {
        return { status: 400, message: "Invalid selected option value" };
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