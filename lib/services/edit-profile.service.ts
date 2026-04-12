
import { createSupabaseServerClient } from "../db/supabase/server-client";


type EditProfile = {
    userId: string;
    newFullname: string;
}

export async function editProfile({ userId, newFullname }: EditProfile) {
    if (!userId || !newFullname) throw new Error("userId and newFullname are required")

    const supabase = await createSupabaseServerClient()
    const { data: profile, error } = await supabase
        .from("profiles")
        .update({ full_name: newFullname })
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return profile;
}