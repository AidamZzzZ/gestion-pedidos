"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { VendedorFormState } from "@/app/admin/vendedores/actions";

const initialState: VendedorFormState = {};

function BotonGuardar({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-[#3c6e82] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71] disabled:opacity-60"
    >
      {pending ? "Guardando..." : label}
    </button>
  );
}

export function VendedorForm({
  action,
  mode,
  initial,
  correo,
  submitLabel,
}: {
  action: (prevState: VendedorFormState, formData: FormData) => Promise<VendedorFormState>;
  mode: "crear" | "editar";
  initial?: { nombre: string; porcentaje_comision: number };
  correo?: string;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          Nombre
        </span>
        <input
          name="nombre"
          defaultValue={initial?.nombre}
          required
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
        />
      </label>

      {mode === "crear" ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
            Correo electronico
          </span>
          <input
            name="correo"
            type="email"
            required
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
          />
        </label>
      ) : (
        <div className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
            Correo electronico
          </span>
          <p className="w-full rounded-2xl bg-[#f3e9e2] px-4 py-3 text-sm font-medium text-[#8c8579] shadow-sm">
            {correo}
          </p>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          % Comision
        </span>
        <input
          name="porcentaje_comision"
          type="number"
          step="0.01"
          min="0"
          max="100"
          defaultValue={initial?.porcentaje_comision}
          required
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          {mode === "crear" ? "Contraseña" : "Nueva contraseña"}
        </span>
        <input
          name="password"
          type="password"
          required={mode === "crear"}
          placeholder={mode === "editar" ? "Dejar en blanco para no cambiarla" : undefined}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
        />
      </label>

      {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <BotonGuardar label={submitLabel} />
    </form>
  );
}
