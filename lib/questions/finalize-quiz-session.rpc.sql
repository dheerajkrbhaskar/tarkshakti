-- RPC: finalize_quiz_session
-- Purpose: Atomically finalize a session and return score payload in one transaction.
-- Input: p_session_id uuid
-- Output: jsonb score payload with question_list

DROP FUNCTION IF EXISTS finalize_quiz_session(uuid);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'session_answers'
      AND column_name = 'is_correct'
  ) THEN
    ALTER TABLE public.session_answers
      ADD COLUMN is_correct BOOLEAN;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION finalize_quiz_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_session record;
  v_total_questions integer := 0;
  v_attempted integer := 0;
  v_total_score integer := 0;
  v_question_list jsonb := '[]'::jsonb;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT *
  INTO v_session
  FROM quiz_sessions
  WHERE id = p_session_id
    AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or unauthorized';
  END IF;

  -- Close active session atomically. If already finalized, keep current status.
  IF v_session.status = 'active' THEN
    UPDATE quiz_sessions
    SET status = 'completed'
    WHERE id = p_session_id;
  END IF;

  SELECT count(*)::integer
  INTO v_total_questions
  FROM session_questions sq
  WHERE sq.session_id = p_session_id;

  SELECT
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'order_index', src.order_index,
        'question_title', src.question_title,
        'selected_option', src.selected_option,
        'selected_option_text', src.selected_option_text,
        'correct_option', src.correct_option,
        'correct_option_text', src.correct_option_text,
        'explanation', src.explanation,
        'is_correct', src.computed_is_correct
      )
      ORDER BY src.order_index
    ), '[]'::jsonb),
    COALESCE(sum(CASE WHEN src.selected_option_text IS NOT NULL THEN 1 ELSE 0 END), 0)::integer,
    COALESCE(sum(CASE WHEN src.computed_is_correct THEN 1 ELSE 0 END), 0)::integer
  INTO v_question_list, v_attempted, v_total_score
  FROM (
    SELECT
      sq.order_index,
      q.title AS question_title,
      q.correct_option,
      q.explanation,
      ans.selected_option,
      ans.session_is_correct,
      public.jsonb_to_plain_text(ans.selected_option) AS selected_option_text,
      public.jsonb_to_plain_text(q.correct_option) AS correct_option_text,
      CASE
        WHEN ans.session_is_correct IS NOT NULL THEN ans.session_is_correct
        WHEN public.jsonb_to_plain_text(ans.selected_option) IS NULL THEN false
        ELSE public.jsonb_to_plain_text(ans.selected_option) = public.jsonb_to_plain_text(q.correct_option)
      END AS computed_is_correct
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    LEFT JOIN LATERAL (
      SELECT sa.selected_option, sa.is_correct as session_is_correct
      FROM session_answers sa
      WHERE sa.session_id = p_session_id
        AND sa.question_id = sq.question_id
      ORDER BY sa.answered_at DESC
      LIMIT 1
    ) ans ON true
    WHERE sq.session_id = p_session_id
  ) src;

  UPDATE quiz_sessions
  SET score = v_total_score,
      status = 'completed'
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'session_id', p_session_id,
    'status', 'completed',
    'total_questions', v_total_questions,
    'attempted', v_attempted,
    'total_score', v_total_score,
    'question_list', v_question_list
  );
END;
$$;
