"use client";

import { useQuoteCurrency } from "@/components/CurrencyProvider";
import type { QuoteCurrency } from "@/lib/pricing";

type Variant = "light" | "dark";

type Props = {
  variant?: Variant;
  className?: string;
};

export function QuoteCurrencyToggle({ variant = "light", className = "" }: Props) {
  const { currency, setCurrency } = useQuoteCurrency();

  const baseBtn =
    variant === "dark"
      ? "text-[var(--kh-cream)]/80 hover:bg-white/10"
      : "text-[var(--kh-brown-soft)] hover:bg-[color-mix(in_srgb,var(--kh-gold)_12%,transparent)]";
  const activeBtn =
    variant === "dark"
      ? "bg-white/15 text-[var(--kh-cream)] shadow-sm"
      : "bg-[var(--kh-brown)] text-[var(--kh-cream)] shadow-sm";

  function pill(c: QuoteCurrency, label: string) {
    const on = currency === c;
    return (
      <button
        key={c}
        type="button"
        onClick={() => setCurrency(c)}
        className={`rounded-full px-3 py-1.5 transition ${on ? activeBtn : baseBtn}`}
        aria-pressed={on}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Quote prices in"
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs font-medium tracking-wide ${
        variant === "dark"
          ? "border-white/20 bg-black/15"
          : "border-[var(--kh-line)] bg-[color-mix(in_srgb,var(--kh-cream-soft)_90%,transparent)]"
      } ${className}`}
    >
      {pill("usd", "USD")}
      {pill("jmd", "JMD")}
    </div>
  );
}
