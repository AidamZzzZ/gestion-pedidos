import { EmptyState } from "@/components/admin/empty-state";
import { TrendingUpIcon } from "@/components/admin/icons";

export default function GananciasPage() {
  return (
    <main className="px-6">
      <h2 className="font-display text-xl font-bold text-[#1f1b16]">Ganancias</h2>
      <div className="mt-4">
        <EmptyState
          icon={<TrendingUpIcon className="h-6 w-6" />}
          title="Todavia sin definir"
          description="Aca va a vivir el detalle de tus comisiones por periodo."
        />
      </div>
    </main>
  );
}
