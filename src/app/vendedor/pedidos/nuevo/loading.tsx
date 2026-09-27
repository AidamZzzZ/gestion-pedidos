export default function NuevoPedidoLoading() {
  return (
    <div className="px-6 pt-6">
      <div className="h-4 w-20 animate-pulse rounded-full bg-black/10" />
      <div className="mt-3 mb-4 h-7 w-40 animate-pulse rounded-full bg-black/10" />

      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 animate-pulse rounded-full bg-black/10" />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/70 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
