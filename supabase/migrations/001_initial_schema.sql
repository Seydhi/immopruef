-- ImmoAnalyse Database Schema

-- Orders: groups analyses belonging to one Stripe payment
create table orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  email text default '',
  package text not null check (package in ('single', 'double', 'triple', 'premium')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- Analyses: one row per property URL
create table analyses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  token text unique not null,
  url text not null,
  options jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result jsonb,
  created_at timestamptz default now()
);

-- Stripe webhook idempotency
create table processed_events (
  event_id text primary key,
  processed_at timestamptz default now()
);

-- Enable RLS
alter table orders enable row level security;
alter table analyses enable row level security;
alter table processed_events enable row level security;

-- RLS: analyses can be read publicly by token (for permalinks)
create policy "public_read_by_token" on analyses
  for select using (true);

-- RLS: orders — no public access
-- (Edge Functions use service_role key which bypasses RLS)

-- RLS: processed_events — no public access

-- Index for fast token lookups
create index idx_analyses_token on analyses(token);
create index idx_analyses_order_id on analyses(order_id);
create index idx_orders_stripe_session on orders(stripe_session_id);
