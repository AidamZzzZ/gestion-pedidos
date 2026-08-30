"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerSesionDeHeaders } from "@/lib/auth/sesion";

export type DatosCliente = {
  nombre_empresa: string;
  nombre_contacto: string;
  rif: string;
  direccion_fiscal: string;
  numero_contacto: string;
};

export type LineaPedido = { producto_id: string; cantidad: number; precio_unitario: number };

export type NuevoPedidoInput = {
  cliente: DatosCliente;
  lineas: LineaPedido[];
};

export type NuevoPedidoResultado =
  | { ok: true; numeroOrden: string }
  | { ok: false; error: string };

export async function crearPedidoCompleto(
  input: NuevoPedidoInput,
): Promise<NuevoPedidoResultado> {
  const cliente: DatosCliente = {
    nombre_empresa: input.cliente.nombre_empresa.trim(),
    nombre_contacto: input.cliente.nombre_contacto.trim(),
    rif: input.cliente.rif.trim(),
    direccion_fiscal: input.cliente.direccion_fiscal.trim(),
    numero_contacto: input.cliente.numero_contacto.trim(),
  };

  if (
    !cliente.nombre_empresa ||
    !cliente.nombre_contacto ||
    !cliente.rif ||
    !cliente.direccion_fiscal ||
    !cliente.numero_contacto
  ) {
    return { ok: false, error: "Faltan datos del cliente." };
  }

  if (input.lineas.length === 0) {
    return { ok: false, error: "Agrega al menos un producto al pedido." };
  }
  for (const linea of input.lineas) {
    if (!Number.isInteger(linea.cantidad) || linea.cantidad <= 0) {
      return { ok: false, error: "Hay una cantidad invalida entre los productos elegidos." };
    }
    if (!Number.isFinite(linea.precio_unitario) || linea.precio_unitario < 0) {
      return { ok: false, error: "Hay un precio invalido entre los productos elegidos." };
    }
  }

  const sesion = await obtenerSesionDeHeaders();
  if (!sesion || sesion.rol !== "vendedor") {
    return { ok: false, error: "Tu sesion no es valida, vuelve a iniciar sesion." };
  }

  const supabase = await createClient();

  // 1. Cliente: reusar uno ya registrado por este vendedor con el mismo RIF
  // (el RIF es unico a nivel global), o crear uno nuevo.
  const { data: existente } = await supabase
    .from("clientes")
    .select("id")
    .eq("rif", cliente.rif)
    .maybeSingle();

  let clienteId: string;

  if (existente) {
    const { error: updateError } = await supabase
      .from("clientes")
      .update({
        nombre_empresa: cliente.nombre_empresa,
        nombre_contacto: cliente.nombre_contacto,
        direccion_fiscal: cliente.direccion_fiscal,
        numero_contacto: cliente.numero_contacto,
      })
      .eq("id", existente.id);

    if (updateError) return { ok: false, error: "No se pudo actualizar el cliente." };
    clienteId = existente.id;
  } else {
    const { data: nuevo, error: insertError } = await supabase
      .from("clientes")
      .insert({ vendedor_id: sesion.id, ...cliente })
      .select("id")
      .single();

    if (insertError || !nuevo) {
      if (insertError?.code === "23505") {
        return { ok: false, error: "Ese RIF ya esta registrado (por ti o por otro vendedor)." };
      }
      return { ok: false, error: "No se pudo guardar el cliente." };
    }
    clienteId = nuevo.id;
  }

  // 2. Pedido (queda "pendiente" por default).
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({ cliente_id: clienteId, vendedor_id: sesion.id })
    .select("id, numero_orden")
    .single();

  if (pedidoError || !pedido) {
    return { ok: false, error: "No se pudo crear el pedido." };
  }

  // 3. Lineas del pedido.
  const { error: detalleError } = await supabase.from("detalle_pedido").insert(
    input.lineas.map((linea) => ({
      pedido_id: pedido.id,
      producto_id: linea.producto_id,
      cantidad: linea.cantidad,
      precio_unitario: linea.precio_unitario,
    })),
  );

  if (detalleError) {
    // El pedido quedo sin productos: lo borramos para no dejar basura (sigue
    // "pendiente" asi que todavia no se toco el stock).
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    return { ok: false, error: "No se pudieron guardar los productos del pedido." };
  }

  // 4. Confirmar el pedido: dispara el trigger que valida y descuenta stock.
  const { error: confirmarError } = await supabase
    .from("pedidos")
    .update({ estado: "enviado" })
    .eq("id", pedido.id);

  if (confirmarError) {
    const esFaltaStock = confirmarError.message.toLowerCase().includes("stock insuficiente");
    return {
      ok: false,
      error: esFaltaStock
        ? "No hay suficiente stock para completar este pedido. El pedido quedo guardado como pendiente."
        : "No se pudo confirmar el pedido.",
    };
  }

  revalidatePath("/vendedor/panel");
  revalidatePath("/vendedor/pedidos");

  return { ok: true, numeroOrden: pedido.numero_orden };
}

export async function cancelarPedido(id: string) {
  const supabase = await createClient();
  await supabase.from("pedidos").update({ estado: "cancelado" }).eq("id", id);
  revalidatePath("/vendedor/panel");
  revalidatePath("/vendedor/pedidos");
}
