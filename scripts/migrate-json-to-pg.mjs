/**
 * One-off: copy `.data/bookings.json` into PostgreSQL when `DATABASE_URL` is set.
 * Skips rows whose id already exists (`ON CONFLICT DO NOTHING`).
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/migrate-json-to-pg.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("Set DATABASE_URL to your Postgres connection string.");
  process.exit(1);
}

const jsonPath = path.join(process.cwd(), ".data", "bookings.json");

async function main() {
  const raw = await fs.readFile(jsonPath, "utf8").catch(() => "[]");
  let list;
  try {
    list = JSON.parse(raw);
  } catch {
    console.error("Invalid JSON in", jsonPath);
    process.exit(1);
  }
  if (!Array.isArray(list) || list.length === 0) {
    console.log("No records in", jsonPath, "— nothing to migrate.");
    process.exit(0);
  }

  const pool = new pg.Pool({ connectionString: url });

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
      consent BOOLEAN NOT NULL
    );
  `);

  let inserted = 0;
  let skipped = 0;

  for (const r of list) {
    const res = await pool.query(
      `INSERT INTO bookings (
        id, created_at, status,
        service_id, service_name, duration_minutes,
        price_usd, price_jmd, quote_currency,
        area, area_custom, address, address_notes,
        preferred_date, preferred_time, preferred_window,
        client_name, email, phone, message, consent
      ) VALUES (
        $1, $2::timestamptz, $3,
        $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12, $13,
        $14::date, $15, $16,
        $17, $18, $19, $20, $21
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        r.id,
        r.createdAt,
        r.status ?? "new",
        r.serviceId,
        r.serviceName,
        r.durationMinutes,
        r.priceUsd,
        r.priceJmd ?? null,
        r.quoteCurrency ?? null,
        r.area,
        r.areaCustom ?? null,
        r.address,
        r.addressNotes ?? null,
        r.preferredDate,
        r.preferredTime ?? null,
        r.preferredWindow ?? null,
        r.name,
        r.email,
        r.phone,
        r.message ?? null,
        Boolean(r.consent),
      ],
    );
    if (res.rowCount === 1) inserted += 1;
    else skipped += 1;
  }

  await pool.end();
  console.log(`Done. Inserted ${inserted}, skipped (already present) ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
