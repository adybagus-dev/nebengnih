create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  admin_token_hash text,
  driver_alias text not null default 'Driver',
  origin_lat double precision,
  origin_lng double precision,
  destination_lat double precision,
  destination_lng double precision,
  fuel_cost_per_km integer not null default 0,
  toll_cost integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.passengers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  alias text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  is_joining_today boolean not null default true,
  pickup_order integer not null default 0,
  local_member_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists passengers_set_updated_at on public.passengers;
create trigger passengers_set_updated_at
before update on public.passengers
for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;
alter table public.passengers enable row level security;

drop policy if exists "rooms_public_read" on public.rooms;
create policy "rooms_public_read"
  on public.rooms
  for select
  using (true);

drop policy if exists "rooms_public_insert" on public.rooms;
create policy "rooms_public_insert"
  on public.rooms
  for insert
  with check (true);

drop policy if exists "rooms_public_update" on public.rooms;
create policy "rooms_public_update"
  on public.rooms
  for update
  using (true)
  with check (true);

drop policy if exists "rooms_public_delete" on public.rooms;
create policy "rooms_public_delete"
  on public.rooms
  for delete
  using (true);

drop policy if exists "passengers_public_read" on public.passengers;
create policy "passengers_public_read"
  on public.passengers
  for select
  using (true);

drop policy if exists "passengers_public_insert" on public.passengers;
create policy "passengers_public_insert"
  on public.passengers
  for insert
  with check (true);

drop policy if exists "passengers_public_update" on public.passengers;
create policy "passengers_public_update"
  on public.passengers
  for update
  using (true)
  with check (true);

drop policy if exists "passengers_public_delete" on public.passengers;
create policy "passengers_public_delete"
  on public.passengers
  for delete
  using (true);

