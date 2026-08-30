"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { iniciarSesion, type LoginState } from "./actions";

type Cuenta = { id: string; nombre: string };

const initialState: LoginState = {};

function BotonIngresar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-[#3c6e82] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71] disabled:opacity-60"
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </button>
  );
}

export function LoginForm({
  vendedores,
  admin,
}: {
  vendedores: Cuenta[];
  admin: Cuenta | null;
}) {
  const [rol, setRol] = useState<"vendedor" | "admin">("vendedor");
  const [vendedorId, setVendedorId] = useState(vendedores[0]?.id ?? "");
  const [state, formAction] = useActionState(iniciarSesion, initialState);

  const usuarioId = rol === "admin" ? (admin?.id ?? "") : vendedorId;

  return (
    <main className="flex min-h-screen justify-center bg-[#eae7e2] px-6 pt-16 pb-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c8a66] font-display text-xl font-bold text-[#f4f1ea]">
          H
        </div>

        <h1 className="font-display text-3xl font-bold text-[#1f1b16]">Hernandán</h1>
        <p className="mt-1 text-sm text-[#8c8579]">Gestión de pedidos</p>

        <div className="mt-6 flex rounded-2xl bg-[#f3e9e2] p-1">
          <button
            type="button"
            onClick={() => setRol("vendedor")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold uppercase tracking-wide transition ${
              rol === "vendedor" ? "bg-[#3c6e82] text-white" : "text-[#1f1b16]"
            }`}
          >
            Vendedor
          </button>
          <button
            type="button"
            onClick={() => setRol("admin")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold uppercase tracking-wide transition ${
              rol === "admin" ? "bg-[#3c6e82] text-white" : "text-[#1f1b16]"
            }`}
          >
            Administrador
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="rol" value={rol} />
          <input type="hidden" name="usuarioId" value={usuarioId} />

          {rol === "vendedor" ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
                Vendedor
              </span>
              {vendedores.length > 0 ? (
                <div className="relative">
                  <select
                    value={vendedorId}
                    onChange={(e) => setVendedorId(e.target.value)}
                    className="w-full appearance-none rounded-2xl bg-white px-4 py-3 pr-10 text-sm font-medium text-[#1f1b16] shadow-sm"
                  >
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronIcon />
                </div>
              ) : (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[#8c8579] shadow-sm">
                  No hay vendedores registrados.
                </p>
              )}
            </label>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
                Cuenta
              </span>
              <p className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm">
                {admin?.nombre ?? "Sin administrador registrado"}
              </p>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
            />
          </label>

          {state.error ? (
            <p className="text-sm font-medium text-red-600">{state.error}</p>
          ) : null}

          <BotonIngresar />
        </form>
      </div>
    </main>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c8579]"
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
