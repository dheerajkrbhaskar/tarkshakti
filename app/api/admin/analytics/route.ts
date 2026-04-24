import { getAdminAuth } from "@/lib/services/admin/auth.service";
import { getSessionAnalytics } from "@/lib/services/admin/question.service";

export async function GET() {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized", data: null }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden", data: null }, { status: 403 });
    }

    const analytics = await getSessionAnalytics();

    return Response.json({ success: true, data: analytics }, { status: 200 });
  } catch (error) {
    console.error("Admin analytics fetch failed", error);
    return Response.json({ success: false, error: "Failed to load analytics", data: null }, { status: 500 });
  }
}
