-- Execute uma única vez no SQL Editor do Supabase. Mantém os dados existentes.
create table if not exists public.site_content (
  id integer primary key default 1 check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_content(id, content) values (1, '{}'::jsonb) on conflict (id) do nothing;
alter table public.site_content enable row level security;
drop policy if exists "site content public read" on public.site_content;
drop policy if exists "site content admin manage" on public.site_content;
create policy "site content public read" on public.site_content for select to anon, authenticated using (true);
create policy "site content admin manage" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
