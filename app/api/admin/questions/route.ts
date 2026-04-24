import type { QuestionFilter, QuestionWriteInput } from "@/lib/models/question.model";
import { getAdminAuth } from "@/lib/services/admin/auth.service";
import { createQuestion, getQuestions } from "@/lib/services/admin/question.service";

export async function GET(request: Request) {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized", data: [] }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden", data: [] }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topic_id");
    const subtopicId = searchParams.get("subtopic_id");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const filter: QuestionFilter = {
      topic_id: topicId ? Number(topicId) : undefined,
      subtopic_id: subtopicId ? Number(subtopicId) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };

    const result = await getQuestions(filter);

    return Response.json({ success: true, data: result.rows, total: result.total }, { status: 200 });
  } catch (error) {
    console.error("Admin questions fetch failed", error);
    return Response.json({ success: false, error: "Failed to load questions", data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as QuestionWriteInput;

    if (!body || typeof body.topic_id !== "number" || typeof body.subtopic_id !== "number") {
      return Response.json({ success: false, error: "topic_id and subtopic_id are required" }, { status: 400 });
    }

    const created = await createQuestion(body);

    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Admin question create failed", error);
    return Response.json({ success: false, error: "Failed to create question" }, { status: 500 });
  }
}
