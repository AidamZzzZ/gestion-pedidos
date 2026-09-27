import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";
import { StatCard } from "@/components/admin/stat-card";
import { PedidoCard, type PedidoResumen } from "@/components/admin/pedido-card";
import { EmptyState } from "@/components/admin/empty-state";
import { PercentIcon, ReceiptIcon, TrendingUpIcon } from "@/components/admin/icons";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default async function PanelVendedorPage() {
  const sesion = await obtenerSesionDeHeaders();
  if (!sesion) redirect("/login");

  const supabase = await createClient();

  const [{ data: resumen }, { data: pedidos }] = await Promise.all([
    supabase.rpc("resumen_vendedor"),
    supabase
      .from("pedidos")
      .select(
        "id, numero_orden, fecha, estado, monto_total, clientes(nombre_empresa), usuarios(nombre)",
      )
      .eq("vendedor_id", sesion.id)
      .order("fecha", { ascending: false }),
  ]);

  const totales = resumen?.[0] ?? {
    total_vendido: 0,
    comision_total: 0,
    pedidos_realizados: 0,
  };

  return (
    <main className="px-6 mt-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingUpIcon className="h-5 w-5" />}
          label="Total vendido"
          value={formatoMoneda.format(totales.total_vendido)}
        />
        <StatCard
          icon={<PercentIcon className="h-5 w-5" />}
          label="Ganancia (comisión)"
          value={formatoMoneda.format(totales.comision_total)}
        />
        <div className="col-span-2">
          <StatCard
            icon={<ReceiptIcon className="h-5 w-5" />}
            label="Pedidos realizados"
            value={String(totales.pedidos_realizados)}
          />
        </div>
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
        Mis pedidos
      </h2>

      <div className="mt-3 space-y-2">
        {pedidos && pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido as PedidoResumen} mostrarVendedor={false} />
          ))
        ) : (
          <EmptyState
            icon={<ReceiptIcon className="h-6 w-6" />}
            title="Sin pedidos todavia"
            description="Cuando hagas tu primer pedido, va a aparecer aca."
          />
        )}
      </div>
    </main>
  );
}
