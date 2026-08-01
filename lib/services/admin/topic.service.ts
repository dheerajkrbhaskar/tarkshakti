import { createSupabaseServerClient } from "@/lib/db/supabase/server-client";
import type { Subtopic, Topic } from "@/lib/models/topic.model";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getTopics(): Promise<Topic[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch topics: ${error.message}`);
  }

  return (data ?? []) as Topic[];
}

export async function getSubtopics(
  topicId?: number,
  supabaseClient?: SupabaseServerClient
): Promise<Subtopic[]> {
  const supabase = supabaseClient ?? await createSupabaseServerClient();

  let query = supabase
    .from("subtopics")
    .select("id,name,topic_id")
    .order("name", { ascending: true });

  if (typeof topicId === "number" && Number.isFinite(topicId)) {
    query = query.eq("topic_id", topicId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch subtopics: ${error.message}`);
  }

  return (data ?? []) as Subtopic[];
}
