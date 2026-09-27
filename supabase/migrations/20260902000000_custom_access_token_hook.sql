-- ============================================================================
-- Auth Hook: meter rol + nombre dentro del JWT de sesion
-- ============================================================================
-- Hoy el middleware hace 2 viajes de red por cada navegacion protegida:
-- getUser() (valida el token) + una consulta a "usuarios" (busca el rol).
-- Con este hook, Supabase Auth llama a esta funcion cada vez que emite o
-- refresca un token, y el rol/nombre quedan ya incluidos en el JWT — asi el
-- middleware los lee gratis (sin red) via getClaims(), en vez de consultar
-- la base de datos aparte.
--
-- No reemplaza RLS: esto es solo para que el middleware decida mas rapido a
-- que pantalla mandar a alguien. Cada consulta real a la base de datos sigue
-- revisando el rol en vivo via es_admin()/RLS, asi que un cambio de rol
-- tarda como mucho hasta el proximo refresh de token en reflejarse aca, pero
-- nunca abre acceso de mas a datos reales.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
  v_rol public.rol_usuario;
  v_nombre text;
begin
  select rol, nombre into v_rol, v_nombre
  from public.usuarios
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if v_rol is not null then
    claims := jsonb_set(claims, '{user_rol}', to_jsonb(v_rol));
    claims := jsonb_set(claims, '{user_nombre}', to_jsonb(v_nombre));
  end if;

  return jsonb_build_object('claims', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
