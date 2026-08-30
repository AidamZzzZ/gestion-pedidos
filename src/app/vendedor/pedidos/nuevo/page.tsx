import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
import { obtenerTasaBcv } from "@/lib/tasa-bcv";
import { NuevoPedidoWizard } from "@/components/vendedor/nuevo-pedido-wizard";

export default async function NuevoPedidoPage() {
  const sesion = await obtenerSesionDeHeaders();
  if (!sesion) redirect("/login");

  const supabase = await createClient();

  const [{ data: productos }, tasa] = await Promise.all([
    supabase.from("productos").select("id, nombre, precio, stock").gt("stock", 0).order("nombre"),
    obtenerTasaBcv(),
  ]);

  return (
    <>
      <div className="px-6 pt-6">
        <Link
          href="/vendedor/pedidos"
          className="text-xs font-semibold uppercase tracking-wide text-[#3c6e82]"
        >
          ← Pedidos
        </Link>
        <h1 className="mt-2 mb-4 font-display text-xl font-bold text-[#1f1b16]">Nuevo pedido</h1>
      </div>

      <NuevoPedidoWizard
        productos={productos ?? []}
        tasa={tasa}
        vendedorNombre={sesion.nombre}
      />
    </>
  );
}
