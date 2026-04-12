CREATE OR REPLACE FUNCTION get_question(
  p_session_id uuid,
  p_target_question_index integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_session record;
  v_question record;
  v_selected_option text;
  v_total_questions integer;
  v_current_index integer;
  v_remaining_time integer;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT *
  INTO v_session
  FROM quiz_sessions
  WHERE id = p_session_id
    AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or unauthorized';
  END IF;

  IF v_session.status <> 'active' THEN
    RAISE EXCEPTION 'Session not active';
  END IF;

  IF v_session.expires_at IS NOT NULL AND v_session.expires_at < NOW() THEN
    RAISE EXCEPTION 'Session expired';
  END IF;

  SELECT COUNT(*)
  INTO v_total_questions
  FROM session_questions sq
  WHERE sq.session_id = p_session_id;

  IF v_total_questions <= 0 THEN
    RAISE EXCEPTION 'No questions found for session';
  END IF;

  IF p_target_question_index IS NULL THEN
    v_current_index := COALESCE(v_session.current_question_index, 0);

    IF v_current_index < 0 OR v_current_index >= v_total_questions THEN
      v_current_index := 0;
    END IF;
  ELSE
    IF p_target_question_index < 0 OR p_target_question_index >= v_total_questions THEN
      RAISE EXCEPTION 'Index out of bounds';
    END IF;

    v_current_index := p_target_question_index;

    UPDATE quiz_sessions
    SET current_question_index = v_current_index
    WHERE id = p_session_id;
  END IF;

  SELECT q.id, q.title, q.options
  INTO v_question
  FROM session_questions sq
  JOIN questions q ON q.id = sq.question_id
  WHERE sq.session_id = p_session_id
    AND sq.order_index = v_current_index
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  SELECT CASE
    WHEN sa.selected_option IS NULL THEN NULL
    WHEN jsonb_typeof(sa.selected_option) = 'string' THEN sa.selected_option #>> '{}'
    ELSE sa.selected_option::text
  END
  INTO v_selected_option
  FROM session_answers sa
  WHERE sa.session_id = p_session_id
    AND sa.question_id = v_question.id
  ORDER BY sa.answered_at DESC
  LIMIT 1;

  IF v_session.expires_at IS NOT NULL THEN
    v_remaining_time := GREATEST(
      FLOOR(EXTRACT(EPOCH FROM (v_session.expires_at - NOW()))),
      0
    );
  ELSE
    v_remaining_time := NULL;
  END IF;

  RETURN jsonb_build_object(
    'question', jsonb_build_object(
      'title', v_question.title,
      'options', v_question.options
    ),
    'currentIndex', v_current_index,
    'totalQuestions', v_total_questions,
    'remainingTime', v_remaining_time,
    'selected_option', v_selected_option
  );
END;
$$;