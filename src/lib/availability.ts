import type { BookingRecord } from "./bookings";

/**
 * Booking availability helpers.
 *
 * Jordan's working window on Calendly runs 08:00 → 20:30, so slot *starts*
 * live on a 30-minute cadence inside that range. A slot for a given service
 * is unavailable when its [start, start+duration) interval overlaps any
 * booking that is still on the calendar (status "new" or "confirmed").
 */

export const DAY_START_MIN = 8 * 60;          // 08:00
export const LAST_SLOT_START_MIN = 20 * 60 + 30; // 20:30
export const SLOT_STEP_MIN = 30;
export const DAY_END_MIN = 22 * 60 + 30;      // 22:30 hard end (latest possible finish)

export type Slot = {
  /** "HH:MM" in 24-hour time. */
  time: string;
  available: boolean;
  /** Reason flag for debugging / future tooltip copy. */
  reason?: "booked" | "past" | "closing";
};

export function parseHHMM(value: string): number | null {
  const m = /^([0-2]?\d):([0-5]\d)$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23) return null;
  return h * 60 + mm;
}

export function formatHHMM(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDisplayTime(minute: number): string {
  const h24 = Math.floor(minute / 60);
  const m = minute % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Yield every slot start minute in the booking window.
 * (08:00, 08:30, 09:00, … 20:30)
 */
export function slotStartMinutes(): number[] {
  const out: number[] = [];
  for (let t = DAY_START_MIN; t <= LAST_SLOT_START_MIN; t += SLOT_STEP_MIN) {
    out.push(t);
  }
  return out;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function bookingInterval(b: BookingRecord): { start: number; end: number } | null {
  if (!b.preferredTime) return null; // legacy records with only a free-text window.
  const start = parseHHMM(b.preferredTime);
  if (start == null) return null;
  const end = start + (b.durationMinutes || 60);
  return { start, end };
}

export type AvailabilityInput = {
  date: string;           // "YYYY-MM-DD"
  durationMinutes: number;
  bookings: BookingRecord[];
  /** Optional current time (for testability). Defaults to `new Date()`. */
  now?: Date;
};

/**
 * Pure function: given a date, a session duration, and the existing bookings,
 * compute which slot starts are bookable. Past times (today only) and slots
 * whose end exceeds 22:30 are marked unavailable.
 */
export function computeAvailability({
  date,
  durationMinutes,
  bookings,
  now,
}: AvailabilityInput): Slot[] {
  const today = now ?? new Date();
  const isToday = toIsoDate(today) === date;

  const blockers = bookings
    .filter((b) => b.preferredDate === date && b.status !== "cancelled")
    .map(bookingInterval)
    .filter((v): v is { start: number; end: number } => v !== null);

  return slotStartMinutes().map((start) => {
    const end = start + durationMinutes;
    if (end > DAY_END_MIN) {
      return { time: formatHHMM(start), available: false, reason: "closing" };
    }
    if (isToday) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      if (start <= nowMin) {
        return { time: formatHHMM(start), available: false, reason: "past" };
      }
    }
    const conflict = blockers.some((b) => overlaps(start, end, b.start, b.end));
    if (conflict) {
      return { time: formatHHMM(start), available: false, reason: "booked" };
    }
    return { time: formatHHMM(start), available: true };
  });
}

/**
 * Is a specific "HH:MM" still bookable on `date` for `durationMinutes`?
 * Used by the server-side validator to prevent the race where two clients
 * submit the same slot before the form re-fetches.
 */
export function isSlotBookable(
  date: string,
  preferredTime: string,
  durationMinutes: number,
  bookings: BookingRecord[],
  now?: Date,
): boolean {
  const slot = computeAvailability({ date, durationMinutes, bookings, now }).find(
    (s) => s.time === preferredTime,
  );
  return Boolean(slot?.available);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
