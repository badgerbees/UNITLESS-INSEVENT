alter table public.pregnancies
  add column if not exists sync_code_expires_at timestamptz not null default (now() + interval '15 minutes'),
  add column if not exists sync_code_used_at timestamptz;

update public.pregnancies
set sync_code_expires_at = now() + interval '15 minutes'
where sync_code_expires_at is null;
