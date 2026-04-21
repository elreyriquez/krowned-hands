/**
 * Service catalog.
 *
 * The live Calendly page exposes service options and durations. Because
 * we can't see that page directly at build time, this catalog mirrors
 * common mobile-massage event types at the ~$150 anchor price referenced
 * in the growth action plan, with room for the owner to adjust in one place.
 *
 * To change pricing/durations, edit this file — both the booking form
 * and the admin view read from here.
 */

export type Service = {
  id: string;
  name: string;
  tagline: string;
  durationMinutes: number;
  priceUsd: number;
  description: string;
  /** Hide from the public form but keep accepting via direct id (e.g. returning clients) */
  hidden?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "signature-60",
    name: "Signature Session",
    durationMinutes: 60,
    priceUsd: 150,
    tagline: "The foundation.",
    description:
      "A focused 60-minute session tailored to your body on the day — combining therapeutic pressure, breath, and nervous-system awareness.",
  },
  {
    id: "deep-recovery-90",
    name: "Deep Recovery",
    durationMinutes: 90,
    priceUsd: 210,
    tagline: "Release what you've been carrying.",
    description:
      "Ninety minutes of deeper work for tension patterns, training load, and long-standing holding. Firm, precise, restorative.",
  },
  {
    id: "nervous-system-reset-75",
    name: "Nervous System Reset",
    durationMinutes: 75,
    priceUsd: 185,
    tagline: "Down-regulate, then restore.",
    description:
      "A slower, calming modality designed to move you out of fight-or-flight: long strokes, guided breath, and quiet.",
  },
  {
    id: "couples-90",
    name: "Couples Session",
    durationMinutes: 90,
    priceUsd: 360,
    tagline: "Side by side.",
    description:
      "Two concurrent sessions for couples or close friends. Subject to availability — please include a note if a second therapist is required.",
  },
];

export const SERVICE_AREAS = [
  { id: "kingston", label: "Kingston" },
  { id: "montego-bay", label: "Montego Bay" },
] as const;

export type ServiceAreaId = (typeof SERVICE_AREAS)[number]["id"];

export function findService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function publicServices(): Service[] {
  return SERVICES.filter((s) => !s.hidden);
}
