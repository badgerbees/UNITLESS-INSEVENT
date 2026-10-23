create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'mother' check (role in ('mother', 'companion')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles(id) on delete cascade,
  companion_id uuid references public.profiles(id) on delete set null,
  hpht_date date not null,
  due_date date not null,
  blood_type text,
  hospital text,
  doctor text,
  sync_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.pregnancies enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can view their pregnancies" on public.pregnancies;
create policy "Users can view their pregnancies"
  on public.pregnancies for select
  to authenticated
  using ((select auth.uid()) = mother_id or (select auth.uid()) = companion_id);

drop policy if exists "Mothers can create pregnancies" on public.pregnancies;
create policy "Mothers can create pregnancies"
  on public.pregnancies for insert
  to authenticated
  with check ((select auth.uid()) = mother_id);

drop policy if exists "Mothers can update pregnancies" on public.pregnancies;
create policy "Mothers can update pregnancies"
  on public.pregnancies for update
  to authenticated
  using ((select auth.uid()) = mother_id)
  with check ((select auth.uid()) = mother_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
