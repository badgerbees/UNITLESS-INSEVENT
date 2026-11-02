-- Preserve the registration role for future accounts, including projects where
-- the original profile trigger was accidentally restored after migration 0002.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case when new.raw_user_meta_data ->> 'role' = 'companion' then 'companion' else 'mother' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Repair only misclassified companions; never change an account that owns a pregnancy.
update public.profiles as profile
set role = 'companion'
from auth.users as account
where account.id = profile.id
  and account.raw_user_meta_data ->> 'role' = 'companion'
  and profile.role = 'mother'
  and not exists (
    select 1 from public.pregnancies where mother_id = profile.id
  );
