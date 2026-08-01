import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import type { Question, QuestionFilter, QuestionWriteInput } from "@/lib/models/question.model";
import { parseJsonInput } from "@/lib/models/question.model";
import { contentValueToText, normalizeContentBlocks } from "@/lib/questions/content";



function normalizeQuestionInput(input: QuestionWriteInput) {
  return {
    title: parseJsonInput(input.title),
    options: parseJsonInput(input.options),
    correct_option: parseJsonInput(input.correct_option),
    explanation: parseJsonInput(input.explanation ?? []),
    difficulty: typeof input.difficulty === "number" ? input.difficulty : 1,
    topic_id: input.topic_id,
    subtopic_id: input.subtopic_id,
  };
}

export async function getQuestions(filter: QuestionFilter = {}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("questions")
    .select("id,title,options,correct_option,explanation,difficulty,topic_id,subtopic_id", {
      count: "exact",
    })
    .order("id", { ascending: false });

  if (typeof filter.topic_id === "number") {
    query = query.eq("topic_id", filter.topic_id);
  }

  if (typeof filter.subtopic_id === "number") {
    query = query.eq("subtopic_id", filter.subtopic_id);
  }

  const limit = Math.max(1, Math.min(filter.limit ?? 100, 500));
  const offset = Math.max(0, filter.offset ?? 0);
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return {
    rows: (data ?? []) as Question[],
    total: count ?? 0,
  };
}

export async function createQuestion(data: QuestionWriteInput) {
  const supabase = await createSupabaseServerClient();
  const payload = normalizeQuestionInput(data);

  const { data: inserted, error } = await supabase
    .from("questions")
    .insert(payload)
    .select("id,title,options,correct_option,explanation,difficulty,topic_id,subtopic_id")
    .single();

  if (error) {
    throw new Error(`Failed to create question: ${error.message}`);
  }

  return inserted as Question;
}

export async function updateQuestion(id: number, data: Partial<QuestionWriteInput>) {
  const supabase = await createSupabaseServerClient();

  const payload: Record<string, any> = {};

  if (data.title !== undefined) payload.title = parseJsonInput(data.title);
  if (data.options !== undefined) payload.options = parseJsonInput(data.options);
  if (data.correct_option !== undefined) payload.correct_option = parseJsonInput(data.correct_option);
  if (data.explanation !== undefined) payload.explanation = parseJsonInput(data.explanation);
  if (data.difficulty !== undefined) payload.difficulty = data.difficulty;
  if (data.topic_id !== undefined) payload.topic_id = data.topic_id;
  if (data.subtopic_id !== undefined) payload.subtopic_id = data.subtopic_id;

  const { data: updated, error } = await supabase
    .from("questions")
    .update(payload)
    .eq("id", id)
    .select("id,title,options,correct_option,explanation,difficulty,topic_id,subtopic_id")
    .single();

  if (error) {
    throw new Error(`Failed to update question: ${error.message}`);
  }

  return updated as Question;
}

export async function deleteQuestion(id: number) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete question: ${error.message}`);
  }

  return true;
}

export async function getSessionAnalytics() {
  const supabase = await createSupabaseServerClient();

  const [{ data: sessions, error: sessionsError }, { data: answers, error: answersError }] = await Promise.all([
    supabase
      .from("quiz_sessions")
      .select("id,user_id,status,started_at,expires_at,current_question_index")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase.from("session_answers").select("id,session_id,selected_option,time_taken_ms,answered_at").limit(2000),
  ]);

  if (sessionsError) {
    throw new Error(`Failed to fetch session analytics: ${sessionsError.message}`);
  }

  if (answersError) {
    throw new Error(`Failed to fetch answer analytics: ${answersError.message}`);
  }

  const bySession = new Map<string, number>();
  for (const answer of answers ?? []) {
    const key = answer.session_id;
    bySession.set(key, (bySession.get(key) ?? 0) + 1);
  }

  const rows = (sessions ?? []).map((session) => ({
    ...session,
    answers_count: bySession.get(session.id) ?? 0,
  }));

  return {
    totalSessions: rows.length,
    totalAnswers: (answers ?? []).length,
    activeSessions: rows.filter((row) => row.status === "active").length,
    completedSessions: rows.filter((row) => row.status !== "active").length,
    rows,
  };
}




export type QuestionImageRow = {
  question_id: number;
  question_title: string;
  image_url: string;
  source: "title" | "options" | "correct_option" | "explanation";
};

function normalizeImageUrl(raw: string) {
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    return raw;
  }
  return `/${raw}`;
}

function extractImages(
  value: unknown,
  source: "title" | "options" | "correct_option" | "explanation"
) {
  return normalizeContentBlocks(value)
    .filter((block) => block.type === "image" && block.value?.trim().length > 0)
    .map((block) => ({
      image_url: normalizeImageUrl(block.value.trim()),
      source,
    }));
}

export async function getQuestionImages() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select("id,title,options,correct_option,explanation")
    .order("id", { ascending: false });


  if (error) {
    throw new Error(`Failed to fetch question images: ${error.message}`);
  }

  const rows: QuestionImageRow[] = [];

  for (const question of data ?? []) {
    const questionTitle =
      contentValueToText(question.title).trim() ||
      `Question #${question.id}`;

    const imageItems = [
      ...extractImages(question.title, "title"),
      ...extractImages(question.options, "options"),
      ...extractImages(question.correct_option, "correct_option"),
      ...extractImages(question.explanation, "explanation"),
    ];

    for (const image of imageItems) {
      rows.push({
        question_id: question.id,
        question_title: questionTitle,
        image_url: image.image_url,
        source: image.source,
      });
    }
  }

  return rows;
}

type MappingRow = {
  oldName: string;
  newUrl: string;
};

// Updated backend mapping function
export async function getImageMappingTable(): Promise<MappingRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("image_map")
    .select("old_name, new_url")
    .order("old_name", { ascending: false });  // Change from 'id' to 'old_name'

  if (error) {
    throw new Error(`Failed to fetch mapping table: ${error.message}`);
  }

  return data.map((item) => ({
    oldName: item.old_name,
    newUrl: item.new_url,
  }));
}