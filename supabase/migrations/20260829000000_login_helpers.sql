-- ============================================================================
-- Helpers de solo lectura para la pantalla de login
-- ============================================================================
-- El login muestra nombres de cuenta (no correos) en un selector, antes de que
-- exista sesion. RLS en "usuarios" exige auth.uid() = id o es_admin(), asi que
-- un visitante anonimo no puede leer la tabla directamente (ni deberia poder
-- leer contrasenas/correos en bloque). Estas funciones exponen exactamente lo
-- necesario para el selector y para resolver el correo real al momento de
-- autenticar, sin abrir la tabla completa.

create or replace function public.listar_vendedores_login()
returns table (id uuid, nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select id, nombre from usuarios where rol = 'vendedor' order by nombre;
$$;

create or replace function public.obtener_admin_login()
returns table (id uuid, nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select id, nombre from usuarios where rol = 'admin' order by created_at limit 1;
$$;

create or replace function public.resolver_correo_login(p_usuario_id uuid, p_rol rol_usuario)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select correo_electronico from usuarios where id = p_usuario_id and rol = p_rol;
$$;

grant execute on function public.listar_vendedores_login() to anon, authenticated;
grant execute on function public.obtener_admin_login() to anon, authenticated;
grant execute on function public.resolver_correo_login(uuid, rol_usuario) to anon, authenticated;
