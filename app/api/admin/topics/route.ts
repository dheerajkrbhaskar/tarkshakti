import { getAdminAuth } from "@/lib/services/admin/auth.service";
import { getTopics } from "@/lib/services/admin/topic.service";

export async function GET() {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized", data: [] }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden", data: [] }, { status: 403 });
    }

    const topics = await getTopics();

    return Response.json({ success: true, data: topics }, { status: 200 });
  } catch (error) {
    console.error("Admin topics fetch failed", error);
    return Response.json({ success: false, error: "Failed to load topics", data: [] }, { status: 500 });
  }
}
