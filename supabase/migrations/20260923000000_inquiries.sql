-- 要望・問い合わせ。挿入はサーバー API（service_role）のみ。一覧と状態更新は admin。

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('request', 'inquiry', 'bug', 'other')),
  name text check (name is null or char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 2000),
  status text not null default 'open' check (status in ('open', 'closed')),
  user_id uuid references public.profiles(id) on delete set null,
  ip_hash text check (ip_hash is null or char_length(ip_hash) = 64),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index inquiries_status_created_at_idx
  on public.inquiries (status, created_at desc);

create index inquiries_email_created_at_idx
  on public.inquiries (email, created_at desc);

create index inquiries_ip_hash_created_at_idx
  on public.inquiries (ip_hash, created_at desc);

revoke all on table public.inquiries from anon;
revoke insert, delete on table public.inquiries from authenticated;

alter table public.inquiries enable row level security;

create policy "inquiries_select_admin" on public.inquiries
  for select using (public.is_admin());

create policy "inquiries_update_admin" on public.inquiries
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- 管理画面からは状態だけ変えられる。本文・連絡先は残す。
create or replace function public.protect_inquiry_content()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.id := old.id;
    new.kind := old.kind;
    new.name := old.name;
    new.email := old.email;
    new.message := old.message;
    new.user_id := old.user_id;
    new.ip_hash := old.ip_hash;
    new.created_at := old.created_at;
    if new.status = 'open' then
      new.closed_at := null;
    elsif new.status = 'closed' and old.status is distinct from 'closed' then
      new.closed_at := now();
    else
      new.closed_at := old.closed_at;
    end if;
  end if;
  return new;
end;
$$;

create trigger inquiries_protect_content
  before update on public.inquiries
  for each row execute function public.protect_inquiry_content();
