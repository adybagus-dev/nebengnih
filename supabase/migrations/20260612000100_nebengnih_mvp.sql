create extension if not exists pgcrypto;

create table if not exists public.driver_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token_hash text not null unique,
  last_active_room_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  code text primary key check (code ~ '^BGR-[A-HJ-NP-Z2-9]{3}$'),
  driver_session_id uuid references public.driver_sessions(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rooms
  add column if not exists driver_session_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_driver_session_id_fkey'
  ) then
    alter table public.rooms
      add constraint rooms_driver_session_id_fkey
      foreign key (driver_session_id)
      references public.driver_sessions(id)
      on delete cascade;
  end if;
end;
$$;

do $$
declare
  fallback_session_id uuid;
begin
  select id
    into fallback_session_id
  from public.driver_sessions
  order by created_at asc
  limit 1;

  if fallback_session_id is null then
    insert into public.driver_sessions (session_token_hash, last_active_room_code)
    values ('legacy-room-migration', null)
    returning id into fallback_session_id;
  end if;

  update public.rooms
  set driver_session_id = fallback_session_id
  where driver_session_id is null;
end;
$$;

alter table public.rooms
  alter column driver_session_id set not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists driver_sessions_set_updated_at on public.driver_sessions;
create trigger driver_sessions_set_updated_at
before update on public.driver_sessions
for each row execute function public.set_updated_at();

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

alter table public.driver_sessions enable row level security;
alter table public.rooms enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.driver_sessions to anon, authenticated;
grant select, insert, update on table public.rooms to anon, authenticated;

drop policy if exists "driver_sessions_public_read" on public.driver_sessions;
create policy "driver_sessions_public_read"
  on public.driver_sessions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "driver_sessions_public_insert" on public.driver_sessions;
create policy "driver_sessions_public_insert"
  on public.driver_sessions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "driver_sessions_public_update" on public.driver_sessions;
create policy "driver_sessions_public_update"
  on public.driver_sessions
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "rooms_public_read" on public.rooms;
create policy "rooms_public_read"
  on public.rooms
  for select
  to anon, authenticated
  using (true);

drop policy if exists "rooms_public_insert" on public.rooms;
create policy "rooms_public_insert"
  on public.rooms
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "rooms_public_update" on public.rooms;
create policy "rooms_public_update"
  on public.rooms
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "rooms_public_delete" on public.rooms;
create policy "rooms_public_delete"
  on public.rooms
  for delete
  to anon, authenticated
  using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end;
$$;
