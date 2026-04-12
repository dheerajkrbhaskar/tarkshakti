drop function if exists public.get_user_quiz_dashboard(uuid);

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

create or replace function public.get_user_quiz_dashboard(
  p_user_id uuid
)
returns table (
  quiz_id uuid,
  started_at timestamp,
  duration int,
  correct int,
  total int,
  score numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with question_rows as (
    select
      qs.id as session_row_id,
      qs.quiz_id,
      qs.started_at,
      qz.duration_seconds,
      sq.id as session_question_id,
      sq.order_index,
      q.correct_option,
      sa.selected_option,
      sa.is_correct,
      public.jsonb_to_plain_text(sa.selected_option) as selected_text,
      public.jsonb_to_plain_text(q.correct_option) as correct_text
    from quiz_sessions qs
    join quizzes qz
      on qz.id = qs.quiz_id
    join session_questions sq
      on sq.session_id = qs.id
    join questions q
      on q.id = sq.question_id
    left join lateral (
      select sa.selected_option, sa.is_correct
      from session_answers sa
      where sa.session_id = qs.id
        and sa.question_id = sq.question_id
      order by sa.answered_at desc
      limit 1
    ) sa on true
    where qs.user_id = p_user_id
      and qs.status = 'completed'
  )
  select
    qr.quiz_id,
    qr.started_at,
    qr.duration_seconds::int as duration,
    count(*) filter (
      where qr.selected_text is not null
      and COALESCE(qr.is_correct, qr.selected_text = qr.correct_text)
    )::int as correct,
    count(qr.session_question_id)::int as total,
    (
      count(*) filter (
        where qr.selected_text is not null
        and COALESCE(qr.is_correct, qr.selected_text = qr.correct_text)
      )::numeric
      / nullif(count(qr.session_question_id), 0)
    ) as score
  from question_rows qr
  group by qr.session_row_id, qr.quiz_id, qr.started_at, qr.duration_seconds
  order by qr.started_at desc;

end;
$$;