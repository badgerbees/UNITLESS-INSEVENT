-- Mode pasca-melahirkan: waktu lahir bayi (null = masih hamil) dan progres administrasi bayi baru lahir
alter table public.pregnancies
  add column if not exists birth_at timestamptz,
  add column if not exists postpartum_admin jsonb not null default '{}'::jsonb;
