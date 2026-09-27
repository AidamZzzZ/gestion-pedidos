-- ============================================================================
-- Resumen por vendedor, para la lista de Vendedores del administrador
-- ============================================================================
-- A diferencia de resumen_vendedor() (que es siempre "mis propios numeros"),
-- esta trae el desglose de TODOS los vendedores en una sola consulta. No hace
-- falta chequear es_admin() a mano: RLS en "pedidos" ya restringe que filas
-- ve cada quien (vendedor_id = auth.uid() or es_admin()), asi que si esto lo
-- llamara un vendedor por error, solo veria sus propios numeros y ceros para
-- los demas (nunca datos ajenos).

create or replace function public.resumen_por_vendedor()
returns table (
  vendedor_id uuid,
  nombre text,
  total_vendido numeric,
  comision_total numeric,
  pedidos_realizados bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    u.id as vendedor_id,
    u.nombre,
    coalesce(sum(p.monto_total) filter (where p.estado = 'enviado'), 0) as total_vendido,
    coalesce(sum(p.comision_vendedor) filter (where p.estado = 'enviado'), 0) as comision_total,
    count(p.id) as pedidos_realizados
  from usuarios u
  left join pedidos p on p.vendedor_id = u.id
  where u.rol = 'vendedor'
  group by u.id, u.nombre
  order by u.nombre;
$$;

grant execute on function public.resumen_por_vendedor() to authenticated;
