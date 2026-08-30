export type TasaBcv = {
  promedio: number;
  fechaActualizacion: string;
};

export const formatoBs = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// La tasa oficial BCV se publica normalmente una vez por dia habil, asi que
// cachear 15 minutos evita golpear la API externa en cada carga de pantalla
// sin que el dato se sienta desactualizado.
export async function obtenerTasaBcv(): Promise<TasaBcv | null> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (typeof data.promedio !== "number") return null;

    return { promedio: data.promedio, fechaActualizacion: data.fechaActualizacion };
  } catch {
    return null;
  }
}
