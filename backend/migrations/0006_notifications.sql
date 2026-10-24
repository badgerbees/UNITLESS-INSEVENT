create table if not exists public.emergency_alerts (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  sent_by uuid not null references public.profiles(id) on delete cascade,
  trigger text not null default 'manual' check (trigger in ('manual', '511', 'symptom')),
  message text not null,
  location text,
  lat double precision,
  lng double precision,
  acknowledged_at timestamptz,
  eta_minutes integer check (eta_minutes is null or eta_minutes between 0 and 600),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists emergency_alerts_pregnancy_created_idx
  on public.emergency_alerts (pregnancy_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pregnancy_id uuid references public.pregnancies(id) on delete cascade,
  kind text not null check (kind in ('emergency', 'emergency_ack', 'emergency_resolved', 'vitamin', 'anc', 'weekly_report', 'info')),
  title text not null,
  body text,
  link text,
  -- Kunci unik per user agar pengingat terjadwal tidak terkirim dua kali
  dedupe_key text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.emergency_alerts enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Pregnancy members can view emergency alerts" on public.emergency_alerts;
create policy "Pregnancy members can view emergency alerts" on public.emergency_alerts for select to authenticated
using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and (select auth.uid()) in (p.mother_id, p.companion_id)));

drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications" on public.notifications for select to authenticated
using (user_id = (select auth.uid()));

-- Realtime: frontend berlangganan perubahan kedua tabel (RLS tetap berlaku)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'emergency_alerts') then
    alter publication supabase_realtime add table public.emergency_alerts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
