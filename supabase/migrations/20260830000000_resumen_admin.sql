-- ============================================================================
-- Resumen para el tab "Panel" del administrador
-- ============================================================================
-- A diferencia de los helpers de login, esta funcion SI corre con sesion
-- (solo la usa /admin/panel, que ya exige rol admin en el layout). Por eso NO
-- es security definer: corre con los privilegios del usuario que llama, asi
-- que las RLS existentes de "pedidos" (vendedor_id = auth.uid() or es_admin())
-- deciden solas que puede ver. Un admin ve todo; un vendedor solo veria sus
-- propios pedidos si llegara a invocarla (defensa en profundidad).

create or replace function public.resumen_admin()
returns table (
  articulos_en_stock bigint,
  total_vendido numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce((select sum(stock) from productos), 0) as articulos_en_stock,
    coalesce((select sum(monto_total) from pedidos where estado = 'enviado'), 0) as total_vendido;
$$;

grant execute on function public.resumen_admin() to authenticated;
