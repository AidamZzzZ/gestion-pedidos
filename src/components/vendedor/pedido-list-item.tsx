"use client";

import { useState } from "react";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { cancelarPedido } from "@/app/vendedor/pedidos/actions";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

type PedidoFila = {
  id: string;
  numero_orden: string;
  fecha: string;
  estado: string;
  monto_total: number;
  clientes: { nombre_empresa: string } | null;
  usuarios: { nombre: string } | null;
};

export function PedidoListItem({ pedido }: { pedido: PedidoFila }) {
  const [cancelando, setCancelando] = useState(false);
  const [cancelado, setCancelado] = useState(false);
  const estadoActual = cancelado ? "cancelado" : pedido.estado;

  async function manejarCancelar() {
    if (!confirm(`¿Cancelar el pedido ${pedido.numero_orden}? Esto devuelve el stock.`)) return;

    setCancelando(true);
    await cancelarPedido(pedido.id);
    setCancelando(false);
    setCancelado(true);

    const numeroWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_EMPRESA;
    if (numeroWhatsapp) {
      const mensaje = [
        `❌ *PEDIDO ${pedido.numero_orden} CANCELADO*`,
        "━━━━━━━━━━━━━━━━━━━━",
        "",
        `👤 Cliente: ${pedido.clientes?.nombre_empresa ?? ""}`,
        `💵 Monto: ${formatoMoneda.format(pedido.monto_total)}`,
        "",
        "El stock de este pedido fue restituido.",
      ].join("\n");
      window.open(`https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`, "_blank");
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#1f1b16]">{pedido.numero_orden}</p>
          <p className="text-xs text-[#8c8579]">{pedido.clientes?.nombre_empresa}</p>
        </div>
        <EstadoBadge estado={estadoActual} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
        <p className="text-xs text-[#9c9589]">
          {new Date(pedido.fecha).toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <p className="font-display text-base font-bold text-[#1f1b16]">
          {formatoMoneda.format(pedido.monto_total)}
        </p>
      </div>

      {estadoActual === "enviado" ? (
        <button
          type="button"
          onClick={manejarCancelar}
          disabled={cancelando}
          className="mt-3 w-full rounded-xl border border-[#e7b7ab] py-2 text-xs font-bold uppercase tracking-wide text-[#b3543f] transition hover:bg-[#f6e4e0] disabled:opacity-50"
        >
          {cancelando ? "Cancelando..." : "Cancelar pedido"}
        </button>
      ) : null}
    </div>
  );
}
