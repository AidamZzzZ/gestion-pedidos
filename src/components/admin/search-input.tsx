"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "@/components/admin/icons";

export function SearchInput({
  placeholder = "Buscar...",
  paramName = "q",
}: {
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get(paramName) ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(nuevoValor: string) {
    setValor(nuevoValor);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nuevoValor) {
        params.set(paramName, nuevoValor);
      } else {
        params.delete(paramName);
      }
      startTransition(() => {
        router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
      });
    }, 350);
  }

  return (
    <div className="relative">
      <SearchIcon
        className={`pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors ${
          isPending ? "text-[#3c6e82]" : "text-[#9c9589]"
        }`}
      />
      <input
        type="text"
        value={valor}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-white py-3 pr-4 pl-10 text-sm font-medium text-[#1f1b16] shadow-sm outline-none ring-[#3c6e82] focus:ring-2"
      />
    </div>
  );
}
