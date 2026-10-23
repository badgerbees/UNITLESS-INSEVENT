alter table public.profiles
  add column if not exists notif_vitamin boolean not null default true,
  add column if not exists notif_anc boolean not null default true,
  add column if not exists notif_emergency_sound boolean not null default true,
  add column if not exists notif_weekly_report boolean not null default true;

update public.profiles as profiles
set role = case
  when users.raw_user_meta_data ->> 'role' = 'companion' then 'companion'
  else 'mother'
end
from auth.users as users
where users.id = profiles.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  profile_role text;
begin
  profile_role := case
    when new.raw_user_meta_data ->> 'role' = 'companion' then 'companion'
    else 'mother'
  end;

  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), profile_role)
  on conflict (id) do update
    set full_name = excluded.full_name,
        role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
