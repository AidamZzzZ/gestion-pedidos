const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-[#f3e9e2] text-[#8c8579]",
  enviado: "bg-[#e4eef1] text-[#2c5f86]",
  cancelado: "bg-[#f6e4e0] text-[#b3543f]",
};

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        ESTADO_COLOR[estado] ?? "bg-[#f3e9e2] text-[#8c8579]"
      }`}
    >
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}
