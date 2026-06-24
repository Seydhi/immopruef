-- Harden public read access to analyses
-- ----------------------------------------------------------------------------
-- Bisher: RLS-Policy "public_read_by_token" = `for select using (true)` erlaubte
-- mit dem (im Frontend exponierten) anon-Key einen UNGEFILTERTEN Full-Table-Read
-- der gesamten analyses-Tabelle (alle URLs, options, results) — der Token-Filter
-- war nur eine Konvention im Frontend-Query, nicht erzwungen.
--
-- Neu: Lesezugriff ausschliesslich ueber eine SECURITY-DEFINER-Funktion, die genau
-- EINE Zeile per exaktem Token zurueckgibt. Die permissive Policy wird entfernt, der
-- direkte Tabellen-Select fuer anon/authenticated faellt damit weg. Die Edge Functions
-- nutzen den service_role-Key und umgehen RLS ohnehin — sie sind nicht betroffen.

-- 1) Permissive Policy entfernen (kein ungefilterter Full-Table-Read mehr)
drop policy if exists "public_read_by_token" on analyses;

-- 2) Token-gebundene Lesefunktion (laeuft mit Definer-Rechten, umgeht RLS,
--    gibt aber strikt nur die per Token adressierte Zeile heraus)
create or replace function public.get_analysis_by_token(p_token text)
returns setof analyses
language sql
stable
security definer
set search_path = public
as $$
  select * from analyses where token = p_token limit 1;
$$;

-- 3) Aufrufrechte: nur ausfuehren, kein Tabellenzugriff
revoke all on function public.get_analysis_by_token(text) from public;
grant execute on function public.get_analysis_by_token(text) to anon, authenticated;
