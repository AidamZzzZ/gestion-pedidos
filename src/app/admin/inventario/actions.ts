"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProductoFormState = { error?: string };

function parseProductoForm(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const precio = Number(String(formData.get("precio") ?? "").replace(",", "."));
  const cantidad = Number(formData.get("cantidad"));

  if (!nombre) return { error: "El nombre es obligatorio." } as const;
  if (!Number.isFinite(precio) || precio < 0) {
    return { error: "El precio debe ser un numero valido." } as const;
  }
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    return { error: "La cantidad debe ser un numero entero valido." } as const;
  }

  return { nombre, precio, cantidad } as const;
}

export async function crearProducto(
  _prevState: ProductoFormState,
  formData: FormData,
): Promise<ProductoFormState> {
  const parsed = parseProductoForm(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert({
    nombre: parsed.nombre,
    precio: parsed.precio,
    stock: parsed.cantidad,
  });

  if (error) return { error: "No se pudo crear el producto." };

  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}

export async function actualizarProducto(
  id: string,
  _prevState: ProductoFormState,
  formData: FormData,
): Promise<ProductoFormState> {
  const parsed = parseProductoForm(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ nombre: parsed.nombre, precio: parsed.precio, stock: parsed.cantidad })
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el producto." };

  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}

export async function eliminarProducto(id: string) {
  const supabase = await createClient();
  await supabase.from("productos").delete().eq("id", id);
  revalidatePath("/admin/inventario");
}
