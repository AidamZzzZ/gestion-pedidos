import { createClient } from "@/lib/supabase/server";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-[#f3e9e2] text-[#8c8579]",
  enviado: "bg-[#e4eef1] text-[#2c5f86]",
  cancelado: "bg-[#f6e4e0] text-[#b3543f]",
};

export default async function PanelPage() {
  const supabase = await createClient();

  const [{ data: resumen }, { data: pedidos }] = await Promise.all([
    supabase.rpc("resumen_admin"),
    supabase
      .from("pedidos")
      .select(
        "id, numero_orden, fecha, estado, monto_total, clientes(nombre_empresa), usuarios(nombre)",
      )
      .order("fecha", { ascending: false }),
  ]);

  const totales = resumen?.[0] ?? { articulos_en_stock: 0, total_vendido: 0 };

  return (
    <main className="px-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
            Artículos en stock
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#1f1b16]">
            {totales.articulos_en_stock}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
            Total vendido
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#1f1b16]">
            {formatoMoneda.format(totales.total_vendido)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
        Pedidos de todos los vendedores
      </h2>

      <div className="mt-3 space-y-2">
        {pedidos && pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#1f1b16]">{pedido.numero_orden}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    ESTADO_COLOR[pedido.estado] ?? "bg-[#f3e9e2] text-[#8c8579]"
                  }`}
                >
                  {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#8c8579]">
                {pedido.clientes?.nombre_empresa} · Vendedor: {pedido.usuarios?.nombre}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-[#9c9589]">
                  {new Date(pedido.fecha).toLocaleDateString("es-VE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm font-bold text-[#1f1b16]">
                  {formatoMoneda.format(pedido.monto_total)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-[#8c8579] shadow-sm">
            Todavia no hay pedidos registrados.
          </p>
        )}
      </div>
    </main>
  );
}
