/**
 * Service catalog. Matches the offers shown on Jordan's live Calendly:
 *   - Krowned Reset   (60 min)
 *   - Krowned Restore (90 min)
 *   - Krowned Renew   (120 min)
 *
 * Pricing and duration anchor the booking flow and the public marketing
 * cards. Update here and both surfaces stay in sync.
 */

export type Service = {
  id: string;
  name: string;
  tagline: string;
  durationMinutes: number;
  priceUsd: number;
  priceJmd: number;
  /** 2-line summary for cards and the booking selector. */
  description: string;
  /** Hide from the public form but keep accepting via direct id (returning clients). */
  hidden?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "krowned-reset-60",
    name: "Krowned Reset",
    durationMinutes: 60,
    priceUsd: 100,
    priceJmd: 15000,
    tagline: "Meet your body where it is.",
    description:
      "A nervous-system-led, full-body session guided in real time by your body's signals. The right starting point for most first visits.",
  },
  {
    id: "krowned-restore-90",
    name: "Krowned Restore",
    durationMinutes: 90,
    priceUsd: 130,
    priceJmd: 20000,
    tagline: "Unwind the week you've carried.",
    description:
      "Ninety minutes of deeper therapeutic work for long-standing tension, training load, and travel days. Firm, precise, integrative.",
  },
  {
    id: "krowned-renew-120",
    name: "Krowned Renew",
    durationMinutes: 120,
    priceUsd: 160,
    priceJmd: 25000,
    tagline: "The full reset.",
    description:
      "Two hours of layered recovery and extended down-regulation. Full-body therapeutic work with space to truly land before you leave the table.",
  },
];

export const SERVICE_AREAS = [
  { id: "kingston", label: "Kingston" },
  { id: "montego-bay", label: "Montego Bay" },
  { id: "other", label: "Other" },
] as const;

export type ServiceAreaId = (typeof SERVICE_AREAS)[number]["id"];

/** Label for UI tables and emails; includes custom parish/region when area is "other". */
export function formatServiceAreaLabel(
  areaId: string,
  areaCustom?: string | null,
): string {
  if (areaId === "other") {
    const extra = areaCustom?.trim();
    return extra ? `Other · ${extra}` : "Other";
  }
  const row = SERVICE_AREAS.find((a) => a.id === areaId);
  return row?.label ?? areaId.replace(/-/g, " ");
}

export function findService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function publicServices(): Service[] {
  return SERVICES.filter((s) => !s.hidden);
}
