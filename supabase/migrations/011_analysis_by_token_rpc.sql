-- Permalink-Zugriff nur noch über den exakten Token.
-- Hintergrund: Die Policy "public_read_by_token ... using (true)" aus 001 erlaubte mit dem
-- öffentlichen anon-Key das Auslesen ALLER Analysen (select * from analyses). Der Token war
-- damit kein Zugriffsschutz. Diese Funktion liefert genau eine Zeile zum übergebenen Token.
-- Reihenfolge beim Ausrollen: 011 (Funktion) → Frontend mit rpc() live → 012 (Policy weg).

create or replace function public.get_analysis_by_token(p_token text)
returns table (
  id uuid,
  token text,
  url text,
  options jsonb,
  status text,
  result jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.token, a.url, a.options, a.status, a.result, a.created_at
  from public.analyses a
  where length(p_token) between 8 and 64
    and a.token = p_token
  limit 1
$$;

revoke all on function public.get_analysis_by_token(text) from public;
grant execute on function public.get_analysis_by_token(text) to anon, authenticated;
