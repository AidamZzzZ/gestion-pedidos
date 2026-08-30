"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type VendedorFormState = { error?: string };

function parsePorcentaje(formData: FormData) {
  return Number(String(formData.get("porcentaje_comision") ?? "").replace(",", "."));
}

export async function crearVendedor(
  _prevState: VendedorFormState,
  formData: FormData,
): Promise<VendedorFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const porcentaje = parsePorcentaje(formData);

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!correo) return { error: "El correo es obligatorio." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
    return { error: "La comision debe ser un numero entre 0 y 100." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
    user_metadata: { nombre },
  });

  if (error || !data.user) {
    const yaExiste = error?.message?.toLowerCase().includes("already");
    return { error: yaExiste ? "Ese correo ya esta registrado." : "No se pudo crear el vendedor." };
  }

  const { error: perfilError } = await admin
    .from("usuarios")
    .update({ nombre, rol: "vendedor", porcentaje_comision: porcentaje })
    .eq("id", data.user.id);

  if (perfilError) {
    // Evita dejar una cuenta de Auth huerfana sin perfil utilizable.
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "No se pudo guardar el perfil del vendedor." };
  }

  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores");
}

export async function actualizarVendedor(
  id: string,
  _prevState: VendedorFormState,
  formData: FormData,
): Promise<VendedorFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const porcentaje = parsePorcentaje(formData);
  const nuevaPassword = String(formData.get("password") ?? "");

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
    return { error: "La comision debe ser un numero entre 0 y 100." };
  }
  if (nuevaPassword && nuevaPassword.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("usuarios")
    .update({ nombre, porcentaje_comision: porcentaje })
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el vendedor." };

  if (nuevaPassword) {
    const admin = createAdminClient();
    const { error: pwError } = await admin.auth.admin.updateUserById(id, {
      password: nuevaPassword,
    });
    if (pwError) return { error: "Se guardaron los datos, pero no se pudo cambiar la contraseña." };
  }

  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores");
}

export async function eliminarVendedor(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    redirect(
      `/admin/vendedores?error=${encodeURIComponent(
        "No se pudo eliminar: es posible que tenga clientes o pedidos registrados.",
      )}`,
    );
  }

  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores");
}
