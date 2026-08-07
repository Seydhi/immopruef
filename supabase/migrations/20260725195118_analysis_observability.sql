-- Messbare Laufzeiten und Kosten je Analyse.
alter table public.analyses
  add column if not exists completed_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists last_error text,
  add column if not exists model text,
  add column if not exists input_tokens bigint,
  add column if not exists output_tokens bigint,
  add column if not exists cache_creation_input_tokens bigint,
  add column if not exists cache_read_input_tokens bigint,
  add column if not exists web_search_requests integer;

create index if not exists idx_analyses_status_created_at
  on public.analyses (status, created_at desc);

create index if not exists idx_analyses_completed_at
  on public.analyses (completed_at desc)
  where completed_at is not null;

-- Die bisherige Policy "public_read_by_token" hatte USING (true). Damit war
-- nicht nur die Abfrage eines bekannten Tokens, sondern die ganze Tabelle über
-- die Data API lesbar. Ergebnisse werden künftig ausschließlich über die
-- get-analysis Edge Function ausgeliefert.
drop policy if exists "public_read_by_token" on public.analyses;
revoke all privileges on table public.analyses from anon, authenticated;
