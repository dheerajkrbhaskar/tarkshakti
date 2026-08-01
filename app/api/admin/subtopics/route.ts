import { isAdminEmail } from "@/lib/services/admin/auth.service";
import { getSubtopics } from "@/lib/services/admin/topic.service";
import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json({ success: false, error: "Unauthorized", data: [] }, { status: 401 });
    }

    if (!isAdminEmail(user.email)) {
      return Response.json({ success: false, error: "Forbidden", data: [] }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const topicParam = searchParams.get("topic_id");
    const topicId = topicParam ? Number(topicParam) : undefined;

    const subtopics = await getSubtopics(
      typeof topicId === "number" && !Number.isNaN(topicId) ? topicId : undefined,
      supabase
    );

    return Response.json({ success: true, data: subtopics }, { status: 200 });
  } catch (error) {
    console.error("Admin subtopics fetch failed", error);
    return Response.json({ success: false, error: "Failed to load subtopics", data: [] }, { status: 500 });
  }
}
