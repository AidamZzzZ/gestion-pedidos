import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";
import { PedidoCard, type PedidoResumen } from "@/components/admin/pedido-card";
import { EmptyState } from "@/components/admin/empty-state";
import { ArchiveBoxIcon, ReceiptIcon, TrendingUpIcon } from "@/components/admin/icons";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

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
        <StatCard
          icon={<ArchiveBoxIcon className="h-5 w-5" />}
          label="Artículos en stock"
          value={String(totales.articulos_en_stock)}
        />
        <StatCard
          icon={<TrendingUpIcon className="h-5 w-5" />}
          label="Total vendido"
          value={formatoMoneda.format(totales.total_vendido)}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          Pedidos de todos los vendedores
        </h2>
        {pedidos && pedidos.length > 0 ? (
          <span className="text-xs font-semibold text-[#9c9589]">{pedidos.length}</span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        {pedidos && pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido as PedidoResumen} />
          ))
        ) : (
          <EmptyState
            icon={<ReceiptIcon className="h-6 w-6" />}
            title="Sin pedidos todavia"
            description="Cuando los vendedores confirmen pedidos, van a aparecer aca."
          />
        )}
      </div>
    </main>
  );
}
