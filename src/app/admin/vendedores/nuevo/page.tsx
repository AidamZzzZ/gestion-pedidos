import Link from "next/link";
import { VendedorForm } from "@/components/admin/vendedor-form";
import { crearVendedor } from "../actions";

export default function NuevoVendedorPage() {
  return (
    <main className="px-6">
      <Link
        href="/admin/vendedores"
        className="text-xs font-semibold uppercase tracking-wide text-[#3c6e82]"
      >
        ← Vendedores
      </Link>
      <h2 className="mt-2 font-display text-xl font-bold text-[#1f1b16]">Nuevo vendedor</h2>

      <div className="mt-4">
        <VendedorForm action={crearVendedor} mode="crear" submitLabel="Crear vendedor" />
      </div>
    </main>
  );
}
