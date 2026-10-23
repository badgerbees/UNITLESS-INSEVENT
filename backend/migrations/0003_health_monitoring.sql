create table if not exists public.vital_logs (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  pregnancy_week integer not null check (pregnancy_week between 1 and 45),
  blood_pressure text not null,
  weight numeric(6,2),
  fundal_height numeric(5,2),
  fetal_movement text,
  hemoglobin numeric(4,2),
  urine_protein text not null default 'Negatif' check (urine_protein in ('Negatif', '+', '++', '+++')),
  notes text
);

create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  symptom_code text not null,
  label text not null,
  risk_level text not null default 'green' check (risk_level in ('green', 'yellow', 'red')),
  is_active boolean not null default false,
  recorded_on date not null default current_date,
  unique (pregnancy_id, symptom_code, recorded_on)
);

create table if not exists public.vitamins (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  label text not null,
  dose text,
  color text not null default '#22c55e',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vitamin_logs (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  vitamin_id uuid not null references public.vitamins(id) on delete cascade,
  completed_on date not null default current_date,
  completed_at timestamptz not null default now(),
  unique (vitamin_id, completed_on)
);

create table if not exists public.kick_sessions (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  kick_count integer not null check (kick_count between 0 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.contraction_sessions (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds between 0 and 86400),
  gap_minutes integer check (gap_minutes is null or gap_minutes between 0 and 10000),
  created_at timestamptz not null default now()
);

alter table public.vital_logs enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.vitamins enable row level security;
alter table public.vitamin_logs enable row level security;
alter table public.kick_sessions enable row level security;
alter table public.contraction_sessions enable row level security;

drop policy if exists "Pregnancy members can view vital logs" on public.vital_logs;
create policy "Pregnancy members can view vital logs" on public.vital_logs for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can create vital logs" on public.vital_logs;
create policy "Mothers can create vital logs" on public.vital_logs for insert to authenticated
with check (recorded_by = (select auth.uid()) and exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view symptoms" on public.symptom_logs;
create policy "Pregnancy members can view symptoms" on public.symptom_logs for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can manage symptoms" on public.symptom_logs;
create policy "Mothers can manage symptoms" on public.symptom_logs for all to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view vitamins" on public.vitamins;
create policy "Pregnancy members can view vitamins" on public.vitamins for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can manage vitamins" on public.vitamins;
create policy "Mothers can manage vitamins" on public.vitamins for all to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view vitamin logs" on public.vitamin_logs;
create policy "Pregnancy members can view vitamin logs" on public.vitamin_logs for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can manage vitamin logs" on public.vitamin_logs;
create policy "Mothers can manage vitamin logs" on public.vitamin_logs for all to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())))
with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view kick sessions" on public.kick_sessions;
create policy "Pregnancy members can view kick sessions" on public.kick_sessions for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can create kick sessions" on public.kick_sessions;
create policy "Mothers can create kick sessions" on public.kick_sessions for insert to authenticated
with check (recorded_by = (select auth.uid()) and exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));

drop policy if exists "Pregnancy members can view contractions" on public.contraction_sessions;
create policy "Pregnancy members can view contractions" on public.contraction_sessions for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));
drop policy if exists "Mothers can create contractions" on public.contraction_sessions;
create policy "Mothers can create contractions" on public.contraction_sessions for insert to authenticated
with check (recorded_by = (select auth.uid()) and exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.mother_id = (select auth.uid())));
