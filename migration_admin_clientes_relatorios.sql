-- Bar do Mimico: clientes, bloqueio e descontos. Execute no Supabase SQL Editor.
alter table public.profiles add column if not exists blocked boolean not null default false;
alter table public.profiles add column if not exists discount_type text;
alter table public.profiles add column if not exists discount_value numeric(10,2);
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
-- Apenas administrador pode bloquear/desbloquear e definir descontos.
create or replace function public.admin_set_customer_access(p_customer_id uuid,p_blocked boolean)
returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Acesso restrito ao administrador'; end if;
update public.profiles set blocked=p_blocked,updated_at=now() where id=p_customer_id and role='customer'; end; $$;
grant execute on function public.admin_set_customer_access(uuid,boolean) to authenticated;
create or replace function public.admin_set_customer_discount(p_customer_id uuid,p_type text,p_value numeric)
returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Acesso restrito ao administrador'; end if;
if p_type not in ('percent','fixed','none') then raise exception 'Tipo de desconto inválido'; end if;
if p_value<0 or (p_type='percent' and p_value>100) then raise exception 'Valor de desconto inválido'; end if;
update public.profiles set discount_type=nullif(p_type,'none'),discount_value=case when p_type='none' then null else p_value end,updated_at=now() where id=p_customer_id and role='customer'; end; $$;
grant execute on function public.admin_set_customer_discount(uuid,text,numeric) to authenticated;
-- Exclusão real da conta Auth: remove pedidos e perfil vinculados por cascata? pedidos customer_id não tem cascade; remova pedidos primeiro.
create or replace function public.admin_delete_customer(p_customer_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Acesso restrito ao administrador'; end if;
delete from public.orders where customer_id=p_customer_id;
delete from auth.users where id=p_customer_id; end; $$;
grant execute on function public.admin_delete_customer(uuid) to authenticated;

alter table public.orders add column if not exists discount_amount numeric(10,2) not null default 0;
