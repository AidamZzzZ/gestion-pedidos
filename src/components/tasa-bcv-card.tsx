import { formatoBs, type TasaBcv } from "@/lib/tasa-bcv";

export function TasaBcvCard({ tasa }: { tasa: TasaBcv | null }) {
  if (!tasa) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-xs text-[#8c8579] shadow-sm">
        Tasa BCV no disponible por ahora.
      </div>
    );
  }

  const fecha = new Date(tasa.fechaActualizacion).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
          Dólar hoy (BCV)
        </p>
        <p className="text-xs text-[#9c9589]">Actualizado {fecha}</p>
      </div>
      <p className="font-display text-lg font-bold text-[#1f1b16]">
        Bs {formatoBs.format(tasa.promedio)}
      </p>
    </div>
  );
}
