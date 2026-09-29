create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  client_reference text not null unique,
  purpose text not null check (purpose in ('ride','driver_debt','driver_topup')),
  related_id text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null check (currency in ('USD','ZWG')),
  status text not null default 'PENDING' check (status in ('PENDING','SUCCESS','FAILED')),
  gateway_order_id text,
  gateway_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists payment_transactions_related_id_idx on public.payment_transactions(related_id);
create index if not exists payment_transactions_status_idx on public.payment_transactions(status);

alter table public.payment_transactions enable row level security;
-- The backend uses the server-side Supabase key. Clients must use RideZW API routes.
revoke all on public.payment_transactions from anon, authenticated;
