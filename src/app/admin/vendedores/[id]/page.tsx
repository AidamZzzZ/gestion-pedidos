import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendedorForm } from "@/components/admin/vendedor-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { actualizarVendedor, eliminarVendedor } from "../actions";

export default async function EditarVendedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vendedor } = await supabase
    .from("usuarios")
    .select("id, nombre, correo_electronico, porcentaje_comision, rol")
    .eq("id", id)
    .single();

  if (!vendedor || vendedor.rol !== "vendedor") notFound();

  const actualizarConId = actualizarVendedor.bind(null, id);
  const eliminarConId = eliminarVendedor.bind(null, id);

  return (
    <main className="px-6">
      <Link
        href="/admin/vendedores"
        className="text-xs font-semibold uppercase tracking-wide text-[#3c6e82]"
      >
        ← Vendedores
      </Link>
      <h2 className="mt-2 font-display text-xl font-bold text-[#1f1b16]">Editar vendedor</h2>

      <div className="mt-4">
        <VendedorForm
          action={actualizarConId}
          mode="editar"
          initial={{ nombre: vendedor.nombre, porcentaje_comision: vendedor.porcentaje_comision }}
          correo={vendedor.correo_electronico}
          submitLabel="Guardar cambios"
        />
      </div>

      <form action={eliminarConId} className="mt-4">
        <ConfirmButton
          confirmMessage={`¿Eliminar a "${vendedor.nombre}"? Perdera acceso al sistema. Esta accion no se puede deshacer.`}
          className="w-full rounded-2xl border border-[#e7b7ab] py-3 text-sm font-bold uppercase tracking-wide text-[#b3543f] transition hover:bg-[#f6e4e0]"
        >
          Eliminar vendedor
        </ConfirmButton>
      </form>
    </main>
  );
}
