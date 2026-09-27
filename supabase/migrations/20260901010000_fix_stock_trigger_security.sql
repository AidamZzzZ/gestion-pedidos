-- ============================================================================
-- Fix: el stock no se descontaba/devolvia cuando confirmaba/cancelaba un
-- vendedor real (solo funcionaba corrido como superusuario de Postgres)
-- ============================================================================
-- pedidos_gestionar_stock() hace "update productos set stock = ...", pero las
-- politicas RLS de "productos" solo permiten UPDATE a es_admin(). La funcion
-- corria con los privilegios de quien confirma/cancela el pedido (un
-- vendedor, no un admin), asi que esa escritura quedaba bloqueada en
-- silencio: sin error, pero sin efecto. Nunca se detecto en las pruebas
-- previas porque se corrieron como superusuario, que se salta RLS por
-- completo.
--
-- La funcion pasa a SECURITY DEFINER (corre con los privilegios de quien la
-- creo, no de quien confirma el pedido) para poder ajustar el stock como
-- efecto controlado de una transicion de estado valida del pedido, sin
-- abrirle a los vendedores un UPDATE directo sobre "productos".

alter function public.pedidos_gestionar_stock() security definer set search_path = public;
