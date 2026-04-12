//schedule quiz at specified time with specific duration

import { QuizSizeType, TopicRef } from "../constants";
import { createSupabaseServerClient } from "../db/supabase/server-client"

const TOPIC_ID_MAP: Record<TopicRef, number> = {
    di: 1,
    varc: 2,
    lr: 3,
    qa: 4
};

//Add current quiz entry i.e. schedule quiz
export async function scheduleQuiz(type: string, duration: number) {

    const supabase = await createSupabaseServerClient()


    const { data, error } = await supabase
        .from("quizzes")
        .insert({
            type: type,
            duration_seconds: duration,
            start_time: new Date(),
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Quiz entry failed: ${error.message}`)
    }
    return data
}

//start quiz session
export async function startSession(userId: string, quizId: string, duration: number) {

    const supabase = await createSupabaseServerClient()

    const now = new Date()
    const expiry = new Date(now.getTime() + duration * 1000)

    const { data, error } = await supabase
        .from("quiz_sessions")
        .insert({
            user_id: userId,
            quiz_id: quizId,
            status: "active",
            started_at: now.toISOString(),
            expires_at: expiry.toISOString(),

        })
        .select()
        .single();

    if (error) {
        throw new Error(`Quiz session creation failed: ${error.message}`)
    }
    return data;

}

//attach random questions with given quizSize
export async function fetchRandomQuestions(quizSize: QuizSizeType) {
    const supabase = await createSupabaseServerClient()

    const allQuestion: any[] = [];

    for (const topicKey in quizSize) {
        const questionCount = quizSize[topicKey as TopicRef]

        if (!questionCount || questionCount <= 0) continue
        const topicId = TOPIC_ID_MAP[topicKey as TopicRef]

        const { data, error } = await supabase
            .from("questions")
            .select("id")
            .eq("topic_id", topicId);

        if (error) {
            throw new Error(`Question fetch failed for topic ${topicKey}: ${error.message}`);
        }

        if (!data || data.length === 0) {
            continue;
        }

        // Shuffle per-topic and take only requested count.
        const topicQuestions = [...data];
        for (let i = topicQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [topicQuestions[i], topicQuestions[j]] = [topicQuestions[j], topicQuestions[i]];
        }

        allQuestion.push(...topicQuestions.slice(0, questionCount));
    }

    for (let i = allQuestion.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestion[i], allQuestion[j]] = [allQuestion[j], allQuestion[i]];
    }

    return allQuestion
    //ORDER BY random() or Math.random()

}

//insert into session_questions with given sessionId
export async function attachQuestions(sessionId: string, questions: any[]) {
    const supabase = await createSupabaseServerClient()

    if (!questions.length) {
        throw new Error("No questions to attach")
    }

    const payload = questions.map((q, index) => ({
        session_id: sessionId,
        question_id: q.id,
        order_index: index,
    }));

    const { error } = await supabase.from("session_questions").insert(payload)
    if (error) throw error
}