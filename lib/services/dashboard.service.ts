import { createSupabaseServerClient } from "../db/supabase/server-client";

export async function getDashboard(userId: string) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.rpc("get_user_quiz_dashboard",
        { p_user_id: userId })

    if (error) {
        console.error("Quiz history fetch failed", error)
        return []
    }

    return Array.isArray(data) ? data : []

}