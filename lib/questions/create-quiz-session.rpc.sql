-- RPC: create_quiz_session
-- Purpose: Create quiz + active session + randomized session_questions atomically.
-- Input: p_quiz_size jsonb, e.g. {"varc": 5, "di": 5, "lr": 5, "qa": 5}
-- Output: { sessionId, totalQuestions, remainingTime }

DROP FUNCTION IF EXISTS create_quiz_session(jsonb);

CREATE OR REPLACE FUNCTION create_quiz_session(p_quiz_size jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_quiz_id uuid;
  v_session_id uuid;
  v_now timestamp := now();
  v_expires_at timestamp;
  v_duration_seconds integer;
  v_total_requested integer;
  v_total_attached integer;
  v_remaining_time integer;
  v_varc integer := COALESCE((p_quiz_size ->> 'varc')::integer, 0);
  v_di integer := COALESCE((p_quiz_size ->> 'di')::integer, 0);
  v_lr integer := COALESCE((p_quiz_size ->> 'lr')::integer, 0);
  v_qa integer := COALESCE((p_quiz_size ->> 'qa')::integer, 0);
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_quiz_size IS NULL THEN
    RAISE EXCEPTION 'Invalid quiz size';
  END IF;

  IF v_varc < 0 OR v_di < 0 OR v_lr < 0 OR v_qa < 0 THEN
    RAISE EXCEPTION 'Invalid quiz size';
  END IF;

  v_total_requested := v_varc + v_di + v_lr + v_qa;

  IF v_total_requested <= 0 THEN
    RAISE EXCEPTION 'Select at least one question';
  END IF;

  -- Ensure profile exists for authenticated user.
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = v_user_id) THEN
    RAISE EXCEPTION 'Profile missing for authenticated user';
  END IF;

  v_duration_seconds := v_total_requested * 60;

  INSERT INTO quizzes (type, start_time, duration_seconds)
  VALUES ('practice', v_now, v_duration_seconds)
  RETURNING id INTO v_quiz_id;

  v_expires_at := v_now + make_interval(secs => v_duration_seconds);

  INSERT INTO quiz_sessions (user_id, quiz_id, status, started_at, expires_at, current_question_index)
  VALUES (v_user_id, v_quiz_id, 'active', v_now, v_expires_at, 0)
  RETURNING id INTO v_session_id;

  CREATE TEMP TABLE tmp_selected_questions (question_id integer) ON COMMIT DROP;

  INSERT INTO tmp_selected_questions (question_id)
  SELECT id FROM questions WHERE topic_id = 2 ORDER BY random() LIMIT v_varc;

  INSERT INTO tmp_selected_questions (question_id)
  SELECT id FROM questions WHERE topic_id = 1 ORDER BY random() LIMIT v_di;

  INSERT INTO tmp_selected_questions (question_id)
  SELECT id FROM questions WHERE topic_id = 3 ORDER BY random() LIMIT v_lr;

  INSERT INTO tmp_selected_questions (question_id)
  SELECT id FROM questions WHERE topic_id = 4 ORDER BY random() LIMIT v_qa;

  SELECT count(*) INTO v_total_attached FROM tmp_selected_questions;

  IF v_total_attached <= 0 THEN
    RAISE EXCEPTION 'No questions found for selected topics';
  END IF;

  INSERT INTO session_questions (session_id, question_id, order_index)
  SELECT
    v_session_id,
    t.question_id,
    row_number() OVER (ORDER BY random()) - 1
  FROM tmp_selected_questions t;

  v_remaining_time := GREATEST(floor(extract(epoch FROM (v_expires_at - now()))), 0);

  RETURN jsonb_build_object(
    'sessionId', v_session_id,
    'totalQuestions', v_total_attached,
    'remainingTime', v_remaining_time
  );
END;
$$;
