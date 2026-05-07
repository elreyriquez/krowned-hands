import type { BookingRecord } from "./bookings";
import { formatServiceAreaLabel } from "./services";
import { formatJmd, formatUsd } from "./pricing";

/** Domains Resend will not accept as `from` without verifying that domain (avoid noisy 403s). */
const RESEND_FROM_BLOCKED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
]);

function extractEmailDomain(fromHeader: string): string | null {
  const raw = fromHeader.trim();
  const angle = raw.match(/<([^>]+)>/);
  const addr = (angle?.[1] ?? raw).trim();
  const at = addr.lastIndexOf("@");
  if (at < 0) return null;
  return addr.slice(at + 1).toLowerCase();
}

function resendFromBlockedReason(from: string): string | undefined {
  const domain = extractEmailDomain(from);
  if (!domain) return "could not parse BOOKINGS_FROM_EMAIL";
  if (RESEND_FROM_BLOCKED_DOMAINS.has(domain)) {
    return `"@${domain}" cannot be used as Resend From — add and verify your own domain at https://resend.com/domains and set BOOKINGS_FROM_EMAIL to e.g. bookings@yourdomain.com`;
  }
  return undefined;
}

/**
 * Best-effort notification hook. Supports two optional paths:
 *
 *  1. Resend API (recommended): set RESEND_API_KEY + BOOKINGS_EMAIL.
 *  2. Generic webhook: set BOOKINGS_WEBHOOK_URL (POSTs the record as JSON).
 *
 * If neither is set, the booking is only persisted + logged. The booking
 * response to the user is unaffected by notification failure.
 */
export async function notifyNewBooking(record: BookingRecord): Promise<void> {
  const jobs: Promise<void>[] = [];

  if (process.env.RESEND_API_KEY && process.env.BOOKINGS_EMAIL) {
    const from = process.env.BOOKINGS_FROM_EMAIL?.trim();
    if (!from) {
      console.warn(
        "[notify] resend skipped: set BOOKINGS_FROM_EMAIL to an address on a domain verified at https://resend.com/domains (Resend does not allow @gmail.com as From).",
      );
    } else {
      const blocked = resendFromBlockedReason(from);
      if (blocked) {
        console.warn("[notify] resend skipped:", blocked);
      } else {
        jobs.push(sendResendEmail(record, from).catch((err) => console.error("[notify] resend failed", err)));
      }
    }
  }
  if (process.env.BOOKINGS_WEBHOOK_URL) {
    jobs.push(sendWebhook(record).catch((err) => console.error("[notify] webhook failed", err)));
  }

  if (jobs.length === 0) {
    console.info("[notify] new booking", { id: record.id, name: record.name, service: record.serviceName });
    return;
  }
  await Promise.allSettled(jobs);
}

async function sendResendEmail(record: BookingRecord, from: string): Promise<void> {
  const to = process.env.BOOKINGS_EMAIL!;
  const subject = `New reservation: ${record.name} · ${record.serviceName}`;
  const when =
    record.preferredWindow ||
    (record.preferredTime ? `${record.preferredTime}` : "TBD");
  const priceLine =
    record.priceJmd != null
      ? `${formatUsd(record.priceUsd)} · ${formatJmd(record.priceJmd)}${
          record.quoteCurrency === "jmd" ? " (client viewed JMD)" : ""
        }`
      : `${formatUsd(record.priceUsd)}`;
  const body = [
    `${record.name} requested a ${record.serviceName} (${record.durationMinutes} min). ${priceLine}.`,
    `Area: ${formatServiceAreaLabel(record.area, record.areaCustom)}`,
    `Address: ${record.address}${record.addressNotes ? ` (${record.addressNotes})` : ""}`,
    `Preferred: ${record.preferredDate} · ${when}`,
    `Email: ${record.email}`,
    `Phone: ${record.phone}`,
    record.message ? `Note: ${record.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ to: [to], from, subject, text: body }),
  });
  const errText = await res.text();
  if (!res.ok) {
    if (res.status === 403 && errText.includes("not verified")) {
      console.warn(
        "[notify] Resend: the From domain must show Verified at https://resend.com/domains (add DNS records and wait — Pending is not enough to send).",
      );
    }
    throw new Error(`resend ${res.status}: ${errText}`);
  }
}

async function sendWebhook(record: BookingRecord): Promise<void> {
  const res = await fetch(process.env.BOOKINGS_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    throw new Error(`webhook ${res.status}: ${await res.text()}`);
  }
}
