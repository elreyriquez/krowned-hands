import type { BookingRecord } from "./bookings";

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
    jobs.push(sendResendEmail(record).catch((err) => console.error("[notify] resend failed", err)));
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

async function sendResendEmail(record: BookingRecord): Promise<void> {
  const to = process.env.BOOKINGS_EMAIL!;
  const from = process.env.BOOKINGS_FROM_EMAIL || "bookings@krownedhands.com";
  const subject = `New reservation: ${record.name} · ${record.serviceName}`;
  const when =
    record.preferredWindow ||
    (record.preferredTime ? `${record.preferredTime}` : "TBD");
  const body = [
    `${record.name} requested a ${record.serviceName} (${record.durationMinutes} min).`,
    `Area: ${record.area}`,
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
  if (!res.ok) {
    throw new Error(`resend ${res.status}: ${await res.text()}`);
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
