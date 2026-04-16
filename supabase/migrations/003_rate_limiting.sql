-- Rate-Limiting für create-checkout
-- Schützt vor Budget-Abuse durch Spam-Bestellungen
-- (1000 Spam-Checkouts × ~$5 Claude-Kosten = ~$5000 Schaden in Minuten)

create table if not exists checkout_attempts (
  id bigserial primary key,
  ip text not null,
  created_at timestamptz not null default now()
);

-- Index für schnelle "wie viele Attempts in letzter Stunde" Queries
create index if not exists idx_checkout_attempts_ip_time
  on checkout_attempts(ip, created_at desc);

-- RLS: nur Service-Role darf lesen/schreiben (Edge Function nutzt Service-Role)
alter table checkout_attempts enable row level security;

-- Auto-Cleanup: alte Attempts älter als 7 Tage löschen
-- (kombinierbar mit pg_cron, falls aktiv — siehe 002_auto_cleanup.sql)
create or replace function cleanup_old_checkout_attempts() returns void as $$
begin
  delete from checkout_attempts where created_at < now() - interval '7 days';
end;
$$ language plpgsql security definer;
