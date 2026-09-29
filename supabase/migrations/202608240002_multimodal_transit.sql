create extension if not exists pgcrypto;

create table if not exists public.transit_vehicles (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid,
  vehicle_type text not null check (vehicle_type in ('car','executive','shuttle','combi_minibus')),
  registration_number text not null unique,
  make text,
  model text,
  seat_capacity integer not null check (seat_capacity > 0),
  standing_passengers_allowed boolean not null default false,
  vid_seal_number text,
  vid_seal_verified_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transit_routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  origin text not null,
  destination text not null,
  stops jsonb not null default '[]'::jsonb,
  service_type text not null check (service_type in ('shuttle','carpool','combi_minibus')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transit_departures (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.transit_routes(id),
  vehicle_id uuid references public.transit_vehicles(id),
  provider_id uuid,
  service_type text not null check (service_type in ('airport_transfer','shuttle','carpool','combi_minibus')),
  airport_code text check (airport_code in ('HRE','BUQ','VFA','MVZ')),
  flight_number text,
  airline text,
  departure_at timestamptz not null,
  arrival_at timestamptz,
  pickup_address text not null,
  dropoff_address text not null,
  capacity_total integer not null check (capacity_total > 0),
  seats_reserved integer not null default 0 check (seats_reserved >= 0),
  standing_passengers_allowed boolean not null default false,
  fare_usd numeric(12,2) not null check (fare_usd >= 0),
  fare_zwg numeric(12,2),
  status text not null default 'scheduled' check (status in ('scheduled','boarding','in_progress','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transit_bookings (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null,
  departure_id uuid not null references public.transit_departures(id),
  service_type text not null,
  seats integer not null check (seats > 0),
  seat_numbers integer[] not null default '{}',
  passenger_name text not null,
  passenger_phone text not null,
  luggage_count integer not null default 0 check (luggage_count >= 0),
  welcome_board_name text,
  payment_method text not null check (payment_method in ('cash','ecocash','onemoney','innbucks','card','zipit_bank','clicknpay')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  status text not null default 'confirmed' check (status in ('confirmed','assigned','boarding','boarded','completed','cancelled','no_show')),
  driver_id uuid,
  provider_id uuid,
  qr_token text not null unique default encode(gen_random_bytes(18),'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transit_boarding_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.transit_bookings(id),
  seat_number integer not null,
  scanned_by uuid,
  scanned_at timestamptz not null default now(),
  unique (booking_id, seat_number)
);

create index if not exists transit_departures_time_idx on public.transit_departures(departure_at, status);
create index if not exists transit_bookings_passenger_idx on public.transit_bookings(passenger_id, created_at desc);
create index if not exists transit_bookings_departure_idx on public.transit_bookings(departure_id, status);

create or replace function public.reserve_transit_booking(
  p_passenger_id uuid,
  p_departure_id uuid,
  p_service_type text,
  p_seats integer,
  p_passenger_name text,
  p_passenger_phone text,
  p_luggage_count integer,
  p_welcome_board_name text,
  p_payment_method text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.transit_departures; b public.transit_bookings; first_seat integer;
begin
  if p_seats <= 0 then raise exception 'SEATS_INVALID'; end if;
  select * into d from public.transit_departures where id = p_departure_id and status = 'scheduled' for update;
  if not found then raise exception 'DEPARTURE_UNAVAILABLE'; end if;
  if d.service_type <> p_service_type then raise exception 'SERVICE_TYPE_MISMATCH'; end if;
  if d.seats_reserved + p_seats > d.capacity_total then raise exception 'CAPACITY_EXCEEDED'; end if;
  first_seat := d.seats_reserved + 1;
  update public.transit_departures set seats_reserved = seats_reserved + p_seats, updated_at = now() where id = d.id;
  insert into public.transit_bookings(passenger_id,departure_id,service_type,seats,seat_numbers,passenger_name,passenger_phone,luggage_count,welcome_board_name,payment_method)
  values(p_passenger_id,d.id,p_service_type,p_seats, (select array_agg(x) from generate_series(first_seat, first_seat + p_seats - 1) x), p_passenger_name,p_passenger_phone,coalesce(p_luggage_count,0),p_welcome_board_name,p_payment_method) returning * into b;
  return jsonb_build_object('booking',to_jsonb(b),'remainingSeats',d.capacity_total-d.seats_reserved-p_seats);
end; $$;

alter table public.transit_vehicles enable row level security;
alter table public.transit_routes enable row level security;
alter table public.transit_departures enable row level security;
alter table public.transit_bookings enable row level security;
alter table public.transit_boarding_events enable row level security;
revoke all on public.transit_vehicles, public.transit_routes, public.transit_departures, public.transit_bookings, public.transit_boarding_events from anon, authenticated;
