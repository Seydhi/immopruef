-- Erst ausführen, wenn das Frontend get_analysis_by_token() nutzt (siehe 011).
-- Danach kann der anon-Key keine Tabelle mehr direkt lesen; Edge Functions arbeiten
-- mit dem service_role-Key und sind nicht betroffen.

drop policy if exists "public_read_by_token" on public.analyses;

revoke all on table public.analyses, public.orders, public.processed_events,
  public.checkout_attempts, public.invoices from anon, authenticated;
