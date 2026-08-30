import type { ReactNode } from "react";
import { cerrarSesion } from "@/lib/auth/actions";
import { BottomTabs, type TabItem } from "@/components/bottom-tabs";

export function AppShell({
  nombre,
  etiqueta,
  tabs,
  children,
}: {
  nombre: string;
  etiqueta: string;
  tabs: TabItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#eae7e2] pb-24">
      <header className="flex items-center justify-between border-b border-black/5 px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7c8a66] font-display text-sm font-bold text-[#f4f1ea]">
            {nombre.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9589]">
              {etiqueta}
            </p>
            <h1 className="font-display text-lg font-bold text-[#1f1b16]">{nombre}</h1>
          </div>
        </div>
        <form action={cerrarSesion}>
          <button className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#3c6e82] transition hover:bg-white">
            Salir
          </button>
        </form>
      </header>

      <div className="pt-6">{children}</div>

      <BottomTabs tabs={tabs} />
    </div>
  );
}
