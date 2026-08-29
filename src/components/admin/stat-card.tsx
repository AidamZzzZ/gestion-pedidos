export function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4eef1] text-[#2c5f86]">
        {icon}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-[#1f1b16]">{value}</p>
    </div>
  );
}
