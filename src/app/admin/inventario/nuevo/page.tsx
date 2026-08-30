import Link from "next/link";
import { ProductoForm } from "@/components/admin/producto-form";
import { crearProducto } from "../actions";

export default function NuevoProductoPage() {
  return (
    <main className="px-6">
      <Link
        href="/admin/inventario"
        className="text-xs font-semibold uppercase tracking-wide text-[#3c6e82]"
      >
        ← Inventario
      </Link>
      <h2 className="mt-2 font-display text-xl font-bold text-[#1f1b16]">Nuevo producto</h2>

      <div className="mt-4">
        <ProductoForm action={crearProducto} submitLabel="Crear producto" />
      </div>
    </main>
  );
}
