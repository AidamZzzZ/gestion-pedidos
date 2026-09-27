export function HeaderRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="h-6 w-32 animate-pulse rounded-full bg-black/10" />
      <div className="h-9 w-28 animate-pulse rounded-full bg-black/10" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-2xl border border-black/5 bg-white/70 shadow-sm" />
  );
}

export function ListItemSkeleton() {
  return (
    <div className="h-20 animate-pulse rounded-2xl border border-black/5 bg-white/70 shadow-sm" />
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
