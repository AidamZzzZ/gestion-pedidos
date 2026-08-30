import Link from "next/link";
import { eliminarProducto } from "@/app/admin/inventario/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TrashIcon } from "@/components/admin/icons";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function ProductoCard({
  producto,
}: {
  producto: { id: string; nombre: string; precio: number; stock: number };
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <Link href={`/admin/inventario/${producto.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#1f1b16]">{producto.nombre}</p>
        <p className="mt-1 text-xs text-[#8c8579]">
          {formatoMoneda.format(producto.precio)} · Stock: {producto.stock}
        </p>
      </Link>
      <form action={eliminarProducto.bind(null, producto.id)}>
        <ConfirmButton
          confirmMessage={`¿Eliminar "${producto.nombre}"? Esta accion no se puede deshacer.`}
          ariaLabel="Eliminar producto"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#b3543f] transition hover:bg-[#f6e4e0]"
        >
          <TrashIcon className="h-4 w-4" />
        </ConfirmButton>
      </form>
    </div>
  );
}
