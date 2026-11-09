-- Rechnungen: fortlaufende, einmalig vergebene Nummer (§ 14 Abs. 4 Nr. 4 UStG),
-- je Bestellung genau eine Rechnung. Die PDF liegt im privaten Bucket "rechnungen".
create sequence if not exists invoice_seq;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id),
  invoice_number text not null unique
    default 'RE-' || to_char(now() at time zone 'Europe/Berlin', 'YYYY') || '-' || lpad(nextval('invoice_seq')::text, 5, '0'),
  issued_at timestamptz not null default now(),
  customer_name text,
  customer_email text,
  customer_address text,
  description text not null,
  gross_cents integer not null,
  net_cents integer not null,
  vat_cents integer not null,
  vat_rate numeric(4,2) not null,
  currency text not null default 'eur',
  storage_path text,
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;
-- Keine Policies: Zugriff nur über die Service-Role der Edge Functions.

insert into storage.buckets (id, name, public)
values ('rechnungen', 'rechnungen', false)
on conflict (id) do nothing;
