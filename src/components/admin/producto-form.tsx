"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ProductoFormState } from "@/app/admin/inventario/actions";

const initialState: ProductoFormState = {};

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

export function ProductoForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: ProductoFormState, formData: FormData) => Promise<ProductoFormState>;
  initial?: { nombre: string; precio: number; stock: number };
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

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          Precio
        </span>
        <input
          name="precio"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.precio}
          required
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          Cantidad
        </span>
        <input
          name="cantidad"
          type="number"
          step="1"
          min="0"
          defaultValue={initial?.stock}
          required
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
        />
      </label>

      {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <BotonGuardar label={submitLabel} />
    </form>
  );
}
