import { HeaderRowSkeleton, ListSkeleton } from "@/components/skeleton";

export default function VendedoresLoading() {
  return (
    <main className="px-6">
      <HeaderRowSkeleton />
      <div className="mt-4">
        <ListSkeleton items={4} />
      </div>
    </main>
  );
}
