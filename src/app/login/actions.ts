"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function iniciarSesion(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rol = formData.get("rol");
  const usuarioId = formData.get("usuarioId");
  const password = formData.get("password");

  if (
    (rol !== "admin" && rol !== "vendedor") ||
    typeof usuarioId !== "string" ||
    !usuarioId ||
    typeof password !== "string" ||
    !password
  ) {
    return { error: "Completa todos los campos." };
  }

  const supabase = await createClient();

  const { data: correo, error: rpcError } = await supabase.rpc(
    "resolver_correo_login",
    { p_usuario_id: usuarioId, p_rol: rol },
  );

  if (rpcError || !correo) {
    return { error: "No se encontro la cuenta seleccionada." };
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: correo,
    password,
  });

  if (authError) {
    return { error: "Contraseña incorrecta." };
  }

  redirect(rol === "admin" ? "/admin" : "/vendedor");
}
