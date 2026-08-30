import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/admin/empty-state";
import { UsersIcon } from "@/components/admin/icons";
import { VendedorCard } from "@/components/admin/vendedor-card";

export default async function VendedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: vendedores } = await supabase
    .from("usuarios")
    .select("id, nombre, correo_electronico, porcentaje_comision")
    .eq("rol", "vendedor")
    .order("nombre");

  return (
    <main className="px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-[#1f1b16]">Vendedores</h2>
        <Link
          href="/admin/vendedores/nuevo"
          className="rounded-full bg-[#3c6e82] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71]"
        >
          + Vendedor
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-[#f6e4e0] px-4 py-3 text-sm font-medium text-[#b3543f]">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {vendedores && vendedores.length > 0 ? (
          vendedores.map((vendedor) => <VendedorCard key={vendedor.id} vendedor={vendedor} />)
        ) : (
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title="Sin vendedores todavia"
            description="Agrega el primer vendedor para que pueda entrar al sistema."
          />
        )}
      </div>
    </main>
  );
}
