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
  area: string;
  address: string;
  addressNotes?: string;
  preferredDate: string; // YYYY-MM-DD
  preferredWindow: string; // e.g. "9:00 AM - 12:00 PM"
  name: string;
  email: string;
  phone: string;
  message?: string;
  consent: boolean;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

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
  data: Omit<BookingRecord, "id" | "createdAt" | "status">
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
  return record;
}
