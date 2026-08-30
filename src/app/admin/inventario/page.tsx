import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/admin/empty-state";
import { ArchiveBoxIcon } from "@/components/admin/icons";
import { ProductoCard } from "@/components/admin/producto-card";
import { SearchInput } from "@/components/admin/search-input";

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const supabase = await createClient();
  let query = supabase.from("productos").select("id, nombre, precio, stock").order("nombre");
  if (busqueda) {
    query = query.ilike("nombre", `%${busqueda}%`);
  }
  const { data: productos } = await query;

  return (
    <main className="px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-[#1f1b16]">Inventario</h2>
        <Link
          href="/admin/inventario/nuevo"
          className="rounded-full bg-[#3c6e82] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#345f71]"
        >
          + Producto
        </Link>
      </div>

      <div className="mt-4">
        <SearchInput placeholder="Buscar producto por nombre..." />
      </div>

      <div className="mt-4 space-y-2">
        {productos && productos.length > 0 ? (
          productos.map((producto) => <ProductoCard key={producto.id} producto={producto} />)
        ) : busqueda ? (
          <EmptyState
            icon={<ArchiveBoxIcon className="h-6 w-6" />}
            title="Sin resultados"
            description={`No encontramos productos que coincidan con "${busqueda}".`}
          />
        ) : (
          <EmptyState
            icon={<ArchiveBoxIcon className="h-6 w-6" />}
            title="Sin productos todavia"
            description="Agrega el primer producto para empezar a controlar el stock."
          />
        )}
      </div>
    </main>
  );
}
