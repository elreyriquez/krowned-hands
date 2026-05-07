import { upsertFromCalendly } from "./bookings";

type CalendlyListResponse<T> = {
  collection?: T[];
  pagination?: { next_page?: string | null };
};

type CalendlyUser = {
  uri?: string;
  current_organization?: string;
};

type CalendlyEvent = {
  uri?: string;
  name?: string;
  start_time?: string;
  end_time?: string;
  location?: { type?: string; location?: string };
};

type CalendlyInvitee = {
  uri?: string;
  name?: string;
  email?: string;
  status?: string;
  text_reminder_number?: string | null;
  questions_and_answers?: Array<{ question?: string; answer?: string }>;
};

const API_BASE = "https://api.calendly.com";

function token(): string {
  const value = process.env.CALENDLY_API_TOKEN?.trim();
  if (!value) throw new Error("CALENDLY_API_TOKEN is not set.");
  return value;
}

function normalizeApiPath(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    const u = new URL(pathOrUrl);
    return `${u.pathname}${u.search}`;
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
}

async function calendlyFetch<T>(pathOrUrl: string): Promise<T> {
  const path = normalizeApiPath(pathOrUrl);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[calendly] ${res.status} ${res.statusText} for ${path} ${body}`);
  }
  return (await res.json()) as T;
}

async function fetchAllCollection<T>(firstPath: string, maxPages = 12): Promise<T[]> {
  const out: T[] = [];
  let next: string | null | undefined = firstPath;
  let pages = 0;
  while (next && pages < maxPages) {
    const page: CalendlyListResponse<T> = await calendlyFetch<CalendlyListResponse<T>>(next);
    out.push(...(page.collection ?? []));
    next = page.pagination?.next_page || null;
    pages += 1;
  }
  return out;
}

function getPhone(invitee: CalendlyInvitee): string | undefined {
  if (invitee.text_reminder_number) return invitee.text_reminder_number;
  const qa = invitee.questions_and_answers ?? [];
  const match = qa.find((q) => (q.question || "").toLowerCase().includes("phone"));
  return match?.answer;
}

function toDateTime(iso?: string): { preferredDate: string; preferredTime?: string } {
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

function eventUuidFromUri(uri: string | undefined): string | null {
  if (!uri) return null;
  const m = uri.match(/scheduled_events\/([a-zA-Z0-9-]+)/);
  return m?.[1] ?? null;
}

export async function getCurrentCalendlyUser(): Promise<CalendlyUser> {
  const data = await calendlyFetch<{ resource?: CalendlyUser }>("/users/me");
  return data.resource ?? {};
}

export async function syncCalendlyRecentBookings(options?: {
  lookbackDays?: number;
  maxEvents?: number;
}): Promise<{ events: number; invitees: number; upserted: number }> {
  const lookbackDays = options?.lookbackDays ?? 30;
  const maxEvents = options?.maxEvents ?? 80;
  const user = await getCurrentCalendlyUser();
  if (!user.uri) throw new Error("Calendly user URI missing from /users/me response.");

  const minStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
  const eventPath = `/scheduled_events?user=${encodeURIComponent(user.uri)}&min_start_time=${encodeURIComponent(minStart)}&count=100&sort=start_time:desc`;
  const events = (await fetchAllCollection<CalendlyEvent>(eventPath)).slice(0, maxEvents);

  let inviteeCount = 0;
  let upserted = 0;

  for (const ev of events) {
    const uuid = eventUuidFromUri(ev.uri);
    if (!uuid) continue;
    const inviteesPath = `/scheduled_events/${uuid}/invitees?count=100`;
    const invitees = await fetchAllCollection<CalendlyInvitee>(inviteesPath, 6);
    inviteeCount += invitees.length;

    for (const inv of invitees) {
      if (!inv.uri) continue;
      const { preferredDate, preferredTime } = toDateTime(ev.start_time);
      const endHHMM = ev.end_time ? new Date(ev.end_time).toISOString().slice(11, 16) : "";
      await upsertFromCalendly({
        calendlyInviteeUri: inv.uri,
        calendlyEventUri: ev.uri,
        status: inv.status === "canceled" ? "cancelled" : "confirmed",
        serviceName: ev.name || "Calendly session",
        durationMinutes: minutesBetween(ev.start_time, ev.end_time),
        preferredDate,
        preferredTime,
        preferredWindow: preferredTime && endHHMM ? `${preferredTime}-${endHHMM}` : undefined,
        name: inv.name || "Calendly guest",
        email: inv.email || "",
        phone: getPhone(inv),
        address:
          ev.location?.location ||
          (ev.location?.type ? `Location: ${ev.location.type}` : "Captured in Calendly"),
        message: "Synced from Calendly API",
      });
      upserted += 1;
    }
  }

  return { events: events.length, invitees: inviteeCount, upserted };
}
