import { EmptyState } from "@/components/admin/empty-state";
import { WalletIcon } from "@/components/admin/icons";

export default function CobrosPage() {
  return (
    <main className="px-6">
      <h2 className="font-display text-xl font-bold text-[#1f1b16]">Cobros</h2>
      <div className="mt-4">
        <EmptyState
          icon={<WalletIcon className="h-6 w-6" />}
          title="Todavia sin definir"
          description="Aca va a vivir el seguimiento de cobros de tus pedidos."
        />
      </div>
    </main>
  );
}
