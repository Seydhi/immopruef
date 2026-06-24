-- Watchdog: self-healing for stuck paid/processing orders
-- ----------------------------------------------------------------------------
-- Restproblem nach 005 (Self-Chaining): Wenn eine analyze-Invocation timeoutet
-- (z.B. Premium mit vielen Websuchen) WÄHREND der Kunde den Tab geschlossen hat,
-- bleibt die Analyse in 'processing' hängen — das zeitgesteuerte Stuck-Reset in
-- analyze greift nur, wenn analyze überhaupt nochmal aufgerufen wird. Ohne Tab und
-- ohne weiteres Webhook-Event passiert das nie -> bezahlt, aber nie geliefert.
--
-- Dieser Watchdog läuft alle 5 Minuten per pg_cron und stößt analyze für jede Order
-- erneut an, die noch pending/processing-Analysen hat. analyze claimt atomar +
-- self-chained den Rest. Idempotent: Doppelanstöße sind durch das atomare Claiming
-- in analyze unkritisch.
--
-- ⚠️ OPERATOR-SETUP (einmalig) — der Watchdog NO-OPt, bis diese zwei Vault-Secrets
--    gesetzt sind (er bricht NICHT, sondern überspringt sauber):
--      select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--      select vault.create_secret('<SERVICE_ROLE_KEY>',                'service_role_key');
--    (Supabase Dashboard -> Project Settings -> Vault, oder via SQL-Editor.)

create extension if not exists pg_net;

create or replace function public.kick_stuck_orders()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_base text;
  v_key  text;
  r      record;
begin
  -- Secrets aus dem Vault lesen; fehlt etwas oder ist Vault nicht da -> sauberes No-Op.
  begin
    select decrypted_secret into v_base from vault.decrypted_secrets where name = 'project_url'      limit 1;
    select decrypted_secret into v_key  from vault.decrypted_secrets where name = 'service_role_key' limit 1;
  exception when others then
    raise notice 'kick_stuck_orders: Vault nicht verfügbar (%) — übersprungen', sqlerrm;
    return;
  end;

  if v_base is null or v_key is null then
    raise notice 'kick_stuck_orders: Vault-Secrets project_url/service_role_key nicht gesetzt — übersprungen';
    return;
  end if;

  for r in
    select distinct o.stripe_session_id
    from orders o
    join analyses a on a.order_id = o.id
    where o.status in ('paid', 'processing')
      and a.status in ('pending', 'processing')
      and o.created_at < now() - interval '90 seconds'  -- dem Live-/Webhook-Flow Vorsprung lassen
      and o.created_at > now() - interval '2 hours'      -- uralte Orders nicht endlos anstoßen
      and o.stripe_session_id is not null
  loop
    perform net.http_post(
      url     := v_base || '/functions/v1/analyze',
      headers := jsonb_build_object(
                   'Content-Type', 'application/json',
                   'Authorization', 'Bearer ' || v_key
                 ),
      body    := jsonb_build_object('session_id', r.stripe_session_id)
    );
  end loop;
end;
$$;

-- Nur Edge-/DB-intern aufrufbar
revoke all on function public.kick_stuck_orders() from public, anon, authenticated;

-- Alle 5 Minuten ausführen (cron.schedule ist upsert by name -> re-run-sicher)
select cron.schedule('watchdog-stuck-orders', '*/5 * * * *', $$ select public.kick_stuck_orders(); $$);
