import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Simple file-based booking store.
 *
 * Why JSON-on-disk for v1:
 *  - Zero native deps, works on any host with a writable FS.
 *  - Easy to back up, grep, and migrate into a real DB later.
 *
 * For production behind serverless (Vercel, Netlify), swap `readAll`/`append`
 * to use Vercel Blob, Supabase, Neon, or SQLite via Turso. The shape of
 * `BookingRecord` stays the same.
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
};

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
