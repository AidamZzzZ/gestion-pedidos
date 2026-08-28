-- ============================================================================
-- Esquema inicial: Gestion de Pedidos
-- ============================================================================
-- Decision de diseno: la tabla "usuario" pedida incluye una columna de
-- contrasena, pero Supabase Auth (auth.users) ya guarda credenciales
-- hasheadas via GoTrue. Guardar contrasenas propias en una tabla publica
-- seria un riesgo de seguridad grave y redundante. En su lugar:
--   - auth.users maneja correo + contrasena + sesion.
--   - public.usuarios es el "perfil" (1:1 con auth.users por id) y guarda
--     nombre, rol y porcentaje_comision.
-- Un trigger sincroniza auth.users -> public.usuarios al crear la cuenta.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensiones y tipos
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()

create type rol_usuario as enum ('admin', 'vendedor');
create type estado_pedido as enum ('pendiente', 'enviado', 'cancelado');

-- Funcion generica para mantener updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Tabla: usuarios (perfil de auth.users)
-- ---------------------------------------------------------------------------
-- Relacion: 1:1 con auth.users (id compartido). Un usuario tiene un solo rol
-- y, si es vendedor, un porcentaje_comision fijo que se aplica a sus ventas.
create table usuarios (
  id                 uuid primary key references auth.users(id) on delete cascade,
  nombre             text not null,
  correo_electronico text not null unique,
  rol                rol_usuario not null default 'vendedor',
  porcentaje_comision numeric(5,2) not null default 0
                       check (porcentaje_comision >= 0 and porcentaje_comision <= 100),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger usuarios_set_updated_at
  before update on usuarios
  for each row execute function set_updated_at();

-- Crea el perfil automaticamente cuando se registra un usuario en Supabase Auth.
-- El rol/porcentaje_comision se definen despues (por un admin) via update.
create or replace function handle_new_auth_user()
returns trigger as $$
begin
  insert into public.usuarios (id, nombre, correo_electronico)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Tabla: clientes
-- ---------------------------------------------------------------------------
-- Relacion: cada cliente queda asociado al vendedor que lo registro
-- (N clientes : 1 vendedor). El RIF es el identificador fiscal real de la
-- empresa cliente, por eso es unico a nivel global.
create table clientes (
  id               uuid primary key default gen_random_uuid(),
  vendedor_id      uuid not null references usuarios(id),
  nombre_empresa   text not null,
  nombre_contacto  text not null,
  rif              text not null unique,
  direccion_fiscal text not null,
  numero_contacto  text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_clientes_vendedor_id on clientes(vendedor_id);

create trigger clientes_set_updated_at
  before update on clientes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------------------------
-- Stock global controlado por el admin. Se descuenta solo cuando un pedido
-- pasa a estado 'enviado' (ver trigger mas abajo), nunca antes.
create table productos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  precio      numeric(12,2) not null check (precio >= 0),
  stock       integer not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger productos_set_updated_at
  before update on productos
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Tabla: pedidos (cabecera)
-- ---------------------------------------------------------------------------
-- Relacion: N pedidos : 1 cliente, N pedidos : 1 vendedor. Los productos y
-- cantidades viven en detalle_pedido (tabla puente N:M con cantidad), y aqui
-- se guardan los totales agregados para lectura rapida (dashboard admin/
-- vendedor). porcentaje_comision_aplicado guarda una copia del % del
-- vendedor al momento del pedido, para que un cambio futuro en su perfil no
-- altere pedidos ya calculados.
create sequence pedidos_numero_orden_seq start 1;

create table pedidos (
  id                          uuid primary key default gen_random_uuid(),
  numero_orden                text not null unique
                                default ('PED-' || lpad(nextval('pedidos_numero_orden_seq')::text, 6, '0')),
  cliente_id                  uuid not null references clientes(id),
  vendedor_id                 uuid not null references usuarios(id),
  fecha                       timestamptz not null default now(),
  estado                      estado_pedido not null default 'pendiente',
  cantidad_total_productos    integer not null default 0,
  monto_total                 numeric(12,2) not null default 0,
  porcentaje_comision_aplicado numeric(5,2) not null default 0,
  comision_vendedor           numeric(12,2) not null default 0,
  enviado_at                  timestamptz,
  cancelado_at                timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index idx_pedidos_cliente_id on pedidos(cliente_id);
create index idx_pedidos_vendedor_id on pedidos(vendedor_id);
create index idx_pedidos_estado on pedidos(estado);

create trigger pedidos_set_updated_at
  before update on pedidos
  for each row execute function set_updated_at();

-- Al crear el pedido, copiar el % de comision vigente del vendedor.
create or replace function pedidos_set_comision_inicial()
returns trigger as $$
begin
  select porcentaje_comision into new.porcentaje_comision_aplicado
  from usuarios where id = new.vendedor_id;
  return new;
end;
$$ language plpgsql;

create trigger pedidos_before_insert_comision
  before insert on pedidos
  for each row execute function pedidos_set_comision_inicial();

-- Un pedido 'enviado' no se puede editar (solo cancelar); un pedido
-- 'cancelado' queda bloqueado por completo.
create or replace function pedidos_bloquear_edicion()
returns trigger as $$
begin
  if old.estado = 'cancelado' then
    raise exception 'El pedido % esta cancelado y no puede modificarse', old.numero_orden;
  end if;

  if old.estado = 'enviado' then
    if new.estado is distinct from old.estado and new.estado <> 'cancelado' then
      raise exception 'El pedido % ya fue enviado: solo puede cancelarse', old.numero_orden;
    end if;
    if new.estado = old.estado then
      raise exception 'El pedido % ya fue enviado y no puede editarse', old.numero_orden;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- Nombrado "1_" para garantizar que corre antes que pedidos_before_update_2_stock
-- (Postgres ejecuta los triggers BEFORE del mismo evento en orden alfabetico).
create trigger pedidos_before_update_1_bloqueo
  before update on pedidos
  for each row execute function pedidos_bloquear_edicion();

-- ---------------------------------------------------------------------------
-- Tabla: detalle_pedido (productos dentro de un pedido)
-- ---------------------------------------------------------------------------
-- Relacion N:M entre pedidos y productos, con cantidad y precio_unitario
-- "congelado" (copia del precio del producto al momento de anadirlo), para
-- que un cambio de precio futuro no altere pedidos ya hechos.
create table detalle_pedido (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references pedidos(id) on delete cascade,
  producto_id     uuid not null references productos(id),
  cantidad        integer not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  subtotal        numeric(12,2) generated always as (cantidad * precio_unitario) stored,
  created_at      timestamptz not null default now(),
  unique (pedido_id, producto_id)
);

create index idx_detalle_pedido_pedido_id on detalle_pedido(pedido_id);
create index idx_detalle_pedido_producto_id on detalle_pedido(producto_id);

-- Solo se puede agregar/editar/quitar productos mientras el pedido esta
-- 'pendiente' (regla: un pedido enviado no se puede editar).
create or replace function detalle_pedido_validar_estado_pedido()
returns trigger as $$
declare
  v_estado estado_pedido;
  v_pedido_id uuid := coalesce(new.pedido_id, old.pedido_id);
begin
  select estado into v_estado from pedidos where id = v_pedido_id;
  if v_estado <> 'pendiente' then
    raise exception 'No se pueden modificar los productos de un pedido en estado %', v_estado;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger detalle_pedido_before_change
  before insert or update or delete on detalle_pedido
  for each row execute function detalle_pedido_validar_estado_pedido();

-- Auto-copiar el precio vigente del producto al agregar una linea.
create or replace function detalle_pedido_set_precio()
returns trigger as $$
begin
  if new.precio_unitario is null then
    select precio into new.precio_unitario from productos where id = new.producto_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger detalle_pedido_before_insert_precio
  before insert on detalle_pedido
  for each row execute function detalle_pedido_set_precio();

-- Recalcular totales del pedido (cantidad_total_productos, monto_total,
-- comision_vendedor) cada vez que cambian sus lineas de detalle.
create or replace function recalcular_totales_pedido()
returns trigger as $$
declare
  v_pedido_id uuid := coalesce(new.pedido_id, old.pedido_id);
begin
  update pedidos p
  set cantidad_total_productos = coalesce((select sum(d.cantidad) from detalle_pedido d where d.pedido_id = v_pedido_id), 0),
      monto_total               = coalesce((select sum(d.subtotal) from detalle_pedido d where d.pedido_id = v_pedido_id), 0),
      comision_vendedor         = coalesce((select sum(d.subtotal) from detalle_pedido d where d.pedido_id = v_pedido_id), 0)
                                    * p.porcentaje_comision_aplicado / 100
  where p.id = v_pedido_id;
  return null;
end;
$$ language plpgsql;

create trigger detalle_pedido_after_change
  after insert or update or delete on detalle_pedido
  for each row execute function recalcular_totales_pedido();

-- ---------------------------------------------------------------------------
-- Regla de negocio: descuento/devolucion de stock segun cambio de estado
-- ---------------------------------------------------------------------------
-- pendiente -> enviado: valida stock disponible y lo descuenta.
-- enviado -> cancelado: devuelve el stock descontado.
create or replace function pedidos_gestionar_stock()
returns trigger as $$
declare
  r record;
begin
  if old.estado = 'pendiente' and new.estado = 'enviado' then
    for r in select producto_id, cantidad from detalle_pedido where pedido_id = new.id loop
      if (select stock from productos where id = r.producto_id) < r.cantidad then
        raise exception 'Stock insuficiente para el producto % en el pedido %', r.producto_id, new.numero_orden;
      end if;
      update productos set stock = stock - r.cantidad where id = r.producto_id;
    end loop;
    new.enviado_at = now();

  elsif old.estado = 'enviado' and new.estado = 'cancelado' then
    for r in select producto_id, cantidad from detalle_pedido where pedido_id = new.id loop
      update productos set stock = stock + r.cantidad where id = r.producto_id;
    end loop;
    new.cancelado_at = now();
  end if;

  return new;
end;
$$ language plpgsql;

create trigger pedidos_before_update_2_stock
  before update on pedidos
  for each row execute function pedidos_gestionar_stock();

-- ============================================================================
-- Row Level Security
-- ============================================================================
create or replace function es_admin()
returns boolean as $$
  select exists (select 1 from usuarios where id = auth.uid() and rol = 'admin');
$$ language sql stable security definer set search_path = public;

alter table usuarios enable row level security;
alter table clientes enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table detalle_pedido enable row level security;

-- usuarios: cada quien ve su propio perfil; el admin ve y edita todos.
create policy usuarios_select_propio on usuarios
  for select using (id = auth.uid() or es_admin());
create policy usuarios_update_propio on usuarios
  for update using (id = auth.uid() or es_admin());

-- clientes: el vendedor gestiona los suyos; el admin ve todos.
create policy clientes_select on clientes
  for select using (vendedor_id = auth.uid() or es_admin());
create policy clientes_insert on clientes
  for insert with check (vendedor_id = auth.uid() or es_admin());
create policy clientes_update on clientes
  for update using (vendedor_id = auth.uid() or es_admin());

-- productos: todo usuario autenticado puede leer (para armar pedidos);
-- solo el admin crea/edita/borra (control de stock).
create policy productos_select on productos
  for select using (auth.role() = 'authenticated');
create policy productos_admin_write on productos
  for insert with check (es_admin());
create policy productos_admin_update on productos
  for update using (es_admin());
create policy productos_admin_delete on productos
  for delete using (es_admin());

-- pedidos: el vendedor gestiona los suyos; el admin ve/gestiona todos.
create policy pedidos_select on pedidos
  for select using (vendedor_id = auth.uid() or es_admin());
create policy pedidos_insert on pedidos
  for insert with check (vendedor_id = auth.uid() or es_admin());
create policy pedidos_update on pedidos
  for update using (vendedor_id = auth.uid() or es_admin());

-- detalle_pedido: heredado del acceso al pedido padre.
create policy detalle_pedido_select on detalle_pedido
  for select using (
    exists (select 1 from pedidos p where p.id = pedido_id and (p.vendedor_id = auth.uid() or es_admin()))
  );
create policy detalle_pedido_write on detalle_pedido
  for all using (
    exists (select 1 from pedidos p where p.id = pedido_id and (p.vendedor_id = auth.uid() or es_admin()))
  );
