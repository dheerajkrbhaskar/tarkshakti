-- Simple seed insert for the `questions` table (JSONB schema)
-- Run in Supabase SQL editor or psql.

insert into questions (
  topic_id,
  title,
  options,
  correct_option,
  explanation
)
values
  (
    4,
    '[{"type":"text","value":"What is 12 + 8?"}]'::jsonb,
    '[
      [{"type":"text","value":"18"}],
      [{"type":"text","value":"20"}],
      [{"type":"text","value":"22"}],
      [{"type":"text","value":"24"}]
    ]'::jsonb,
    '[{"type":"text","value":"20"}]',
    '[{"type":"text","value":"12 + 8 = 20."}]'::jsonb
  ),
  (
    2,
    '[{"type":"text","value":"Choose the synonym of \"brief\"."}]'::jsonb,
    '[
      [{"type":"text","value":"Lengthy"}],
      [{"type":"text","value":"Concise"}],
      [{"type":"text","value":"Obscure"}],
      [{"type":"text","value":"Massive"}]
    ]'::jsonb,
    '[{"type":"text","value":"Concise"}]',
    '[{"type":"text","value":"\"Brief\" means short or concise."}]'::jsonb
  );
