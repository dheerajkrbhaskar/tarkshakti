import { getAdminAuth } from "@/lib/services/admin/auth.service";
import { getQuestionImages } from "@/lib/services/admin/question.service";

export async function GET() {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized", data: [] }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden", data: [] }, { status: 403 });
    }

    const rows = await getQuestionImages();

    return Response.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    console.error("Admin images fetch failed", error);
    return Response.json({ success: false, error: "Failed to load question images", data: [] }, { status: 500 });
  }
}