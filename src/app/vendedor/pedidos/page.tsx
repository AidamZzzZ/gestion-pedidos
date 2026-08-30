import { EmptyState } from "@/components/admin/empty-state";
import { ReceiptIcon } from "@/components/admin/icons";

export default function PedidosPage() {
  return (
    <main className="px-6">
      <h2 className="font-display text-xl font-bold text-[#1f1b16]">Pedidos</h2>
      <div className="mt-4">
        <EmptyState
          icon={<ReceiptIcon className="h-6 w-6" />}
          title="Todavia sin definir"
          description="Aca vas a poder crear pedidos nuevos (cliente + productos) y ver tu historial."
        />
      </div>
    </main>
  );
}
