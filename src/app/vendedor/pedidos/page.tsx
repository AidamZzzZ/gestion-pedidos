import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
import { EmptyState } from "@/components/admin/empty-state";
import { ReceiptIcon } from "@/components/admin/icons";
import { PedidoListItem } from "@/components/vendedor/pedido-list-item";

export default async function PedidosPage() {
  const sesion = await obtenerSesionDeHeaders();
  if (!sesion) redirect("/login");

  const supabase = await createClient();
  const [{ data: pedidos }, { data: productos }] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        `id, numero_orden, fecha, estado, monto_total,
         clientes (
           id, nombre_empresa, nombre_contacto, rif, direccion_fiscal, numero_contacto
         ),
         usuarios (nombre),
         detalle_pedido (
           id, producto_id, cantidad, precio_unitario, subtotal,
           productos (id, nombre, precio, stock)
         )`,
      )
      .eq("vendedor_id", sesion.id)
      .neq("estado", "cancelado")
      .order("fecha", { ascending: false }),
    supabase.from("productos").select("id, nombre, precio, stock").order("nombre"),
  ]);

  return (
    <main className="px-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-[#1f1b16]">Pedidos</h2>
        <Link
          href="/vendedor/pedidos/nuevo"
          className="rounded-full bg-[#3c6e82] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71]"
        >
          + Agregar pedido
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {pedidos && pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <PedidoListItem
              key={pedido.id}
              pedido={pedido as unknown as Parameters<typeof PedidoListItem>[0]["pedido"]}
              catalogoProductos={productos ?? []}
              vendedorNombre={sesion.nombre}
            />
          ))
        ) : (
          <EmptyState
            icon={<ReceiptIcon className="h-6 w-6" />}
            title="Sin pedidos todavia"
            description="Toca '+ Agregar pedido' para crear el primero."
          />
        )}
      </div>
    </main>
  );
}

