-- MARKET INSIGHT — create profile automatically after Supabase Auth signup
-- Run this once in Supabase Dashboard > SQL Editor.
-- The trigger uses SECURITY DEFINER so it can insert into public.profiles
-- without exposing service-role credentials in the browser.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  safe_username text;
  requested_display_name text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  requested_display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');

  -- Keep username compatible with the profiles table and avoid collisions.
  safe_username := regexp_replace(requested_username, '[^a-z0-9_]', '', 'g');
  if length(safe_username) < 3 then
    safe_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  safe_username := left(safe_username, 18);

  if exists (select 1 from public.profiles p where p.username = safe_username) then
    safe_username := left(safe_username, 13) || '_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, safe_username, requested_display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
