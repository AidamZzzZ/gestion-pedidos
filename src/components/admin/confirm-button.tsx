"use client";

import type { ReactNode } from "react";

export function ConfirmButton({
  children,
  confirmMessage,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  confirmMessage: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
