import { ListSkeleton, StatCardSkeleton } from "@/components/skeleton";

export default function PanelVendedorLoading() {
  return (
    <main className="px-6">
      <div className="h-16 animate-pulse rounded-2xl border border-black/5 bg-white/70 shadow-sm" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <div className="col-span-2">
          <StatCardSkeleton />
        </div>
      </div>

      <div className="mt-8 h-3 w-32 animate-pulse rounded-full bg-black/10" />
      <div className="mt-3">
        <ListSkeleton />
      </div>
    </main>
  );
}
