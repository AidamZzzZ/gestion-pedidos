-- ============================================================================
-- Cancelar y eliminar pedido directamente devolviendo stock
-- ============================================================================

-- 1. No intentar recalcular totales en pedidos cancelados o eliminados
create or replace function recalcular_totales_pedido()
returns trigger as $$
declare
  v_pedido_id uuid := coalesce(new.pedido_id, old.pedido_id);
  v_estado estado_pedido;
begin
  select estado into v_estado from pedidos where id = v_pedido_id;
  if not found or v_estado is null or v_estado = 'cancelado' then
    return null;
  end if;

  update pedidos p
  set cantidad_total_productos = coalesce((select sum(d.cantidad) from detalle_pedido d where d.pedido_id = v_pedido_id), 0),
      monto_total               = coalesce((select sum(d.subtotal) from detalle_pedido d where d.pedido_id = v_pedido_id), 0),
      comision_vendedor         = coalesce((select sum(d.subtotal) from detalle_pedido d where d.pedido_id = v_pedido_id), 0)
                                    * p.porcentaje_comision_aplicado / 100
  where p.id = v_pedido_id;
  return null;
end;
$$ language plpgsql;

-- 2. Permitir DELETE en detalle_pedido sin que el trigger de estado lo bloquee
create or replace function detalle_pedido_validar_estado_pedido()
returns trigger as $$
declare
  v_estado estado_pedido;
  v_pedido_id uuid := coalesce(new.pedido_id, old.pedido_id);
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  select estado into v_estado from pedidos where id = v_pedido_id;
  if v_estado is null then
    return coalesce(new, old);
  end if;

  if v_estado = 'cancelado' then
    raise exception 'No se pueden modificar los productos de un pedido cancelado';
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql;

-- 3. Politica RLS para DELETE en pedidos (vendedor dueno o admin)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'pedidos' and policyname = 'pedidos_delete'
  ) then
    create policy pedidos_delete on pedidos
      for delete using (vendedor_id = auth.uid() or es_admin());
  end if;
end;
$$;

-- 4. Funcion RPC atomica para cancelar, devolver stock y eliminar el pedido
create or replace function cancelar_y_eliminar_pedido(p_pedido_id uuid)
returns jsonb as $$
declare
  v_pedido record;
  v_linea record;
begin
  -- 1. Validar pedido
  select * into v_pedido from pedidos where id = p_pedido_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'El pedido no existe.');
  end if;

  -- 2. Validar autorizacion (vendedor dueno o admin)
  if v_pedido.vendedor_id <> auth.uid() and not es_admin() then
    return jsonb_build_object('ok', false, 'error', 'No tienes permiso para cancelar este pedido.');
  end if;

  -- 3. Devolver stock si estaba enviado
  if v_pedido.estado = 'enviado' then
    for v_linea in select producto_id, cantidad from detalle_pedido where pedido_id = p_pedido_id loop
      update productos set stock = stock + v_linea.cantidad where id = v_linea.producto_id;
    end loop;
  end if;

  -- 4. Borrar detalle_pedido y el pedido
  delete from detalle_pedido where pedido_id = p_pedido_id;
  delete from pedidos where id = p_pedido_id;

  return jsonb_build_object(
    'ok', true,
    'numero_orden', v_pedido.numero_orden
  );
exception
  when others then
    return jsonb_build_object('ok', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = public;

-- 5. Limpiar pedidos que ya habian sido cancelados previamente en la base de datos
delete from detalle_pedido where pedido_id in (select id from pedidos where estado = 'cancelado');
delete from pedidos where estado = 'cancelado';
