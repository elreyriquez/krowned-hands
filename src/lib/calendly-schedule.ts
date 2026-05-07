import type { ValidatedBooking } from "./validation";

type CalendlyCustomQuestion = {
  name?: string;
  position?: number;
  required?: boolean;
  enabled?: boolean;
  type?: string;
  answer_choices?: string[];
};

type EventTypeResource = {
  locations?: Array<{ kind?: string }> | null;
  custom_questions?: CalendlyCustomQuestion[] | null;
};

const API_BASE = "https://api.calendly.com";

export type CalendlyInviteeOutcome =
  | { ok: true; inviteeUri: string; eventUri?: string; startTimeUsed?: string }
  | {
      ok: false;
      /** Stable machine code for logs/support */
      code: string;
      /** Safe human hint (no secrets) */
      detail?: string;
      httpStatus?: number;
    };

function bearer(): string | undefined {
  return process.env.CALENDLY_API_TOKEN?.trim();
}

/** Full URI `https://api.calendly.com/event_types/{uuid}` — accepts bare UUID too. */
export function normalizeEventTypeUri(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://api.calendly.com/event_types/${t}`;
}

/** Map site session → Calendly event type URI from GET /event_types. */
export function resolveCalendlyEventTypeUri(serviceId: string): string | null {
  const perService: Record<string, string | undefined> = {
    "krowned-reset-60": process.env.CALENDLY_EVENT_TYPE_URI_KROWNED_RESET_60,
    "krowned-restore-90": process.env.CALENDLY_EVENT_TYPE_URI_KROWNED_RESTORE_90,
    "krowned-renew-120": process.env.CALENDLY_EVENT_TYPE_URI_KROWNED_RENEW_120,
  };
  const specific = perService[serviceId]?.trim();
  const chosen = specific || process.env.CALENDLY_EVENT_TYPE_URI?.trim();
  return chosen ? normalizeEventTypeUri(chosen) : null;
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

type AvailableTimesResponse = {
  collection?: Array<{ start_time?: string; invitees_remaining?: number }>;
};

type CreateInviteeResponse = Record<string, unknown>;

async function calendlyFetchAuth(
  pathWithQuery: string,
  token: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; text: string }> {
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, status: res.status, text };
  return { ok: true, text };
}

async function calendlyPostAuth(
  path: string,
  token: string,
  body: unknown,
): Promise<{ ok: true; text: string } | { ok: false; status: number; text: string }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, status: res.status, text };
  return { ok: true, text };
}

function parseCalendlyError(text: string): string | undefined {
  try {
    const j = JSON.parse(text) as {
      title?: string;
      message?: string;
      details?: Array<{ message?: string }>;
    };
    const detailMsg = j.details?.map((d) => d.message).filter(Boolean).join("; ");
    return [j.title, j.message, detailMsg].filter(Boolean).join(" — ") || undefined;
  } catch {
    return text.slice(0, 280) || undefined;
  }
}

function eventTypeUuid(eventTypeUri: string): string {
  return eventTypeUri.replace(/^.*\/event_types\//i, "").replace(/\/$/, "");
}

/** Full event type resource (locations + custom questions). `null` = GET failed. */
async function fetchEventTypeResource(
  token: string,
  eventTypeUri: string,
): Promise<EventTypeResource | null> {
  const uuid = eventTypeUuid(eventTypeUri);
  if (!uuid) return null;
  const got = await calendlyFetchAuth(`/event_types/${uuid}`, token);
  if (!got.ok) return null;
  try {
    const j = JSON.parse(got.text) as { resource?: EventTypeResource };
    return j.resource ?? null;
  } catch {
    return null;
  }
}

function locationKindsFromResource(resource: EventTypeResource | null): string[] | null {
  if (!resource) return null;
  const locs = resource.locations;
  if (!locs || locs.length === 0) return [];
  return locs.map((l) => l.kind).filter((k): k is string => Boolean(k));
}

/** Kinds where Calendly expects invitee-supplied details in `location.location`. */
const LOCATION_KINDS_NEED_INVITEE_ADDRESS = new Set(["ask_invitee", "outbound_call"]);

/**
 * Builds `body.location` so `kind` always matches the event type's configured options.
 * Avoids 400 "invalid location choice" when env lists the wrong kind (e.g. physical vs ask_invitee).
 */
function buildInviteeLocationPayload(args: {
  resource: EventTypeResource | null;
  envKindRaw: string | undefined;
  addressLine: string;
}): Record<string, string> | undefined {
  const envTrim = args.envKindRaw?.trim();
  const envLower = envTrim?.toLowerCase();
  if (envLower === "omit" || envLower === "none") return undefined;

  const allowed = locationKindsFromResource(args.resource);

  // Could not read event type — behave like before: only send location if env set.
  if (allowed === null) {
    if (!envTrim) return undefined;
    const kind = envTrim;
    const loc: Record<string, string> = { kind };
    if (LOCATION_KINDS_NEED_INVITEE_ADDRESS.has(kind) && args.addressLine) {
      loc.location = args.addressLine;
    }
    return loc;
  }

  if (allowed.length === 0) return undefined;

  let chosen: string;
  if (envTrim && allowed.includes(envTrim)) {
    chosen = envTrim;
  } else if (allowed.includes("ask_invitee")) {
    chosen = "ask_invitee";
  } else {
    chosen = allowed[0]!;
  }

  if (envTrim && !allowed.includes(envTrim)) {
    console.info(
      "[calendly-schedule] CALENDLY_BOOKING_LOCATION_KIND=%s not configured on event type; using %s (allowed: %s)",
      envTrim,
      chosen,
      allowed.join(", "),
    );
  }

  const loc: Record<string, string> = { kind: chosen };
  if (LOCATION_KINDS_NEED_INVITEE_ADDRESS.has(chosen) && args.addressLine) {
    loc.location = args.addressLine;
  }
  return loc;
}

const BOOKING_FALLBACK_LINE =
  "Submitted via krownedhands.com booking — therapist will confirm details at the session.";

/**
 * Calendly rejects POST /invitees when required custom questions have no answer.
 * Map site fields + heuristics onto each required question from GET /event_types.
 */
function buildQuestionsAndAnswers(
  resource: EventTypeResource | null,
  data: ValidatedBooking,
): Array<{ question: string; answer: string; position: number }> {
  const questions = resource?.custom_questions;
  if (!questions?.length) return [];

  const sorted = [...questions]
    .filter((q) => q.enabled !== false)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const out: Array<{ question: string; answer: string; position: number }> = [];

  for (const q of sorted) {
    if (!q.required) continue;

    const label = (q.name || "").trim();
    const nameLower = label.toLowerCase();
    const typeLower = (q.type || "").toLowerCase();
    let answer = "";

    if (typeLower === "phone_number" || nameLower.includes("phone") || nameLower.includes("contact number")) {
      answer = data.phone.trim();
    } else if (
      nameLower.includes("health") ||
      nameLower.includes("sickness") ||
      nameLower.includes("contraindicate") ||
      nameLower.includes("ailments") ||
      nameLower.includes("conditions that may")
    ) {
      answer =
        data.message?.trim() ||
        "No acute conditions disclosed on the web form — please confirm at the appointment if anything changes.";
    } else if (nameLower.includes("goal") || nameLower.includes("outcomes") || nameLower.includes("hope to achieve")) {
      answer =
        data.message?.trim() ||
        "General wellness / relaxation — happy to discuss priorities at the session.";
    } else if (nameLower.includes("allerg") || nameLower.includes("lotion") || nameLower.includes("oil")) {
      answer = "None reported on the booking form.";
    } else if (
      nameLower.includes("anything else") ||
      nameLower.includes("consider before") ||
      nameLower.includes("prepare for our meeting")
    ) {
      answer = [data.addressNotes, data.message].filter(Boolean).join(" — ").trim() || BOOKING_FALLBACK_LINE;
    } else if (typeLower === "single_select" && q.answer_choices?.length) {
      const choices = q.answer_choices;
      const dm = data.durationMinutes;
      const match =
        choices.find((c) => dm === 60 && /\b60\b/.test(c)) ||
        choices.find((c) => dm === 90 && /\b90\b/.test(c)) ||
        choices.find((c) => dm === 120 && /\b120\b/.test(c)) ||
        choices.find((c) => c.toLowerCase().includes("reset") && dm === 60) ||
        choices.find((c) => c.toLowerCase().includes("restore") && dm === 90) ||
        choices.find((c) => c.toLowerCase().includes("renew") && dm === 120) ||
        choices[0];
      answer = match ?? "";
    } else {
      answer =
        data.message?.trim() ||
        `${BOOKING_FALLBACK_LINE} (${data.serviceName}, ${data.preferredWindow}).`;
    }

    if (!answer.trim()) {
      answer = BOOKING_FALLBACK_LINE;
    }

    out.push({
      question: label || `Question ${q.position ?? 0}`,
      answer: answer.trim(),
      position: q.position ?? 0,
    });
  }

  return out;
}

/** Pick Calendly's canonical slot instant — POST /invitees usually rejects times not in this list. */
async function resolveStartTimeFromAvailability(args: {
  token: string;
  eventTypeUri: string;
  preferredDate: string;
  preferredTimeHHMM: string;
}): Promise<{ startTime: string } | { error: string; httpStatus?: number }> {
  const dayStart = kingstonLocalToUtcIso(args.preferredDate, "00:00");
  const dayEnd = kingstonLocalToUtcIso(args.preferredDate, "23:59");
  const q = [
    `event_type=${encodeURIComponent(args.eventTypeUri)}`,
    `start_time=${encodeURIComponent(dayStart)}`,
    `end_time=${encodeURIComponent(dayEnd)}`,
  ].join("&");

  const got = await calendlyFetchAuth(`/event_type_available_times?${q}`, args.token);
  if (!got.ok) {
    return {
      error: parseCalendlyError(got.text) || `available_times_http_${got.status}`,
      httpStatus: got.status,
    };
  }

  let parsed: AvailableTimesResponse;
  try {
    parsed = JSON.parse(got.text) as AvailableTimesResponse;
  } catch {
    return { error: "available_times_invalid_json" };
  }

  const slots = (parsed.collection ?? [])
    .filter(
      (s) =>
        s.invitees_remaining === undefined ||
        s.invitees_remaining === null ||
        s.invitees_remaining > 0,
    )
    .map((s) => s.start_time)
    .filter((s): s is string => Boolean(s));

  if (slots.length === 0) {
    return { error: "no_open_slots_that_day_in_calendly" };
  }

  const desiredMs = new Date(
    kingstonLocalToUtcIso(args.preferredDate, args.preferredTimeHHMM),
  ).getTime();

  const toleranceMs = 90 * 1000;
  const exact = slots.find((iso) => Math.abs(new Date(iso).getTime() - desiredMs) <= toleranceMs);
  if (exact) return { startTime: exact };

  let best = slots[0];
  let bestDiff = Infinity;
  for (const iso of slots) {
    const diff = Math.abs(new Date(iso).getTime() - desiredMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = iso;
    }
  }
  return { startTime: best };
}

function extractInviteeUri(res: CreateInviteeResponse): string | undefined {
  const resource = res.resource as Record<string, unknown> | undefined;
  if (!resource) return undefined;

  if (typeof resource.uri === "string" && resource.uri.includes("/invitees/")) {
    return resource.uri;
  }

  const invitee = resource.invitee as { uri?: string } | undefined;
  if (typeof invitee?.uri === "string") return invitee.uri;

  const se = resource.scheduled_event;
  if (se && typeof se === "object" && se !== null) {
    const invs = (se as { invitees?: Array<{ uri?: string }> }).invitees;
    const first = invs?.[0]?.uri;
    if (typeof first === "string") return first;
  }

  return undefined;
}

function extractEventUri(res: CreateInviteeResponse): string | undefined {
  const resource = res.resource as Record<string, unknown> | undefined;
  if (!resource) return undefined;
  const se = resource.scheduled_event;
  if (typeof se === "string") return se;
  if (se && typeof se === "object" && se !== null && "uri" in se) {
    const u = (se as { uri?: string }).uri;
    if (typeof u === "string") return u;
  }
  const evt = resource.event;
  if (typeof evt === "string") return evt;
  return undefined;
}

function extractInviteeUriFromRaw(text: string): string | undefined {
  const m = text.match(/https:\/\/api\.calendly\.com\/scheduled_events\/[^/]+\/invitees\/[^"]+/);
  return m?.[0];
}

/**
 * Creates a Calendly scheduled event via Scheduling API (POST /invitees).
 * Requires paid Calendly + PAT scopes for scheduling + availability reads.
 *
 * @see https://developer.calendly.com/schedule-events-with-ai-agents
 */
export async function createInviteeForBooking(
  data: ValidatedBooking,
): Promise<CalendlyInviteeOutcome> {
  const token = bearer();
  const eventType = resolveCalendlyEventTypeUri(data.serviceId);

  if (!token) {
    return {
      ok: false,
      code: "skipped_missing_calendly_api_token",
      detail: "Set CALENDLY_API_TOKEN on the server.",
    };
  }
  if (!eventType) {
    return {
      ok: false,
      code: "skipped_missing_event_type_uri",
      detail:
        "Set CALENDLY_EVENT_TYPE_URI or CALENDLY_EVENT_TYPE_URI_KROWNED_* (full URI or UUID).",
    };
  }

  const slot = await resolveStartTimeFromAvailability({
    token,
    eventTypeUri: eventType,
    preferredDate: data.preferredDate,
    preferredTimeHHMM: data.preferredTime,
  });

  if ("error" in slot) {
    return {
      ok: false,
      code: "calendly_available_times_failed",
      detail: slot.error,
      httpStatus: slot.httpStatus,
    };
  }

  const startTime = slot.startTime;

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

  // Do not send a partial `tracking` object — some Calendly org integrations
  // treat every tracking.* field as required and return 400 ("is missing").
  const body: Record<string, unknown> = {
    event_type: eventType,
    start_time: startTime,
    invitee,
  };

  const eventTypeResource = await fetchEventTypeResource(token, eventType);

  const locationPayload = buildInviteeLocationPayload({
    resource: eventTypeResource,
    envKindRaw: process.env.CALENDLY_BOOKING_LOCATION_KIND,
    addressLine: addrLine || data.address,
  });
  if (locationPayload) body.location = locationPayload;

  const qna = buildQuestionsAndAnswers(eventTypeResource, data);
  if (qna.length > 0) body.questions_and_answers = qna;

  const posted = await calendlyPostAuth("/invitees", token, body);
  if (!posted.ok) {
    return {
      ok: false,
      code: "calendly_invitees_post_failed",
      detail: parseCalendlyError(posted.text),
      httpStatus: posted.status,
    };
  }

  let json: CreateInviteeResponse;
  try {
    json = JSON.parse(posted.text) as CreateInviteeResponse;
  } catch {
    return {
      ok: false,
      code: "calendly_invitees_invalid_json",
      detail: posted.text.slice(0, 200),
    };
  }

  let inviteeUri = extractInviteeUri(json);
  if (!inviteeUri) inviteeUri = extractInviteeUriFromRaw(posted.text);

  if (!inviteeUri) {
    return {
      ok: false,
      code: "calendly_invitees_missing_uri",
      detail:
        "Calendly returned 200 but no invitee URI was found. Check logs for raw response shape.",
    };
  }

  const eventUri = extractEventUri(json);
  return { ok: true, inviteeUri, eventUri, startTimeUsed: startTime };
}
