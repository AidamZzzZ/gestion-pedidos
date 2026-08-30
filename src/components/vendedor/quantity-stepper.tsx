export function QuantityStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (nuevoValor: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#f3e9e2] p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        aria-label="Restar"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1f1b16] shadow-sm transition disabled:opacity-40"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-bold text-[#1f1b16]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Sumar"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1f1b16] shadow-sm transition disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
