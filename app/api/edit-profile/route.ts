import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import { editProfile } from "@/lib/services/edit-profile.service";

export async function PATCH(request: Request) {
  try {
    const { fullname } = await request.json() as { fullname: string };

    if (!fullname) {
      return Response.json(
        { success: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const profile = await editProfile({
      userId: user.id,
      newFullname: fullname,
    });

    return Response.json(
      { success: true, data:profile },
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile update error:", error);

    return Response.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}