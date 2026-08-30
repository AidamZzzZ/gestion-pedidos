"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type TabItem = { href: string; label: string };

export function BottomTabs({ tabs }: { tabs: TabItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-sm">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex-1 py-4 text-center"
            >
              {active ? (
                <span className="absolute top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2c5f86]" />
              ) : null}
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  active ? "text-[#2c5f86]" : "text-[#9c9589]"
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`absolute inset-x-4 bottom-0 h-[3px] rounded-full ${
                  active ? "bg-[#2c5f86]" : "bg-[#e5e1db]"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
