-- ============================================================================
-- Permitir modificacion de pedidos enviados y RPC para modificar pedido
-- ============================================================================

-- 1. Modificar trigger de bloqueo para permitir editar pedidos enviados
create or replace function pedidos_bloquear_edicion()
returns trigger as $$
begin
  if old.estado = 'cancelado' then
    raise exception 'El pedido % esta cancelado y no puede modificarse', old.numero_orden;
  end if;

  -- Se permite modificar pedidos en estado 'enviado' o 'pendiente'
  return new;
end;
$$ language plpgsql;

-- 2. Modificar trigger de detalle_pedido para permitir editar pedidos no cancelados
create or replace function detalle_pedido_validar_estado_pedido()
returns trigger as $$
declare
  v_estado estado_pedido;
  v_pedido_id uuid := coalesce(new.pedido_id, old.pedido_id);
begin
  select estado into v_estado from pedidos where id = v_pedido_id;
  if v_estado = 'cancelado' then
    raise exception 'No se pueden modificar los productos de un pedido cancelado';
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

-- 3. Funcion atomica para modificar un pedido completo recalculando stock
create or replace function modificar_pedido_completo(
  p_pedido_id uuid,
  p_cliente jsonb,
  p_lineas jsonb
)
returns jsonb as $$
declare
  v_pedido record;
  v_linea jsonb;
  v_prod_id uuid;
  v_cant int;
  v_precio numeric(12,2);
  v_prod_stock int;
  v_prod_nombre text;
  v_old_line record;
  v_nuevo_total numeric(12,2) := 0;
begin
  -- 1. Validar pedido
  select * into v_pedido from pedidos where id = p_pedido_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'El pedido no existe.');
  end if;

  if v_pedido.estado = 'cancelado' then
    return jsonb_build_object('ok', false, 'error', 'El pedido está cancelado y no puede modificarse.');
  end if;

  -- 2. Validar autorizacion (vendedor dueño o admin)
  if v_pedido.vendedor_id <> auth.uid() and not es_admin() then
    return jsonb_build_object('ok', false, 'error', 'No tienes permiso para modificar este pedido.');
  end if;

  -- 3. Devolver stock de los productos anteriores
  for v_old_line in select producto_id, cantidad from detalle_pedido where pedido_id = p_pedido_id loop
    update productos set stock = stock + v_old_line.cantidad where id = v_old_line.producto_id;
  end loop;

  -- 4. Borrar detalle_pedido previo
  delete from detalle_pedido where pedido_id = p_pedido_id;

  -- 5. Insertar nuevas lineas y descontar stock
  for v_linea in select * from jsonb_array_elements(p_lineas) loop
    v_prod_id := (v_linea->>'producto_id')::uuid;
    v_cant := (v_linea->>'cantidad')::int;
    v_precio := (v_linea->>'precio_unitario')::numeric;

    if v_cant <= 0 then
      raise exception 'Cantidad inválida para producto';
    end if;

    select stock, nombre into v_prod_stock, v_prod_nombre from productos where id = v_prod_id;
    if not found then
      raise exception 'Producto no encontrado';
    end if;

    if v_prod_stock < v_cant then
      raise exception 'Stock insuficiente para "%": disponibles %, solicitados %', v_prod_nombre, v_prod_stock, v_cant;
    end if;

    -- Descontar stock
    update productos set stock = stock - v_cant where id = v_prod_id;

    -- Insertar linea
    insert into detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
    values (p_pedido_id, v_prod_id, v_cant, v_precio);

    v_nuevo_total := v_nuevo_total + (v_cant * v_precio);
  end loop;

  -- 6. Actualizar cliente si vienen datos
  if p_cliente is not null then
    update clientes set
      nombre_empresa = coalesce(p_cliente->>'nombre_empresa', nombre_empresa),
      nombre_contacto = coalesce(p_cliente->>'nombre_contacto', nombre_contacto),
      rif = coalesce(p_cliente->>'rif', rif),
      direccion_fiscal = coalesce(p_cliente->>'direccion_fiscal', direccion_fiscal),
      numero_contacto = coalesce(p_cliente->>'numero_contacto', numero_contacto)
    where id = v_pedido.cliente_id;
  end if;

  -- 7. Actualizar pedido monto y updated_at
  update pedidos set
    monto_total = v_nuevo_total,
    updated_at = now()
  where id = p_pedido_id;

  return jsonb_build_object(
    'ok', true,
    'numero_orden', v_pedido.numero_orden,
    'monto_total', v_nuevo_total
  );
exception
  when others then
    return jsonb_build_object('ok', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = public;
