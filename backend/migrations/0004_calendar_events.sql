create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  event_date date not null,
  label text not null,
  event_type text not null default 'other' check (event_type in ('anc', 'vitamin', 'hpl', 'other')),
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

drop policy if exists "Pregnancy members can view calendar events" on public.calendar_events;
create policy "Pregnancy members can view calendar events" on public.calendar_events for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));

drop policy if exists "Mothers can create calendar events" on public.calendar_events;
create policy "Mothers can create calendar events" on public.calendar_events for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Mothers can update calendar events" on public.calendar_events;
create policy "Mothers can update calendar events" on public.calendar_events for update to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Mothers can delete calendar events" on public.calendar_events;
create policy "Mothers can delete calendar events" on public.calendar_events for delete to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));
