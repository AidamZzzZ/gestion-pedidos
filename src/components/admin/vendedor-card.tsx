import Link from "next/link";
import { eliminarVendedor } from "@/app/admin/vendedores/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TrashIcon } from "@/components/admin/icons";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function VendedorCard({
  vendedor,
  resumen,
}: {
  vendedor: {
    id: string;
    nombre: string;
    correo_electronico: string;
    porcentaje_comision: number;
  };
  resumen?: {
    total_vendido: number;
    comision_total: number;
    pedidos_realizados: number;
  };
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
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

      {resumen ? (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-black/5 pt-3 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9c9589]">
              Vendido
            </p>
            <p className="text-sm font-bold text-[#1f1b16]">
              {formatoMoneda.format(resumen.total_vendido)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9c9589]">
              Comisión
            </p>
            <p className="text-sm font-bold text-[#1f1b16]">
              {formatoMoneda.format(resumen.comision_total)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9c9589]">
              Pedidos
            </p>
            <p className="text-sm font-bold text-[#1f1b16]">{resumen.pedidos_realizados}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
