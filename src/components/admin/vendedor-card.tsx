import Link from "next/link";
import { eliminarVendedor } from "@/app/admin/vendedores/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TrashIcon } from "@/components/admin/icons";

export function VendedorCard({
  vendedor,
}: {
  vendedor: {
    id: string;
    nombre: string;
    correo_electronico: string;
    porcentaje_comision: number;
  };
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <Link href={`/admin/vendedores/${vendedor.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#1f1b16]">{vendedor.nombre}</p>
        <p className="mt-1 truncate text-xs text-[#8c8579]">
          {vendedor.correo_electronico} · {vendedor.porcentaje_comision}% comision
        </p>
      </Link>
      <form action={eliminarVendedor.bind(null, vendedor.id)}>
        <ConfirmButton
          confirmMessage={`¿Eliminar a "${vendedor.nombre}"? Perdera acceso al sistema. Esta accion no se puede deshacer.`}
          ariaLabel="Eliminar vendedor"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#b3543f] transition hover:bg-[#f6e4e0]"
        >
          <TrashIcon className="h-4 w-4" />
        </ConfirmButton>
      </form>
    </div>
  );
}
