-- Auto-cleanup: delete analyses and orders older than 180 days
-- Uses pg_cron extension (enabled by default on Supabase)

create extension if not exists pg_cron;

-- Schedule daily cleanup at 3:00 AM UTC
select cron.schedule(
  'cleanup-old-analyses',
  '0 3 * * *',
  $$
    DELETE FROM analyses WHERE created_at < now() - interval '180 days';
    DELETE FROM orders WHERE created_at < now() - interval '180 days'
      AND id NOT IN (SELECT DISTINCT order_id FROM analyses);
    DELETE FROM processed_events WHERE processed_at < now() - interval '180 days';
  $$
);
