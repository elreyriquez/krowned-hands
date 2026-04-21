"use client";

import { useQuoteCurrency } from "@/components/CurrencyProvider";
import { formatUsd, formatJmd } from "@/lib/pricing";

type Props = {
  minUsd: number;
  minJmd: number;
};

/**
 * Hero stat block: switches primary display with global quote currency toggle.
 */
export function HeroPriceStat({ minUsd, minJmd }: Props) {
  const { currency } = useQuoteCurrency();
  const primary = currency === "usd" ? formatUsd(minUsd) : formatJmd(minJmd);
  const secondary =
    currency === "usd"
      ? formatJmd(minJmd)
      : `${formatUsd(minUsd)} USD`;

  return (
    <div>
      <p className="font-serif text-2xl text-[var(--kh-brown)]">{primary}</p>
      <p className="tracking-[0.18em] uppercase text-xs mt-1 text-[var(--kh-brown-soft)]">
        Starting at · {secondary}
      </p>
    </div>
  );
}
