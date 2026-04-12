import { createSupabaseServerClient } from "@/lib/db/supabase/server-client"
import { getDashboard } from "@/lib/services/dashboard.service";

export async function GET(request: Request) {
    try {
        const supabase = await createSupabaseServerClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401 }
            )
        }
        const quizHistory = await getDashboard(user.id)

        return Response.json(
            {
                success: true,
                data: Array.isArray(quizHistory) ? quizHistory : [],
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Quiz history loading failed", error)
        return Response.json(
            { success: false, error: 'Failed to load quiz history', data: [] },
            { status: 500 }
        );
    }
}