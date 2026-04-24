import type { QuestionWriteInput } from "@/lib/models/question.model";
import { getAdminAuth } from "@/lib/services/admin/auth.service";
import { deleteQuestion, updateQuestion } from "@/lib/services/admin/question.service";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const questionId = Number(id);

    if (!Number.isFinite(questionId)) {
      return Response.json({ success: false, error: "Invalid question id" }, { status: 400 });
    }

    const body = (await request.json()) as Partial<QuestionWriteInput>;
    const updated = await updateQuestion(questionId, body);

    return Response.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Admin question update failed", error);
    return Response.json({ success: false, error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const questionId = Number(id);

    if (!Number.isFinite(questionId)) {
      return Response.json({ success: false, error: "Invalid question id" }, { status: 400 });
    }

    await deleteQuestion(questionId);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Admin question delete failed", error);
    return Response.json({ success: false, error: "Failed to delete question" }, { status: 500 });
  }
}
