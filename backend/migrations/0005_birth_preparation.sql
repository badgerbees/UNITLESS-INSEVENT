create table if not exists public.checklist_categories (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  category_id uuid not null references public.checklist_categories(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.birth_plans (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  option_key text not null,
  selected boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (pregnancy_id, option_key)
);

alter table public.checklist_categories enable row level security;
alter table public.checklist_items enable row level security;
alter table public.birth_plans enable row level security;

drop policy if exists "Pregnancy members can view checklist categories" on public.checklist_categories;
create policy "Pregnancy members can view checklist categories" on public.checklist_categories for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can manage checklist categories" on public.checklist_categories;
create policy "Mothers can manage checklist categories" on public.checklist_categories for all to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view checklist items" on public.checklist_items;
create policy "Pregnancy members can view checklist items" on public.checklist_items for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can manage checklist items" on public.checklist_items;
create policy "Mothers can manage checklist items" on public.checklist_items for all to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view birth plans" on public.birth_plans;
create policy "Pregnancy members can view birth plans" on public.birth_plans for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can manage birth plans" on public.birth_plans;
create policy "Mothers can manage birth plans" on public.birth_plans for all to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));
