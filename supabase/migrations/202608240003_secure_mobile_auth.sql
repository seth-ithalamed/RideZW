create table if not exists public.ridezw_otp_challenges (
  phone text not null,
  role text not null check (role in ('rider','driver')),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  created_at timestamptz not null default now(),
  primary key(phone, role)
);
create index if not exists ridezw_otp_created_at_idx on public.ridezw_otp_challenges(created_at);

create table if not exists public.ridezw_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('rider','driver','admin')),
  phone text not null unique,
  display_name text not null,
  email text,
  city text not null default 'Harare',
  national_id text,
  vehicle_data jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','pending_review','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.consume_ridezw_otp(p_phone text,p_role text,p_code_hash text)
returns text language plpgsql security definer set search_path=public as $$
declare c public.ridezw_otp_challenges;
begin
  select * into c from public.ridezw_otp_challenges where phone=p_phone and role=p_role for update;
  if not found then return 'missing'; end if;
  if c.expires_at < now() then delete from public.ridezw_otp_challenges where phone=p_phone and role=p_role; return 'expired'; end if;
  if c.attempts >= 5 then delete from public.ridezw_otp_challenges where phone=p_phone and role=p_role; return 'locked'; end if;
  if c.code_hash <> p_code_hash then update public.ridezw_otp_challenges set attempts=attempts+1 where phone=p_phone and role=p_role; return 'invalid'; end if;
  delete from public.ridezw_otp_challenges where phone=p_phone and role=p_role;
  return 'verified';
end; $$;

alter table public.ridezw_otp_challenges enable row level security;
alter table public.ridezw_profiles enable row level security;
revoke all on public.ridezw_otp_challenges, public.ridezw_profiles from anon, authenticated;
