import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { upsertFromCalendly } from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CalendlyPayload = {
  event?: string;
  payload?: {
    event?: string;
    invitee?: {
      uri?: string;
      name?: string;
      email?: string;
      questions_and_answers?: Array<{ question?: string; answer?: string }>;
      text_reminder_number?: string | null;
      canceled?: boolean;
    };
    scheduled_event?: {
      uri?: string;
      name?: string;
      event_type?: string;
      start_time?: string;
      end_time?: string;
      location?: { type?: string; location?: string };
    };
  };
};

function parseIsoToDateTime(iso?: string): { preferredDate: string; preferredTime?: string } {
  if (!iso) return { preferredDate: new Date().toISOString().slice(0, 10) };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { preferredDate: new Date().toISOString().slice(0, 10) };
  return {
    preferredDate: d.toISOString().slice(0, 10),
    preferredTime: d.toISOString().slice(11, 16),
  };
}

function minutesBetween(start?: string, end?: string): number {
  if (!start || !end) return 60;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 60;
  return Math.round((b - a) / 60000);
}

function getPhone(payload: CalendlyPayload["payload"]): string | undefined {
  const direct = payload?.invitee?.text_reminder_number;
  if (direct) return direct;
  const qa = payload?.invitee?.questions_and_answers ?? [];
  const match = qa.find((q) => (q.question || "").toLowerCase().includes("phone"));
  return match?.answer;
}

function verifyCalendlySignature(rawBody: string, signatureHeader: string): boolean {
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY?.trim();
  if (!key) return true;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [k, ...rest] = part.split("=");
      return [k?.trim() || "", rest.join("=").trim()];
    }),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const signed = `${t}.${rawBody}`;
  const expected = crypto.createHmac("sha256", key).update(signed).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();
  let body: CalendlyPayload;
  try {
    body = JSON.parse(raw) as CalendlyPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const sig = req.headers.get("Calendly-Webhook-Signature") || "";
  if (!verifyCalendlySignature(raw, sig)) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  const event = body.event;
  const inviteeUri = body.payload?.invitee?.uri;
  if (!inviteeUri) {
    return NextResponse.json({ ok: true, ignored: true, reason: "missing invitee uri" });
  }

  const scheduled = body.payload?.scheduled_event;
  const startTime = scheduled?.start_time;
  const endTime = scheduled?.end_time;
  const { preferredDate, preferredTime } = parseIsoToDateTime(startTime);
  const status = event === "invitee.canceled" ? "cancelled" : "confirmed";

  await upsertFromCalendly({
    calendlyInviteeUri: inviteeUri,
    calendlyEventUri: scheduled?.uri,
    status,
    serviceName: scheduled?.name || "Calendly session",
    durationMinutes: minutesBetween(startTime, endTime),
    preferredDate,
    preferredTime,
    preferredWindow:
      preferredTime && endTime
        ? `${preferredTime}-${new Date(endTime).toISOString().slice(11, 16)}`
        : undefined,
    name: body.payload?.invitee?.name || "Calendly guest",
    email: body.payload?.invitee?.email || "",
    phone: getPhone(body.payload),
    address:
      scheduled?.location?.location ||
      (scheduled?.location?.type ? `Location: ${scheduled.location.type}` : "Captured in Calendly"),
    message: `Synced from Calendly (${event || "event"})`,
  });

  return NextResponse.json({ ok: true });
}
