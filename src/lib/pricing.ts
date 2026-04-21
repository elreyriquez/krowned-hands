import type { Service } from "./services";

export type QuoteCurrency = "usd" | "jmd";

export function formatUsd(amount: number): string {
  return `$${amount}`;
}

/** Jamaican dollar; no minor units in common local display. */
export function formatJmd(amount: number): string {
  return `J$${amount.toLocaleString("en-JM")}`;
}

/**
 * Primary label (what the visitor asked to see) and a secondary hint
 * with the other currency.
 */
export function dualPriceLabels(
  service: Service,
  currency: QuoteCurrency,
): { primary: string; secondary: string } {
  const usd = formatUsd(service.priceUsd);
  const jmd = formatJmd(service.priceJmd);
  if (currency === "usd") {
    return { primary: usd, secondary: jmd };
  }
  return { primary: jmd, secondary: `${usd} USD` };
}

export function sessionPriceLine(service: Service, currency: QuoteCurrency): string {
  const { primary, secondary } = dualPriceLabels(service, currency);
  return `${primary} · ${secondary}`;
}
