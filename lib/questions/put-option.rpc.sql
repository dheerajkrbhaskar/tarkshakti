-- RPC: put_option_v2
-- Purpose: Store an answer for a quiz question with all validation
-- Parameters:
--   p_session_id: The quiz session ID
--   p_selected_option: The option selected by the user
--   p_time_taken_s: Time taken to answer (in seconds)
-- Notes: User identity is read from auth.uid() inside the function.
-- Returns: Remaining time in seconds

-- Important: remove old overloads so PostgREST does not bind params to legacy signatures.
DROP FUNCTION IF EXISTS put_option(UUID, UUID, TEXT, INT);
DROP FUNCTION IF EXISTS put_option(UUID, TEXT, INT);
DROP FUNCTION IF EXISTS put_option_v2(UUID, TEXT, INT);
DROP FUNCTION IF EXISTS put_option_v2(UUID, JSONB, INT);

-- Align storage with schema: session_answers.selected_option should be JSONB.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'session_answers'
            AND column_name = 'selected_option'
            AND data_type <> 'jsonb'
    ) THEN
        ALTER TABLE public.session_answers
            ALTER COLUMN selected_option TYPE JSONB USING to_jsonb(selected_option::TEXT);
    END IF;
END $$;

-- Ensure correctness flag exists for answer tracking.
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

CREATE OR REPLACE FUNCTION put_option_v2(
    p_session_id UUID,
    p_selected_option TEXT,
    p_time_taken_s INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_question_id INT;
    v_correct_option JSONB;
    v_selected_option_jsonb JSONB;
    v_is_correct BOOLEAN;
    v_remaining_time_ms BIGINT;
    v_remaining_time_s INT;
    v_current_index INT;
BEGIN
    -- 1. Validate inputs
    IF p_session_id IS NULL OR p_selected_option IS NULL 
        OR p_time_taken_s IS NULL OR p_time_taken_s < 0 THEN
        RAISE EXCEPTION 'Invalid input parameters';
    END IF;

    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized user';
    END IF;

    -- 2. Fetch session with validation
    SELECT 
        id, user_id, status, expires_at, current_question_index
    INTO v_session
    FROM quiz_sessions
    WHERE id = p_session_id;

    IF v_session IS NULL THEN
        RAISE EXCEPTION 'Session not found' USING ERRCODE = '404';
    END IF;

    -- 3. Check ownership
    IF v_session.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized user' USING ERRCODE = '401';
    END IF;

    -- 4. Check session status
    IF v_session.status != 'active' THEN
        RAISE EXCEPTION 'Session not active' USING ERRCODE = '409';
    END IF;

    -- 5. Check session expiry
    v_remaining_time_ms := EXTRACT(EPOCH FROM v_session.expires_at - NOW())::BIGINT * 1000;
    IF v_remaining_time_ms <= 0 THEN
        RAISE EXCEPTION 'Session expired' USING ERRCODE = '410';
    END IF;

    v_remaining_time_s := GREATEST(0, (v_remaining_time_ms / 1000)::INT);
    v_current_index := COALESCE(v_session.current_question_index, 0);

    -- 6. Fetch question_id and correct option from session_questions/questions
    SELECT sq.question_id, q.correct_option
    INTO v_question_id, v_correct_option
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id = p_session_id AND sq.order_index = v_current_index;

    IF v_question_id IS NULL THEN
        RAISE EXCEPTION 'Question not found' USING ERRCODE = '404';
    END IF;

    BEGIN
        v_selected_option_jsonb := p_selected_option::jsonb;
    EXCEPTION
        WHEN OTHERS THEN
            v_selected_option_jsonb := to_jsonb(p_selected_option);
    END;

    v_is_correct := public.jsonb_to_plain_text(v_selected_option_jsonb) = public.jsonb_to_plain_text(v_correct_option);

    -- 7. Atomic UPSERT answer
    INSERT INTO session_answers (session_id, question_id, selected_option, is_correct, time_taken_ms, answered_at)
    VALUES (
        p_session_id,
        v_question_id,
        v_selected_option_jsonb,
        v_is_correct,
        (p_time_taken_s * 1000)::INT,
        NOW()
    )
    ON CONFLICT (session_id, question_id) DO UPDATE
    SET 
        selected_option = EXCLUDED.selected_option,
        is_correct = EXCLUDED.is_correct,
        time_taken_ms = EXCLUDED.time_taken_ms,
        answered_at = EXCLUDED.answered_at;

    -- 8. Return remaining time
    RETURN v_remaining_time_s;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
