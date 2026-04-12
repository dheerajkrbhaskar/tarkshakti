create or replace function public.jsonb_to_plain_text(raw jsonb)
returns text
language plpgsql
immutable
as $$
declare
  child jsonb;
  child_text text;
  result text := '';
  normalized text;
begin
  if raw is null then
    return null;
  end if;

  case jsonb_typeof(raw)
    when 'string' then
      child_text := raw #>> '{}';

      -- Handle legacy rows where JSON arrays/objects were stored as JSON string literals.
      if child_text ~ '^\s*[\[{]' then
        begin
          return public.jsonb_to_plain_text(child_text::jsonb);
        exception
          when others then
            return child_text;
        end;
      end if;

      return child_text;
    when 'number', 'boolean' then
      return raw::text;
    when 'object' then
      if raw ? 'value' and jsonb_typeof(raw->'value') = 'string' then
        return raw->>'value';
      end if;

      if raw ? 'text' and jsonb_typeof(raw->'text') = 'string' then
        return raw->>'text';
      end if;

      return raw::text;
    when 'array' then
      for child in
        select value
        from jsonb_array_elements(raw) as value
      loop
        child_text := public.jsonb_to_plain_text(child);
        if child_text is not null and length(btrim(child_text)) > 0 then
          result := result || case when result = '' then '' else ' ' end || btrim(child_text);
        end if;
      end loop;

      normalized := btrim(regexp_replace(result, '\s+', ' ', 'g'));
      return nullif(normalized, '');
    else
      return raw::text;
  end case;
end;
$$;