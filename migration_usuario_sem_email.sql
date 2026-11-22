-- Bar do Mimico: permitir cadastro de clientes com usuário e senha, sem e-mail informado.
-- O front-end cria um e-mail técnico interno a partir do nome de usuário para usar o Supabase Auth.
alter table public.profiles add column if not exists username text;
create unique index if not exists profiles_username_unique on public.profiles (lower(username)) where username is not null;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name,phone,username,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'phone',''),nullif(new.raw_user_meta_data->>'username',''),'customer');
 return new;
end; $$;
