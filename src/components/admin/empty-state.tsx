export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e9e2] text-[#7c8a66]">
        {icon}
      </div>
      <div>
        <p className="font-display text-base font-bold text-[#1f1b16]">{title}</p>
        <p className="mt-1 text-sm text-[#8c8579]">{description}</p>
      </div>
    </div>
  );
}
