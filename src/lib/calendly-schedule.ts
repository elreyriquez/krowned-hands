import type { ValidatedBooking } from "./validation";

const API_BASE = "https://api.calendly.com";

function bearer(): string | undefined {
  return process.env.CALENDLY_API_TOKEN?.trim();
}

/** Map site session → Calendly event type URI from GET /event_types. */
export function resolveCalendlyEventTypeUri(serviceId: string): string | null {
  const perService: Record<string, string | undefined> = {
    "krowned-reset-60": process.env.CALENDLY_EVENT_TYPE_URI_KROWNED_RESET_60,
    "krowned-restore-90": process.env.CALENDLY_EVENT_TYPE_URI_KROWNED_RESTORE_90,
    "krowned-renew-120": process.env.CALENDLY_EVENT_TYPE_URI_KROWNED_RENEW_120,
  };
  const specific = perService[serviceId]?.trim();
  if (specific) return specific;
  return process.env.CALENDLY_EVENT_TYPE_URI?.trim() || null;
}

/** Jamaica local wall clock → UTC ISO (America/Jamaica is UTC−5 year‑round). */
export function kingstonLocalToUtcIso(dateStr: string, hhmm: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const utcMs = Date.UTC(y, mo - 1, d, h + 5, mi, 0, 0);
  return new Date(utcMs).toISOString();
}

function normalizeSmsPhone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  if (digits.startsWith("1876")) return `+${digits}`;
  if (digits.startsWith("876")) return `+1${digits}`;
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  return `+${digits}`;
}

type CreateInviteeResponse = {
  resource?: {
    uri?: string;
    scheduled_event?: string;
    event?: string;
  };
};

/**
 * Creates a Calendly scheduled event via Scheduling API (POST /invitees).
 * Requires a paid Calendly plan + PAT/OAuth scopes for scheduling.
 *
 * @see https://developer.calendly.com/schedule-events-with-ai-agents
 */
export async function createInviteeForBooking(
  data: ValidatedBooking,
): Promise<{ inviteeUri: string; eventUri?: string } | null> {
  const token = bearer();
  const eventType = resolveCalendlyEventTypeUri(data.serviceId);
  if (!token || !eventType) {
    console.warn(
      "[calendly-schedule] Skipping Calendly create: set CALENDLY_API_TOKEN and CALENDLY_EVENT_TYPE_URI (or per-service URIs).",
    );
    return null;
  }

  const startTime = kingstonLocalToUtcIso(data.preferredDate, data.preferredTime);
  const locationKind = process.env.CALENDLY_BOOKING_LOCATION_KIND?.trim();

  const addrLine = [data.address, data.areaCustom, data.addressNotes, data.message]
    .filter(Boolean)
    .join(" · ");

  const invitee: Record<string, string> = {
    name: data.name,
    email: data.email,
    timezone: "America/Jamaica",
  };
  const sms = normalizeSmsPhone(data.phone);
  if (sms) invitee.text_reminder_number = sms;

  const body: Record<string, unknown> = {
    event_type: eventType,
    start_time: startTime,
    invitee,
    tracking: { utm_source: "krownedhands.com", utm_medium: "booking_form" },
  };

  // Required for many event types (mobile / ask-invitee location). Omit with CALENDLY_BOOKING_LOCATION_KIND=omit
  if (locationKind && locationKind !== "omit" && locationKind !== "none") {
    body.location = {
      kind: locationKind,
      location: addrLine || data.address,
    };
  }

  try {
    const res = await fetch(`${API_BASE}/invitees`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[calendly-schedule] POST /invitees failed", res.status, text);
      return null;
    }
    let json: CreateInviteeResponse;
    try {
      json = JSON.parse(text) as CreateInviteeResponse;
    } catch {
      console.error("[calendly-schedule] Invalid JSON from /invitees", text);
      return null;
    }
    const inviteeUri = json.resource?.uri;
    if (!inviteeUri) {
      console.error("[calendly-schedule] Response missing invitee uri", text);
      return null;
    }
    const eventUri =
      typeof json.resource?.scheduled_event === "string"
        ? json.resource.scheduled_event
        : typeof json.resource?.event === "string"
          ? json.resource.event
          : undefined;
    return { inviteeUri, eventUri };
  } catch (err) {
    console.error("[calendly-schedule] Request error", err);
    return null;
  }
}
