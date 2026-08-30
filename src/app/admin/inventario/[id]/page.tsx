import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "@/components/admin/producto-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { actualizarProducto, eliminarProducto } from "../actions";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: producto } = await supabase
    .from("productos")
    .select("id, nombre, precio, stock")
    .eq("id", id)
    .single();

  if (!producto) notFound();

  const actualizarConId = actualizarProducto.bind(null, id);
  const eliminarConId = eliminarProducto.bind(null, id);

  return (
    <main className="px-6">
      <Link
        href="/admin/inventario"
        className="text-xs font-semibold uppercase tracking-wide text-[#3c6e82]"
      >
        ← Inventario
      </Link>
      <h2 className="mt-2 font-display text-xl font-bold text-[#1f1b16]">Editar producto</h2>

      <div className="mt-4">
        <ProductoForm
          action={actualizarConId}
          initial={{ nombre: producto.nombre, precio: producto.precio, stock: producto.stock }}
          submitLabel="Guardar cambios"
        />
      </div>

      <form action={eliminarConId} className="mt-4">
        <ConfirmButton
          confirmMessage={`¿Eliminar "${producto.nombre}"? Esta accion no se puede deshacer.`}
          className="w-full rounded-2xl border border-[#e7b7ab] py-3 text-sm font-bold uppercase tracking-wide text-[#b3543f] transition hover:bg-[#f6e4e0]"
        >
          Eliminar producto
        </ConfirmButton>
      </form>
    </main>
  );
}
