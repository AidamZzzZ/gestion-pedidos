"use client";

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
    <div className="flex shrink-0 items-center">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value === 0 ? "" : value}
        placeholder="0"
        disabled={max <= 0}
        onFocus={(e) => e.target.select()}
        onClick={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
            e.preventDefault();
          }
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(0);
            return;
          }
          const num = parseInt(raw, 10);
          if (!isNaN(num)) {
            onChange(Math.max(0, Math.min(max, num)));
          }
        }}
        className="h-9 w-20 rounded-full bg-[#f3e9e2] px-3 text-center text-sm font-bold text-[#1f1b16] placeholder:text-[#8c8579] outline-none ring-[#3c6e82] transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Cantidad"
      />
    </div>
  );
}

export const QuantityInput = QuantityStepper;

