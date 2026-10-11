"use client";

import { useCallback, useEffect, useState } from "react";
import type { DatosCliente } from "@/app/vendedor/pedidos/actions";

const STORAGE_KEY = "gestion_pedidos__nuevo_borrador";
const VERSION = 1;

export type DraftPedido = {
  version: number;
  paso: 1 | 2 | 3;
  cliente: DatosCliente;
  cantidades: Record<string, number>;
  busqueda: string;
};

const CLIENTE_VACIO: DatosCliente = {
  nombre_empresa: "",
  nombre_contacto: "",
  rif: "",
  direccion_fiscal: "",
  numero_contacto: "",
};

const DRAFT_INICIAL: DraftPedido = {
  version: VERSION,
  paso: 1,
  cliente: CLIENTE_VACIO,
  cantidades: {},
  busqueda: "",
};

function leerDraft(): DraftPedido {
  if (typeof window === "undefined") return DRAFT_INICIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DRAFT_INICIAL;
    const parsed = JSON.parse(raw) as DraftPedido;
    // Si la versión no coincide, descartamos el borrador guardado
    if (parsed.version !== VERSION) return DRAFT_INICIAL;
    return parsed;
  } catch {
    return DRAFT_INICIAL;
  }
}

function guardarDraft(draft: DraftPedido) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage lleno u otro error — ignorar silenciosamente
  }
}

export function limpiarDraftPedido() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Hook que mantiene el estado del wizard de nuevo pedido sincronizado con
 * localStorage. Cualquier cambio se persiste automáticamente y se restaura
 * al montar el componente (incluso tras un refresh o navegación).
 */
export function useDraftPedido() {
  const [draft, setDraftState] = useState<DraftPedido>(DRAFT_INICIAL);
  const [cargado, setCargado] = useState(false);

  // Leer del storage solo en el cliente (evita hydration mismatch)
  useEffect(() => {
    setDraftState(leerDraft());
    setCargado(true);
  }, []);

  // Persistir cada vez que el draft cambie (pero solo después de la carga inicial)
  useEffect(() => {
    if (!cargado) return;
    guardarDraft(draft);
  }, [draft, cargado]);

  const setDraft = useCallback((updater: (prev: DraftPedido) => DraftPedido) => {
    setDraftState(updater);
  }, []);

  const resetDraft = useCallback(() => {
    limpiarDraftPedido();
    setDraftState(DRAFT_INICIAL);
  }, []);

  return { draft, setDraft, resetDraft, cargado };
}
