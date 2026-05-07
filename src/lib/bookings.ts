import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  appendToDb,
  deleteByIdInDb,
  readAllFromDb,
  updateStatusInDb,
  upsertFromCalendlyInDb,
} from "./bookings-db";

/**
 * Booking persistence.
 *
 * - **Production:** Set `DATABASE_URL` (PostgreSQL). Data lives in the `bookings`
 *   table — survives deploys and restarts (e.g. Railway Postgres).
 * - **Local dev without Postgres:** Omit `DATABASE_URL` — falls back to
 *   `.data/bookings.json` + CSV ledger (same as before).
 */

export type BookingStatus = "new" | "confirmed" | "cancelled";

export type BookingRecord = {
  id: string;
  createdAt: string;
  status: BookingStatus;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  priceUsd: number;
  /** Fixed list price in JMD at booking time (optional on legacy records). */
  priceJmd?: number;
  /** Which currency toggle the client had selected when submitting. */
  quoteCurrency?: "usd" | "jmd";
  area: string;
  /** When `area` is "other", parish / town / region the client entered. */
  areaCustom?: string;
  address: string;
  addressNotes?: string;
  preferredDate: string; // YYYY-MM-DD
  /** 24h start time, "HH:MM". Authoritative for availability checks. */
  preferredTime?: string;
  /** Legacy free-text window (e.g. "Morning · 8:00 AM - 11:00 AM"). Kept so
   *  older JSON records still render cleanly in admin / notifications. */
  preferredWindow?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  consent: boolean;
  /** External source marker (e.g. Calendly). */
  source?: "manual" | "calendly";
  calendlyInviteeUri?: string;
  calendlyEventUri?: string;
};

function persistWithPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");
/** Spreadsheet-friendly mirror of all bookings (UTF-8 CSV). Rewritten whenever the JSON store changes. */
export const BOOKINGS_LEDGER_CSV = path.join(DATA_DIR, "bookings-ledger.csv");

const LEDGER_HEADERS = [
  "id",
  "created_at",
  "status",
  "service_id",
  "service_name",
  "duration_minutes",
  "price_usd",
  "price_jmd",
  "quote_currency",
  "area",
  "area_custom",
  "address",
  "address_notes",
  "preferred_date",
  "preferred_time",
  "preferred_window",
  "client_name",
  "email",
  "phone",
  "message",
  "consent",
  "source",
  "calendly_invitee_uri",
  "calendly_event_uri",
] as const;

function csvCell(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowFromRecord(r: BookingRecord): string {
  return [
    csvCell(r.id),
    csvCell(r.createdAt),
    csvCell(r.status),
    csvCell(r.serviceId),
    csvCell(r.serviceName),
    csvCell(r.durationMinutes),
    csvCell(r.priceUsd),
    csvCell(r.priceJmd ?? ""),
    csvCell(r.quoteCurrency ?? ""),
    csvCell(r.area),
    csvCell(r.areaCustom ?? ""),
    csvCell(r.address),
    csvCell(r.addressNotes ?? ""),
    csvCell(r.preferredDate),
    csvCell(r.preferredTime ?? ""),
    csvCell(r.preferredWindow ?? ""),
    csvCell(r.name),
    csvCell(r.email),
    csvCell(r.phone),
    csvCell(r.message ?? ""),
    csvCell(r.consent ? "yes" : "no"),
    csvCell(r.source ?? ""),
    csvCell(r.calendlyInviteeUri ?? ""),
    csvCell(r.calendlyEventUri ?? ""),
  ].join(",");
}

/**
 * Builds CSV text for bookkeeping (oldest → newest rows).
 */
export function bookingsToCsv(records: BookingRecord[]): string {
  const chronological = [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const headerLine = LEDGER_HEADERS.join(",");
  const body = chronological.map(rowFromRecord).join("\r\n");
  return body ? `${headerLine}\r\n${body}\r\n` : `${headerLine}\r\n`;
}

async function writeLedgerCsv(records: BookingRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const text = bookingsToCsv(records);
  await fs.writeFile(BOOKINGS_LEDGER_CSV, text, "utf8");
}

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readAll(): Promise<BookingRecord[]> {
  if (persistWithPostgres()) {
    return readAllFromDb();
  }
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

export async function append(
  data: Omit<BookingRecord, "id" | "createdAt" | "status">,
): Promise<BookingRecord> {
  if (persistWithPostgres()) {
    return appendToDb(data);
  }
  await ensureStore();
  const record: BookingRecord = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const all = await readAll();
  all.unshift(record);
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
  try {
    await writeLedgerCsv(all);
  } catch (err) {
    console.error("[bookings] ledger CSV write failed", err);
  }
  return record;
}

export type CalendlySyncInput = {
  calendlyInviteeUri: string;
  calendlyEventUri?: string;
  status: BookingStatus;
  serviceName: string;
  durationMinutes: number;
  preferredDate: string;
  preferredTime?: string;
  preferredWindow?: string;
  name: string;
  email: string;
  phone?: string;
  area?: string;
  areaCustom?: string;
  address?: string;
  addressNotes?: string;
  message?: string;
};

export async function upsertFromCalendly(input: CalendlySyncInput): Promise<BookingRecord> {
  if (persistWithPostgres()) {
    return upsertFromCalendlyInDb(input);
  }
  await ensureStore();
  const all = await readAll();
  const existingIdx = all.findIndex(
    (b) => b.calendlyInviteeUri && b.calendlyInviteeUri === input.calendlyInviteeUri,
  );

  const base: BookingRecord = {
    id: existingIdx >= 0 ? all[existingIdx].id : crypto.randomUUID(),
    createdAt: existingIdx >= 0 ? all[existingIdx].createdAt : new Date().toISOString(),
    status: input.status,
    serviceId: "calendly",
    serviceName: input.serviceName || "Calendly session",
    durationMinutes: input.durationMinutes || 60,
    priceUsd: existingIdx >= 0 ? all[existingIdx].priceUsd : 0,
    area: input.area || (existingIdx >= 0 ? all[existingIdx].area : "other"),
    areaCustom: input.areaCustom || (existingIdx >= 0 ? all[existingIdx].areaCustom : "Calendly"),
    address: input.address || (existingIdx >= 0 ? all[existingIdx].address : "Captured in Calendly"),
    addressNotes: input.addressNotes || (existingIdx >= 0 ? all[existingIdx].addressNotes : undefined),
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    preferredWindow: input.preferredWindow,
    name: input.name || (existingIdx >= 0 ? all[existingIdx].name : "Calendly guest"),
    email: input.email || (existingIdx >= 0 ? all[existingIdx].email : ""),
    phone: input.phone || (existingIdx >= 0 ? all[existingIdx].phone : "-"),
    message: input.message || (existingIdx >= 0 ? all[existingIdx].message : undefined),
    consent: true,
    source: "calendly",
    calendlyInviteeUri: input.calendlyInviteeUri,
    calendlyEventUri: input.calendlyEventUri,
  };

  if (existingIdx >= 0) {
    all[existingIdx] = base;
  } else {
    all.unshift(base);
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
  try {
    await writeLedgerCsv(all);
  } catch (err) {
    console.error("[bookings] ledger CSV write failed", err);
  }
  return base;
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<void> {
  if (persistWithPostgres()) {
    await updateStatusInDb(id, status);
    return;
  }
  await ensureStore();
  const all = await readAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], status };
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
  try {
    await writeLedgerCsv(all);
  } catch (err) {
    console.error("[bookings] ledger CSV write failed", err);
  }
}

export async function deleteBooking(id: string): Promise<void> {
  if (persistWithPostgres()) {
    await deleteByIdInDb(id);
    return;
  }
  await ensureStore();
  const all = await readAll();
  const next = all.filter((b) => b.id !== id);
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), "utf8");
  try {
    await writeLedgerCsv(next);
  } catch (err) {
    console.error("[bookings] ledger CSV write failed", err);
  }
}
