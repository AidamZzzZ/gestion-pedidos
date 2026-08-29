import { EstadoBadge } from "./estado-badge";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export type PedidoResumen = {
  id: string;
  numero_orden: string;
  fecha: string;
  estado: string;
  monto_total: number;
  clientes: { nombre_empresa: string } | null;
  usuarios: { nombre: string } | null;
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export function PedidoCard({ pedido }: { pedido: PedidoResumen }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3e9e2] text-xs font-bold text-[#7c8a66]">
            {iniciales(pedido.usuarios?.nombre ?? "?")}
          </div>
          <div>
            <p className="text-sm font-bold text-[#1f1b16]">{pedido.numero_orden}</p>
            <p className="text-xs text-[#8c8579]">{pedido.clientes?.nombre_empresa}</p>
          </div>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
        <div>
          <p className="text-xs font-medium text-[#9c9589]">{pedido.usuarios?.nombre}</p>
          <p className="text-xs text-[#9c9589]">
            {new Date(pedido.fecha).toLocaleDateString("es-VE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <p className="font-display text-base font-bold text-[#1f1b16]">
          {formatoMoneda.format(pedido.monto_total)}
        </p>
      </div>
    </div>
  );
}
