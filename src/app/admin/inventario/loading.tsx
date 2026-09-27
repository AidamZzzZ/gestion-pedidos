import { HeaderRowSkeleton, ListSkeleton } from "@/components/skeleton";

export default function InventarioLoading() {
  return (
    <main className="px-6">
      <HeaderRowSkeleton />
      <div className="mt-4 h-11 animate-pulse rounded-2xl bg-black/5" />
      <div className="mt-4">
        <ListSkeleton items={6} />
      </div>
    </main>
  );
}
