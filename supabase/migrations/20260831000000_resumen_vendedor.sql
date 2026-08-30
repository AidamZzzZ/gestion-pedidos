-- ============================================================================
-- Resumen para el dashboard del vendedor
-- ============================================================================
-- A diferencia de resumen_admin(), aca filtramos por auth.uid() de forma
-- explicita (no solo confiando en RLS), porque el sentido de esta funcion es
-- siempre "mis propios numeros" sin importar quien la llame.

create or replace function public.resumen_vendedor()
returns table (
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
    coalesce(
      (select sum(monto_total) from pedidos where vendedor_id = auth.uid() and estado = 'enviado'),
      0
    ) as total_vendido,
    coalesce(
      (select sum(comision_vendedor) from pedidos where vendedor_id = auth.uid() and estado = 'enviado'),
      0
    ) as comision_total,
    coalesce(
      (select count(*) from pedidos where vendedor_id = auth.uid()),
      0
    ) as pedidos_realizados;
$$;

grant execute on function public.resumen_vendedor() to authenticated;
