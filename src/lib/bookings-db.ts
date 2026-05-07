import { Pool } from "pg";
import crypto from "node:crypto";
import type { BookingRecord, BookingStatus, CalendlySyncInput } from "./bookings";

let poolInit: Promise<Pool> | null = null;

async function getPool(): Promise<Pool> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("[bookings-db] DATABASE_URL is not set");
  }
  if (!poolInit) {
    poolInit = (async () => {
      const pool = new Pool({ connectionString: url });
      await ensureBookingsTable(pool);
      return pool;
    })();
  }
  return poolInit;
}

async function ensureBookingsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('new', 'confirmed', 'cancelled')),
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_usd DOUBLE PRECISION NOT NULL,
      price_jmd DOUBLE PRECISION,
      quote_currency TEXT,
      area TEXT NOT NULL,
      area_custom TEXT,
      address TEXT NOT NULL,
      address_notes TEXT,
      preferred_date DATE NOT NULL,
      preferred_time TEXT,
      preferred_window TEXT,
      client_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT,
      consent BOOLEAN NOT NULL,
      source TEXT,
      calendly_invitee_uri TEXT,
      calendly_event_uri TEXT
    );
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS calendly_invitee_uri TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS calendly_event_uri TEXT;
    CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON bookings (preferred_date);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_calendly_invitee_uri
      ON bookings (calendly_invitee_uri)
      WHERE calendly_invitee_uri IS NOT NULL;
  `);
}

type PgRow = {
  id: string;
  created_at: Date;
  status: string;
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price_usd: number;
  price_jmd: number | null;
  quote_currency: string | null;
  area: string;
  area_custom: string | null;
  address: string;
  address_notes: string | null;
  preferred_date: Date | string;
  preferred_time: string | null;
  preferred_window: string | null;
  client_name: string;
  email: string;
  phone: string;
  message: string | null;
  consent: boolean;
  source: string | null;
  calendly_invitee_uri: string | null;
  calendly_event_uri: string | null;
};

function formatPreferredDate(v: Date | string): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v.slice(0, 10);
  return String(v);
}

function rowToRecord(row: PgRow): BookingRecord {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at);

  const rec: BookingRecord = {
    id: row.id,
    createdAt,
    status: row.status as BookingStatus,
    serviceId: row.service_id,
    serviceName: row.service_name,
    durationMinutes: row.duration_minutes,
    priceUsd: row.price_usd,
    area: row.area,
    address: row.address,
    preferredDate: formatPreferredDate(row.preferred_date),
    name: row.client_name,
    email: row.email,
    phone: row.phone,
    consent: row.consent,
  };

  if (row.price_jmd != null) rec.priceJmd = row.price_jmd;
  if (row.quote_currency === "usd" || row.quote_currency === "jmd") {
    rec.quoteCurrency = row.quote_currency;
  }
  if (row.area_custom) rec.areaCustom = row.area_custom;
  if (row.address_notes) rec.addressNotes = row.address_notes;
  if (row.preferred_time) rec.preferredTime = row.preferred_time;
  if (row.preferred_window) rec.preferredWindow = row.preferred_window;
  if (row.message) rec.message = row.message;
  if (row.source === "manual" || row.source === "calendly") rec.source = row.source;
  if (row.calendly_invitee_uri) rec.calendlyInviteeUri = row.calendly_invitee_uri;
  if (row.calendly_event_uri) rec.calendlyEventUri = row.calendly_event_uri;

  return rec;
}

/** PostgreSQL-backed store (production). */
export async function readAllFromDb(): Promise<BookingRecord[]> {
  const pool = await getPool();
  const res = await pool.query<PgRow>(
    `SELECT * FROM bookings ORDER BY created_at DESC`,
  );
  return res.rows.map(rowToRecord);
}

export async function appendToDb(
  data: Omit<BookingRecord, "id" | "createdAt" | "status">,
): Promise<BookingRecord> {
  const pool = await getPool();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const res = await pool.query<PgRow>(
    `INSERT INTO bookings (
      id, created_at, status,
      service_id, service_name, duration_minutes,
      price_usd, price_jmd, quote_currency,
      area, area_custom, address, address_notes,
      preferred_date, preferred_time, preferred_window,
      client_name, email, phone, message, consent,
      source, calendly_invitee_uri, calendly_event_uri
    ) VALUES (
      $1, $2::timestamptz, $3,
      $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12, $13,
      $14::date, $15, $16,
      $17, $18, $19, $20, $21,
      $22, $23, $24
    )
    RETURNING *`,
    [
      id,
      createdAt,
      "new",
      data.serviceId,
      data.serviceName,
      data.durationMinutes,
      data.priceUsd,
      data.priceJmd ?? null,
      data.quoteCurrency ?? null,
      data.area,
      data.areaCustom ?? null,
      data.address,
      data.addressNotes ?? null,
      data.preferredDate,
      data.preferredTime ?? null,
      data.preferredWindow ?? null,
      data.name,
      data.email,
      data.phone,
      data.message ?? null,
      data.consent,
      data.source ?? "manual",
      data.calendlyInviteeUri ?? null,
      data.calendlyEventUri ?? null,
    ],
  );

  const row = res.rows[0];
  if (!row) throw new Error("[bookings-db] INSERT returned no row");
  return rowToRecord(row);
}

export async function upsertFromCalendlyInDb(
  input: CalendlySyncInput,
): Promise<BookingRecord> {
  const pool = await getPool();
  const createdAt = new Date().toISOString();
  const res = await pool.query<PgRow>(
    `INSERT INTO bookings (
      id, created_at, status,
      service_id, service_name, duration_minutes,
      price_usd, price_jmd, quote_currency,
      area, area_custom, address, address_notes,
      preferred_date, preferred_time, preferred_window,
      client_name, email, phone, message, consent,
      source, calendly_invitee_uri, calendly_event_uri
    ) VALUES (
      $1, $2::timestamptz, $3,
      $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12, $13,
      $14::date, $15, $16,
      $17, $18, $19, $20, $21,
      $22, $23, $24
    )
    ON CONFLICT (calendly_invitee_uri) DO UPDATE SET
      status = EXCLUDED.status,
      service_name = EXCLUDED.service_name,
      duration_minutes = EXCLUDED.duration_minutes,
      preferred_date = EXCLUDED.preferred_date,
      preferred_time = EXCLUDED.preferred_time,
      preferred_window = EXCLUDED.preferred_window,
      client_name = EXCLUDED.client_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      message = EXCLUDED.message,
      calendly_event_uri = EXCLUDED.calendly_event_uri
    RETURNING *`,
    [
      crypto.randomUUID(),
      createdAt,
      input.status,
      "calendly",
      input.serviceName || "Calendly session",
      input.durationMinutes || 60,
      0,
      null,
      null,
      input.area || "other",
      input.areaCustom || "Calendly",
      input.address || "Captured in Calendly",
      input.addressNotes || null,
      input.preferredDate,
      input.preferredTime || null,
      input.preferredWindow || null,
      input.name || "Calendly guest",
      input.email || "",
      input.phone || "-",
      input.message || null,
      true,
      "calendly",
      input.calendlyInviteeUri,
      input.calendlyEventUri || null,
    ],
  );
  const row = res.rows[0];
  if (!row) throw new Error("[bookings-db] Calendly upsert returned no row");
  return rowToRecord(row);
}
