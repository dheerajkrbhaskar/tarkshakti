import { createSupabaseServerClient } from "../db/supabase/server-client";

export async function getAttemptedQues(sessionId: string) {
  if (!sessionId) throw new Error("Invalid session id");

  const supabase = await createSupabaseServerClient();

  // 1. get answered question_ids
  const { data: answers, error: ansError } = await supabase
    .from("session_answers")
    .select("question_id")
    .eq("session_id", sessionId)
    .not("selected_option", "is", null);

  if (ansError) throw new Error("Failed to fetch answers");

  if (!answers || answers.length === 0) return [];

  // 2. map to indices
  const questionIds = answers.map(a => a.question_id);

  const { data: sessionQuestions, error: quesError } = await supabase
    .from("session_questions")
    .select("question_id, order_index")
    .eq("session_id", sessionId)
    .in("question_id", questionIds);

  if (quesError) throw new Error("Failed to map question indices");

  return sessionQuestions.map(q => q.order_index);
}