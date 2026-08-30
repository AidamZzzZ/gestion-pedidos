"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { crearPedidoCompleto, type DatosCliente } from "@/app/vendedor/pedidos/actions";
import { formatoBs, type TasaBcv } from "@/lib/tasa-bcv";
import { CheckCircleIcon, MessageIcon, SearchIcon } from "@/components/admin/icons";
import { QuantityStepper } from "@/components/vendedor/quantity-stepper";

type Producto = { id: string; nombre: string; precio: number; stock: number };

const formatoMoneda = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const CLIENTE_VACIO: DatosCliente = {
  nombre_empresa: "",
  nombre_contacto: "",
  rif: "",
  direccion_fiscal: "",
  numero_contacto: "",
};

const PASOS = [
  { numero: 1, titulo: "Datos del cliente" },
  { numero: 2, titulo: "Productos" },
  { numero: 3, titulo: "Verificación" },
] as const;

function CampoTexto({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
      />
    </label>
  );
}

export function NuevoPedidoWizard({
  productos,
  tasa,
  vendedorNombre,
}: {
  productos: Producto[];
  tasa: TasaBcv | null;
  vendedorNombre: string;
}) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [cliente, setCliente] = useState<DatosCliente>(CLIENTE_VACIO);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [busqueda, setBusqueda] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numeroOrden, setNumeroOrden] = useState<string | null>(null);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(termino));
  }, [productos, busqueda]);

  const lineas = useMemo(
    () =>
      productos
        .filter((p) => (cantidades[p.id] ?? 0) > 0)
        .map((p) => ({ producto: p, cantidad: cantidades[p.id] })),
    [productos, cantidades],
  );

  const total = lineas.reduce((acc, l) => acc + l.producto.precio * l.cantidad, 0);
  const totalBs = tasa ? total * tasa.promedio : null;

  const clienteCompleto = Object.values(cliente).every((v) => v.trim() !== "");

  function actualizarCantidad(producto: Producto, cantidad: number) {
    const limitada = Math.max(0, Math.min(cantidad, producto.stock));
    setCantidades((prev) => ({ ...prev, [producto.id]: limitada }));
  }

  function construirMensajeWhatsapp(numero: string) {
    const separador = "━━━━━━━━━━━━━━━━━━━━";
    const fecha = new Date().toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const lineasTexto = lineas
      .map(
        (l) =>
          `• ${l.producto.nombre}\n   ${l.cantidad} x ${formatoMoneda.format(l.producto.precio)} = *${formatoMoneda.format(l.producto.precio * l.cantidad)}*`,
      )
      .join("\n");

    return [
      `📦 *PEDIDO ${numero}*`,
      separador,
      `📅 ${fecha}`,
      "",
      "👤 *CLIENTE*",
      cliente.nombre_empresa,
      `Contacto: ${cliente.nombre_contacto}`,
      `RIF: ${cliente.rif}`,
      `Dirección: ${cliente.direccion_fiscal}`,
      `Teléfono: ${cliente.numero_contacto}`,
      "",
      "🛒 *PRODUCTOS*",
      lineasTexto,
      "",
      separador,
      `💵 *TOTAL: ${formatoMoneda.format(total)}*`,
      totalBs ? `🇻🇪 Bs ${formatoBs.format(totalBs)}` : null,
      "",
      `🧾 Vendedor: ${vendedorNombre}`,
    ]
      .filter((linea) => linea !== null)
      .join("\n");
  }

  function abrirWhatsapp(numero: string) {
    const numeroWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_EMPRESA;
    if (!numeroWhatsapp) return;
    const href = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(construirMensajeWhatsapp(numero))}`;
    window.open(href, "_blank");
  }

  async function confirmarPedido() {
    setEnviando(true);
    setError(null);

    const resultado = await crearPedidoCompleto({
      cliente,
      lineas: lineas.map((l) => ({
        producto_id: l.producto.id,
        cantidad: l.cantidad,
        precio_unitario: l.producto.precio,
      })),
    });

    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    setNumeroOrden(resultado.numeroOrden);
    // Intento automatico: si el navegador bloquea el popup por venir despues
    // de un await, el boton "Enviar por WhatsApp" de abajo sigue funcionando.
    abrirWhatsapp(resultado.numeroOrden);
  }

  if (numeroOrden) {
    const numeroWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_EMPRESA;
    const waHref = numeroWhatsapp
      ? `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(construirMensajeWhatsapp(numeroOrden))}`
      : null;

    return (
      <main className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e4eef1] text-[#2c5f86]">
          <CheckCircleIcon className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-[#1f1b16]">
          Pedido {numeroOrden} confirmado
        </h2>
        <p className="text-sm text-[#8c8579]">
          El pedido ya quedo guardado en tu historial y el stock fue descontado.
        </p>

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-[#3c6e82] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71]"
          >
            <MessageIcon className="h-4 w-4" />
            Enviar por WhatsApp
          </a>
        ) : (
          <p className="text-xs text-[#b3543f]">
            Falta configurar el numero de WhatsApp de la empresa (NEXT_PUBLIC_WHATSAPP_EMPRESA).
          </p>
        )}

        <Link
          href="/vendedor/pedidos"
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#3c6e82]"
        >
          Ver mis pedidos
        </Link>
      </main>
    );
  }

  return (
    <main className="px-6 pb-10">
      <div className="flex items-center gap-2">
        {PASOS.map((p) => (
          <div key={p.numero} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                p.numero <= paso ? "bg-[#3c6e82]" : "bg-[#e5e1db]"
              }`}
            />
            <p
              className={`mt-1.5 text-[10px] font-bold uppercase tracking-wide ${
                p.numero === paso ? "text-[#3c6e82]" : "text-[#9c9589]"
              }`}
            >
              {p.numero}. {p.titulo}
            </p>
          </div>
        ))}
      </div>

      {paso === 1 ? (
        <div className="mt-6 space-y-4">
          <CampoTexto
            label="Nombre de la empresa"
            value={cliente.nombre_empresa}
            onChange={(v) => setCliente((c) => ({ ...c, nombre_empresa: v }))}
          />
          <CampoTexto
            label="RIF"
            value={cliente.rif}
            onChange={(v) => setCliente((c) => ({ ...c, rif: v }))}
          />
          <CampoTexto
            label="Dirección fiscal"
            value={cliente.direccion_fiscal}
            onChange={(v) => setCliente((c) => ({ ...c, direccion_fiscal: v }))}
          />
          <CampoTexto
            label="Nombre de contacto"
            value={cliente.nombre_contacto}
            onChange={(v) => setCliente((c) => ({ ...c, nombre_contacto: v }))}
          />
          <CampoTexto
            label="Número de contacto"
            value={cliente.numero_contacto}
            onChange={(v) => setCliente((c) => ({ ...c, numero_contacto: v }))}
          />

          <button
            type="button"
            disabled={!clienteCompleto}
            onClick={() => setPaso(2)}
            className="w-full rounded-2xl bg-[#3c6e82] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71] disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}

      {paso === 2 ? (
        <div className="mt-6">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9c9589]" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full rounded-2xl bg-white py-3 pr-4 pl-10 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
            />
          </div>

          <div className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto">
            {productosFiltrados.map((producto) => {
              const cantidad = cantidades[producto.id] ?? 0;
              return (
                <div
                  key={producto.id}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1f1b16]">{producto.nombre}</p>
                    <p className="text-xs text-[#8c8579]">
                      {formatoMoneda.format(producto.precio)} · Stock: {producto.stock}
                    </p>
                  </div>
                  <QuantityStepper
                    value={cantidad}
                    max={producto.stock}
                    onChange={(nuevoValor) => actualizarCantidad(producto, nuevoValor)}
                  />
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-24 mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8c8579]">{lineas.length} producto(s) seleccionados</span>
              <span className="font-display font-bold text-[#1f1b16]">
                {formatoMoneda.format(total)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="flex-1 rounded-2xl border border-black/10 py-4 text-sm font-bold uppercase tracking-wide text-[#1f1b16]"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={lineas.length === 0}
              onClick={() => setPaso(3)}
              className="flex-1 rounded-2xl bg-[#3c6e82] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71] disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}

      {paso === 3 ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">Cliente</p>
            <p className="mt-1 text-sm font-bold text-[#1f1b16]">{cliente.nombre_empresa}</p>
            <p className="text-xs text-[#8c8579]">
              {cliente.nombre_contacto} · RIF {cliente.rif}
            </p>
            <p className="text-xs text-[#8c8579]">{cliente.direccion_fiscal}</p>
            <p className="text-xs text-[#8c8579]">{cliente.numero_contacto}</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
              Productos
            </p>
            <div className="divide-y divide-black/5">
              {lineas.map((l) => (
                <div key={l.producto.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#1f1b16]">{l.producto.nombre}</p>
                    <p className="text-xs text-[#8c8579]">
                      {l.cantidad} x {formatoMoneda.format(l.producto.precio)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#1f1b16]">
                    {formatoMoneda.format(l.producto.precio * l.cantidad)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-3">
              <p className="text-sm font-bold text-[#1f1b16]">Total</p>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-[#1f1b16]">
                  {formatoMoneda.format(total)}
                </p>
                {totalBs ? (
                  <p className="text-xs text-[#8c8579]">Bs {formatoBs.format(totalBs)}</p>
                ) : null}
              </div>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaso(2)}
              disabled={enviando}
              className="flex-1 rounded-2xl border border-black/10 py-4 text-sm font-bold uppercase tracking-wide text-[#1f1b16] disabled:opacity-40"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={confirmarPedido}
              disabled={enviando}
              className="flex-1 rounded-2xl bg-[#3c6e82] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71] disabled:opacity-60"
            >
              {enviando ? "Confirmando..." : "Confirmar pedido"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
