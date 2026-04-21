import { SERVICE_AREAS, findService } from "./services";

export type BookingInput = {
  serviceId?: string;
  area?: string;
  address?: string;
  addressNotes?: string;
  preferredDate?: string;
  preferredWindow?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  consent?: boolean | "on" | "true";
};

export type ValidatedBooking = {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  priceUsd: number;
  area: string;
  address: string;
  addressNotes?: string;
  preferredDate: string;
  preferredWindow: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  consent: boolean;
};

export type ValidationResult =
  | { ok: true; data: ValidatedBooking }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-.\s\d]{7,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function s(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function validateBooking(input: BookingInput): ValidationResult {
  const errors: Record<string, string> = {};

  const serviceId = s(input.serviceId);
  const service = serviceId ? findService(serviceId) : undefined;
  if (!service) errors.serviceId = "Please choose a session type.";

  const area = s(input.area);
  if (!SERVICE_AREAS.some((a) => a.id === area)) {
    errors.area = "Choose Kingston or Montego Bay.";
  }

  const address = s(input.address);
  if (address.length < 6) errors.address = "Full service address is required.";

  const preferredDate = s(input.preferredDate);
  if (!DATE_RE.test(preferredDate)) {
    errors.preferredDate = "Please pick a preferred date.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(preferredDate + "T00:00:00");
    if (picked < today) errors.preferredDate = "Pick today or a future date.";
  }

  const preferredWindow = s(input.preferredWindow);
  if (!preferredWindow) errors.preferredWindow = "Choose a preferred time window.";

  const name = s(input.name);
  if (name.length < 2) errors.name = "Please share your name.";

  const email = s(input.email);
  if (!EMAIL_RE.test(email)) errors.email = "A valid email helps us confirm.";

  const phone = s(input.phone);
  if (!PHONE_RE.test(phone)) errors.phone = "A phone number we can reach you on.";

  const consent =
    input.consent === true || input.consent === "on" || input.consent === "true";
  if (!consent) errors.consent = "Please acknowledge the booking terms.";

  if (Object.keys(errors).length > 0 || !service) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      serviceId,
      serviceName: service!.name,
      durationMinutes: service!.durationMinutes,
      priceUsd: service!.priceUsd,
      area,
      address,
      addressNotes: s(input.addressNotes) || undefined,
      preferredDate,
      preferredWindow,
      name,
      email,
      phone,
      message: s(input.message) || undefined,
      consent: true,
    },
  };
}
