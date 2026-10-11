"use client";

import { useMemo, useState } from "react";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { CheckCircleIcon, MessageIcon, SearchIcon, TrashIcon } from "@/components/admin/icons";
import { QuantityStepper } from "@/components/vendedor/quantity-stepper";
import { cancelarPedido, modificarPedido } from "@/app/vendedor/pedidos/actions";

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export type CatalogoProducto = {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
};

export type PedidoFila = {
  id: string;
  numero_orden: string;
  fecha: string;
  estado: string;
  monto_total: number;
  clientes: {
    id?: string;
    nombre_empresa: string;
    nombre_contacto?: string | null;
    rif?: string | null;
    direccion_fiscal?: string | null;
    numero_contacto?: string | null;
  } | null;
  usuarios: { nombre: string } | null;
  detalle_pedido?: {
    id: string;
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos: CatalogoProducto | null;
  }[];
};

function normalizarNumeroVenezolano(numero: string) {
  const soloDigitos = numero.replace(/\D/g, "");
  if (soloDigitos.startsWith("58")) return soloDigitos;
  if (soloDigitos.startsWith("0")) return `58${soloDigitos.slice(1)}`;
  return `58${soloDigitos}`;
}

export function PedidoListItem({
  pedido,
  catalogoProductos = [],
  vendedorNombre = "",
}: {
  pedido: PedidoFila;
  catalogoProductos?: CatalogoProducto[];
  vendedorNombre?: string;
}) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoCancelacion, setModoCancelacion] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [eliminado, setEliminado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modificadoExitoso, setModificadoExitoso] = useState(false);

  // Datos locales actualizables del pedido
  const [montoTotalActual, setMontoTotalActual] = useState(pedido.monto_total);
  const [clienteActual, setClienteActual] = useState({
    nombre_empresa: pedido.clientes?.nombre_empresa ?? "",
    nombre_contacto: pedido.clientes?.nombre_contacto ?? "",
    rif: pedido.clientes?.rif ?? "",
    direccion_fiscal: pedido.clientes?.direccion_fiscal ?? "",
    numero_contacto: pedido.clientes?.numero_contacto ?? "",
  });

  // Cantidades originales en este pedido antes de editar
  const cantidadesOriginales = useMemo(() => {
    const mapa: Record<string, number> = {};
    if (pedido.detalle_pedido) {
      for (const d of pedido.detalle_pedido) {
        mapa[d.producto_id] = d.cantidad;
      }
    }
    return mapa;
  }, [pedido.detalle_pedido]);

  // Cantidades editables por ID de producto
  const [cantidades, setCantidades] = useState<Record<string, number>>(() => {
    const mapa: Record<string, number> = {};
    if (pedido.detalle_pedido) {
      for (const d of pedido.detalle_pedido) {
        mapa[d.producto_id] = d.cantidad;
      }
    }
    return mapa;
  });

  // Estado del buscador y filtro en el catálogo
  const [busqueda, setBusqueda] = useState("");
  const [filtroSoloSeleccionados, setFiltroSoloSeleccionados] = useState(false);

  // Mapa de productos del catálogo
  const mapaCatalogo = useMemo(() => {
    return new Map(catalogoProductos.map((p) => [p.id, p]));
  }, [catalogoProductos]);

  // Lista de líneas con cantidad > 0
  const lineasSeleccionadas = useMemo(() => {
    const resultado: {
      producto: CatalogoProducto;
      cantidad: number;
      subtotal: number;
    }[] = [];

    for (const [prodId, cant] of Object.entries(cantidades)) {
      if (cant > 0) {
        const prod = mapaCatalogo.get(prodId);
        if (prod) {
          resultado.push({
            producto: prod,
            cantidad: cant,
            subtotal: prod.precio * cant,
          });
        }
      }
    }
    return resultado;
  }, [mapaCatalogo, cantidades]);

  // Total recalculado
  const totalModificado = useMemo(() => {
    return lineasSeleccionadas.reduce((acc, l) => acc + l.subtotal, 0);
  }, [lineasSeleccionadas]);

  // Calcular stock disponible para un producto (stock actual en catálogo + lo reservado en este pedido)
  function obtenerStockDisponible(prod: CatalogoProducto) {
    const original = cantidadesOriginales[prod.id] ?? 0;
    return prod.stock + original;
  }

  // Filtrado y ordenación de productos en el catálogo
  const productosFiltrados = useMemo(() => {
    let lista = catalogoProductos;

    if (filtroSoloSeleccionados) {
      lista = lista.filter((p) => (cantidades[p.id] ?? 0) > 0);
    }

    const termino = busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(termino));
    }

    // Ordenar: primero los productos que tienen cantidad > 0 en este pedido, luego alfabéticamente
    return [...lista].sort((a, b) => {
      const cantA = (cantidades[a.id] ?? 0) > 0 ? 1 : 0;
      const cantB = (cantidades[b.id] ?? 0) > 0 ? 1 : 0;
      if (cantA !== cantB) return cantB - cantA;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [catalogoProductos, busqueda, filtroSoloSeleccionados, cantidades]);

  function actualizarCantidad(productoId: string, nuevaCantidad: number) {
    setCantidades((prev) => {
      const copia = { ...prev };
      if (nuevaCantidad <= 0) {
        delete copia[productoId];
      } else {
        copia[productoId] = nuevaCantidad;
      }
      return copia;
    });
  }

  async function manejarGuardarModificacion() {
    setError(null);

    if (
      !clienteActual.nombre_empresa.trim() ||
      !clienteActual.nombre_contacto.trim() ||
      !clienteActual.rif.trim() ||
      !clienteActual.direccion_fiscal.trim() ||
      !clienteActual.numero_contacto.trim()
    ) {
      setError("Por favor completa todos los datos del cliente.");
      return;
    }

    if (lineasSeleccionadas.length === 0) {
      setError("Debes incluir al menos un producto con cantidad mayor a 0 en el pedido.");
      return;
    }

    setGuardando(true);

    const res = await modificarPedido({
      pedidoId: pedido.id,
      cliente: clienteActual,
      lineas: lineasSeleccionadas.map((l) => ({
        producto_id: l.producto.id,
        cantidad: l.cantidad,
        precio_unitario: l.producto.precio,
      })),
    });

    setGuardando(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setMontoTotalActual(res.montoTotal);
    setModificadoExitoso(true);
  }

  async function manejarCancelarDefinitivo() {
    setCancelando(true);
    setError(null);

    const res = await cancelarPedido(pedido.id);
    setCancelando(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setEliminado(true);
  }

  function construirMensajeWhatsappCancelado() {
    const separador = "━━━━━━━━━━━━━━━━━━━━";
    const fechaStr = new Date(pedido.fecha).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const lineasTexto = (pedido.detalle_pedido || [])
      .map(
        (l) =>
          `• ${l.productos?.nombre || "Producto"}\n   ${l.cantidad} ud(s) x ${formatoMoneda.format(l.precio_unitario)} = *${formatoMoneda.format(l.subtotal)}*`,
      )
      .join("\n");

    return [
      `❌ *PEDIDO ${pedido.numero_orden} CANCELADO*`,
      separador,
      `📅 ${fechaStr}`,
      "",
      "👤 *CLIENTE*",
      clienteActual.nombre_empresa,
      clienteActual.nombre_contacto ? `Contacto: ${clienteActual.nombre_contacto}` : null,
      clienteActual.rif ? `RIF: ${clienteActual.rif}` : null,
      clienteActual.numero_contacto ? `Teléfono: ${clienteActual.numero_contacto}` : null,
      "",
      "🛒 *PRODUCTOS CANCELADOS*",
      lineasTexto || "Sin detalle de productos",
      "",
      separador,
      `💵 *TOTAL CANCELADO: ${formatoMoneda.format(montoTotalActual)}*`,
      "",
      "ℹ️ *El stock de estos productos fue restituido al inventario.*",
      `🧾 Vendedor: ${vendedorNombre || pedido.usuarios?.nombre || ""}`,
    ]
      .filter((linea) => linea !== null)
      .join("\n");
  }

  function construirMensajeWhatsappModificado() {
    const separador = "━━━━━━━━━━━━━━━━━━━━";
    const fechaStr = new Date(pedido.fecha).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const lineasTexto = lineasSeleccionadas
      .map(
        (l) =>
          `• ${l.producto.nombre}\n   ${l.cantidad} x ${formatoMoneda.format(l.producto.precio)} = *${formatoMoneda.format(l.subtotal)}*`,
      )
      .join("\n");

    return [
      `📦 *PEDIDO ${pedido.numero_orden} (MODIFICADO)*`,
      separador,
      `📅 ${fechaStr}`,
      "",
      "👤 *CLIENTE*",
      clienteActual.nombre_empresa,
      clienteActual.nombre_contacto ? `Contacto: ${clienteActual.nombre_contacto}` : null,
      clienteActual.rif ? `RIF: ${clienteActual.rif}` : null,
      clienteActual.direccion_fiscal ? `Dirección: ${clienteActual.direccion_fiscal}` : null,
      clienteActual.numero_contacto ? `Teléfono: ${clienteActual.numero_contacto}` : null,
      "",
      "🛒 *PRODUCTOS*",
      lineasTexto,
      "",
      separador,
      `💵 *TOTAL: ${formatoMoneda.format(totalModificado || montoTotalActual)}*`,
      "",
      `🧾 Vendedor: ${vendedorNombre || pedido.usuarios?.nombre || ""}`,
    ]
      .filter((linea) => linea !== null)
      .join("\n");
  }

  const estadoActual = pedido.estado;

  const numeroEmpresa = process.env.NEXT_PUBLIC_WHATSAPP_EMPRESA;
  const waEmpresaHref = numeroEmpresa
    ? `https://wa.me/${numeroEmpresa}?text=${encodeURIComponent(construirMensajeWhatsappModificado())}`
    : null;

  const waEmpresaCancelHref = numeroEmpresa
    ? `https://wa.me/${numeroEmpresa}?text=${encodeURIComponent(construirMensajeWhatsappCancelado())}`
    : null;

  const waClienteHref = clienteActual.numero_contacto
    ? `https://wa.me/${normalizarNumeroVenezolano(clienteActual.numero_contacto)}?text=${encodeURIComponent(construirMensajeWhatsappModificado())}`
    : null;

  if (eliminado) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition">
      {/* 1. Vista de Cancelación */}
      {modoCancelacion ? (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f6e4e0] text-[#b3543f]">
            <TrashIcon className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1f1b16]">
              ¿Cancelar y eliminar Pedido {pedido.numero_orden}?
            </h3>
            <p className="mt-1 text-xs text-[#8c8579]">
              Al cancelar, el stock será restituido a la empresa y el pedido se eliminará permanentemente de la base de datos.
            </p>
          </div>

          {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            {waEmpresaCancelHref ? (
              <a
                href={waEmpresaCancelHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={manejarCancelarDefinitivo}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b3543f] py-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#9c4532]"
              >
                <MessageIcon className="h-4 w-4" />
                {cancelando ? "Eliminando..." : "Notificar a la empresa y eliminar"}
              </a>
            ) : (
              <button
                type="button"
                onClick={manejarCancelarDefinitivo}
                disabled={cancelando}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b3543f] py-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#9c4532] disabled:opacity-50"
              >
                {cancelando ? "Eliminando..." : "Confirmar cancelación y eliminar"}
              </button>
            )}

            <button
              type="button"
              disabled={cancelando}
              onClick={() => {
                setError(null);
                setModoCancelacion(false);
              }}
              className="flex-1 rounded-xl border border-black/10 py-3 text-xs font-bold uppercase tracking-wide text-[#1f1b16] transition hover:bg-black/5 disabled:opacity-50"
            >
              Volver
            </button>
          </div>
        </div>
      ) : !modoEdicion ? (
        /* 2. Vista Normal de la tarjeta */
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#1f1b16]">{pedido.numero_orden}</p>
              <p className="text-xs text-[#8c8579]">{clienteActual.nombre_empresa}</p>
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
              {formatoMoneda.format(montoTotalActual)}
            </p>
          </div>

          {estadoActual === "enviado" ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setModificadoExitoso(false);
                  setError(null);
                  setBusqueda("");
                  setFiltroSoloSeleccionados(false);
                  setModoEdicion(true);
                }}
                className="flex-1 rounded-xl border border-[#3c6e82] py-2 text-xs font-bold uppercase tracking-wide text-[#3c6e82] transition hover:bg-[#e4eef1]"
              >
                Modificar pedido
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setModoCancelacion(true);
                }}
                disabled={cancelando}
                className="flex-1 rounded-xl border border-[#e7b7ab] py-2 text-xs font-bold uppercase tracking-wide text-[#b3543f] transition hover:bg-[#f6e4e0] disabled:opacity-50"
              >
                Cancelar pedido
              </button>
            </div>
          ) : null}
        </>
      ) : modificadoExitoso ? (
        /* 2. Vista posterior a la modificación: Enviar por WhatsApp */
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e4eef1] text-[#2c5f86]">
            <CheckCircleIcon className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1f1b16]">
              Pedido {pedido.numero_orden} modificado
            </h3>
            <p className="mt-1 text-xs text-[#8c8579]">
              Los cambios han sido guardados y el stock recalculado. Ya puedes enviar el pedido
              actualizado:
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {waEmpresaHref ? (
              <a
                href={waEmpresaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3c6e82] py-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71]"
              >
                <MessageIcon className="h-4 w-4" />
                Enviar a la empresa
              </a>
            ) : null}

            {waClienteHref ? (
              <a
                href={waClienteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#3c6e82] py-3 text-xs font-bold uppercase tracking-wide text-[#3c6e82] transition hover:bg-[#e4eef1]"
              >
                <MessageIcon className="h-4 w-4" />
                Enviar al cliente
              </a>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setModoEdicion(false)}
            className="w-full rounded-xl border border-black/10 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1f1b16] transition hover:bg-black/5"
          >
            Listo
          </button>
        </div>
      ) : (
        /* 3. Vista de Modificación con el componente normal de selección de productos */
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <div>
              <p className="text-sm font-bold text-[#1f1b16]">
                Modificando Pedido {pedido.numero_orden}
              </p>
              <p className="text-xs text-[#8c8579]">
                Ajusta los datos del cliente o modifica cantidades de productos.
              </p>
            </div>
            <EstadoBadge estado={estadoActual} />
          </div>

          {/* Información del Cliente (Disposición Horizontal) */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#9c9589]">
              Información del Cliente
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#8c8579]">
                  Empresa
                </label>
                <input
                  type="text"
                  value={clienteActual.nombre_empresa}
                  onChange={(e) =>
                    setClienteActual((prev) => ({ ...prev, nombre_empresa: e.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f6] px-3 py-2 text-xs font-medium text-[#1f1b16] outline-none ring-[#3c6e82] focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#8c8579]">
                  Contacto
                </label>
                <input
                  type="text"
                  value={clienteActual.nombre_contacto}
                  onChange={(e) =>
                    setClienteActual((prev) => ({ ...prev, nombre_contacto: e.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f6] px-3 py-2 text-xs font-medium text-[#1f1b16] outline-none ring-[#3c6e82] focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#8c8579]">
                  RIF
                </label>
                <input
                  type="text"
                  value={clienteActual.rif}
                  onChange={(e) =>
                    setClienteActual((prev) => ({ ...prev, rif: e.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f6] px-3 py-2 text-xs font-medium text-[#1f1b16] outline-none ring-[#3c6e82] focus:ring-2"
                />
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#8c8579]">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={clienteActual.numero_contacto}
                  onChange={(e) =>
                    setClienteActual((prev) => ({ ...prev, numero_contacto: e.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f6] px-3 py-2 text-xs font-medium text-[#1f1b16] outline-none ring-[#3c6e82] focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#8c8579]">
                  Dirección Fiscal
                </label>
                <input
                  type="text"
                  value={clienteActual.direccion_fiscal}
                  onChange={(e) =>
                    setClienteActual((prev) => ({ ...prev, direccion_fiscal: e.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f6] px-3 py-2 text-xs font-medium text-[#1f1b16] outline-none ring-[#3c6e82] focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Componente Normal de Selección y Modificación de Productos */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[#9c9589]">
                Productos del Pedido
              </p>
              <span className="text-[11px] font-semibold text-[#3c6e82]">
                {lineasSeleccionadas.length} producto(s) en este pedido
              </span>
            </div>

            {/* Buscador de productos */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#9c9589]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto por nombre..."
                className="w-full rounded-2xl border border-black/5 bg-[#faf8f6] py-2.5 pr-4 pl-10 text-xs font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
              />
            </div>

            {/* Filtros rápidos: Todos vs En el pedido */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFiltroSoloSeleccionados(false)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    !filtroSoloSeleccionados
                      ? "bg-[#3c6e82] text-white"
                      : "bg-[#f3e9e2] text-[#1f1b16] hover:bg-[#eadecf]"
                  }`}
                >
                  Todos ({catalogoProductos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSoloSeleccionados(true)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    filtroSoloSeleccionados
                      ? "bg-[#3c6e82] text-white"
                      : "bg-[#f3e9e2] text-[#1f1b16] hover:bg-[#eadecf]"
                  }`}
                >
                  En el pedido ({lineasSeleccionadas.length})
                </button>
              </div>

              {busqueda ? (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="text-[11px] font-medium text-[#8c8579] hover:underline"
                >
                  Limpiar búsqueda
                </button>
              ) : null}
            </div>

            {/* Lista scrollable de productos con el componente de agregador de stock */}
            <div className="mt-2.5 max-h-[48vh] space-y-2 overflow-y-auto pr-1">
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((producto) => {
                  const cantidad = cantidades[producto.id] ?? 0;
                  const stockDisp = obtenerStockDisponible(producto);
                  const estaSeleccionado = cantidad > 0;

                  return (
                    <div
                      key={producto.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition ${
                        estaSeleccionado
                          ? "border-[#3c6e82]/40 bg-[#faf8f6]"
                          : "border-black/5 bg-white"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#1f1b16]">
                          {producto.nombre}
                        </p>
                        <p className="text-[11px] text-[#8c8579]">
                          {formatoMoneda.format(producto.precio)} · Stock: {stockDisp}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Agregador de stock mediante teclado numérico */}
                        <QuantityStepper
                          value={cantidad}
                          max={stockDisp}
                          onChange={(nuevaCant) =>
                            actualizarCantidad(producto.id, nuevaCant)
                          }
                        />

                        {/* Botón directo para eliminar del pedido */}
                        {estaSeleccionado ? (
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(producto.id, 0)}
                            title="Eliminar producto del pedido"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          >
                            ✕
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl bg-[#faf8f6] py-6 text-center text-xs text-[#8c8579]">
                  No se encontraron productos con ese nombre.
                </p>
              )}
            </div>
          </div>

          {/* Resumen Total Modificado */}
          <div className="flex items-center justify-between rounded-2xl bg-[#f3e9e2] px-4 py-3">
            <div>
              <span className="block text-xs font-bold text-[#8c8579]">
                {lineasSeleccionadas.length} producto(s) en total
              </span>
              <span className="text-[11px] text-[#9c9589]">Total modificado</span>
            </div>
            <span className="font-display text-lg font-bold text-[#1f1b16]">
              {formatoMoneda.format(totalModificado)}
            </span>
          </div>

          {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

          {/* Botones de Acción */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              disabled={guardando}
              onClick={() => {
                // Restaurar cantidades originales al cancelar
                const mapaRestaurar: Record<string, number> = {};
                if (pedido.detalle_pedido) {
                  for (const d of pedido.detalle_pedido) {
                    mapaRestaurar[d.producto_id] = d.cantidad;
                  }
                }
                setCantidades(mapaRestaurar);
                setModoEdicion(false);
              }}
              className="flex-1 rounded-xl border border-black/10 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1f1b16] transition hover:bg-black/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando || lineasSeleccionadas.length === 0}
              onClick={manejarGuardarModificacion}
              className="flex-1 rounded-xl bg-[#3c6e82] py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71] disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Aceptar modificación"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
