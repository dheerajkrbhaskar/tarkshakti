import { createSupabaseServerClient } from "../db/supabase/server-client";

type PutOption = {
    sessionId: string;
    selected_option: string;
    time_taken_s: number;
}

export async function putOption({ sessionId, selected_option, time_taken_s }: PutOption) {
    if (!sessionId || !selected_option || typeof time_taken_s !== "number" || time_taken_s < 0) {
        throw new Error("Invalid Input");
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc('put_option_v2', {
        p_session_id: sessionId,
        p_selected_option: selected_option,
        p_time_taken_s: Math.floor(time_taken_s),
    });

    if (error) {
        throw new Error(error.message || 'Failed to store answer');
    }

    return data as number;
}
