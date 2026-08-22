-- 新規ユーザーにデフォルトアバター（/avatars/000.svg … 099.svg）を割り当て
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  avatar_index int;
begin
  avatar_index := abs(hashtext(new.id::text)) % 100;

  insert into public.profiles (id, name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', ''),
      '/avatars/' || lpad(avatar_index::text, 3, '0') || '.svg'
    ),
    'user'
  );
  return new;
end;
$$;

-- 既存ユーザー（👤 のまま）にもプールから割り当て
update public.profiles
set avatar_url = '/avatars/' || lpad((abs(hashtext(id::text)) % 100)::text, 3, '0') || '.svg'
where avatar_url is null or avatar_url = '👤';
