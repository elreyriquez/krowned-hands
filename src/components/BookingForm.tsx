"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Service } from "@/lib/services";

type Props = {
  services: Service[];
  areas: { id: string; label: string }[];
};

type Step = 0 | 1 | 2 | 3;

type FormState = {
  serviceId: string;
  area: string;
  address: string;
  addressNotes: string;
  preferredDate: string;
  preferredWindow: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const TIME_WINDOWS = [
  "Morning · 8:00 AM – 11:00 AM",
  "Midday · 11:00 AM – 2:00 PM",
  "Afternoon · 2:00 PM – 5:00 PM",
  "Evening · 5:00 PM – 8:00 PM",
];

function todayIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BookingForm({ services, areas }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const initialService = useMemo(() => {
    const fromQuery = params.get("service") || "";
    return services.find((s) => s.id === fromQuery)?.id || services[0]?.id || "";
  }, [params, services]);

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({
    serviceId: initialService,
    area: areas[0]?.id ?? "",
    address: "",
    addressNotes: "",
    preferredDate: "",
    preferredWindow: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: string } | null>(null);

  const selectedService = services.find((s) => s.id === form.serviceId);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }

  function validateStep(current: Step): boolean {
    const e: Record<string, string> = {};
    if (current === 0) {
      if (!form.serviceId) e.serviceId = "Please choose a session.";
    } else if (current === 1) {
      if (!form.area) e.area = "Choose a service area.";
      if (form.address.trim().length < 6) e.address = "A full address helps us plan the visit.";
      if (!form.preferredDate) e.preferredDate = "Pick a preferred date.";
      else if (new Date(form.preferredDate) < new Date(todayIso()))
        e.preferredDate = "Pick today or a future date.";
      if (!form.preferredWindow) e.preferredWindow = "Choose a time window.";
    } else if (current === 2) {
      if (form.name.trim().length < 2) e.name = "Please share your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "A valid email please.";
      if (!/^[+()\-.\s\d]{7,}$/.test(form.phone)) e.phone = "A reachable phone number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => (Math.min(3, s + 1) as Step));
  }
  function goBack() {
    setStep((s) => (Math.max(0, s - 1) as Step));
  }

  async function submit() {
    if (!form.consent) {
      setErrors({ consent: "Please acknowledge the booking terms to continue." });
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.errors) setErrors(data.errors);
        setServerError(data?.message || "Could not submit — please try again.");
        setSubmitting(false);
        return;
      }
      setConfirmation({ id: data.id });
      setStep(3);
      router.replace("/book?confirmed=1", { scroll: true });
    } catch {
      setServerError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return <SuccessState id={confirmation.id} name={form.name} service={selectedService?.name} />;
  }

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8">
        <Stepper step={step} />
        {serverError ? (
          <p role="alert" className="mt-6 kh-error">
            {serverError}
          </p>
        ) : null}
        <div className="mt-8 kh-card">
          {step === 0 && (
            <StepService
              services={services}
              serviceId={form.serviceId}
              onChange={(id) => update("serviceId", id)}
              error={errors.serviceId}
            />
          )}
          {step === 1 && (
            <StepWhenWhere
              form={form}
              areas={areas}
              errors={errors}
              update={update}
            />
          )}
          {step === 2 && (
            <StepContact form={form} errors={errors} update={update} />
          )}
          {step === 3 && selectedService && (
            <StepReview
              form={form}
              service={selectedService}
              areas={areas}
              onConsent={(v) => update("consent", v)}
              error={errors.consent}
            />
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || submitting}
              className="kh-btn kh-btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            {step < 3 ? (
              <button type="button" onClick={goNext} className="kh-btn kh-btn-primary">
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !form.consent}
                className="kh-btn kh-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Confirm reservation"}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="lg:col-span-4">
        <Summary form={form} service={selectedService} areas={areas} />
      </aside>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Session", "When & Where", "Your details", "Review"];
  return (
    <ol className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[var(--kh-brown-soft)] overflow-x-auto">
      {labels.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={label} className="flex items-center gap-3 whitespace-nowrap">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
                active
                  ? "bg-[var(--kh-brown)] text-[var(--kh-cream)] border-[var(--kh-brown)]"
                  : done
                  ? "bg-[var(--kh-gold)] text-[var(--kh-brown)] border-[var(--kh-gold)]"
                  : "border-[var(--kh-line)] text-[var(--kh-brown-soft)]"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span className={active ? "text-[var(--kh-brown)]" : ""}>{label}</span>
            {i < labels.length - 1 ? <span className="mx-2 opacity-40">/</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

function StepService({
  services,
  serviceId,
  onChange,
  error,
}: {
  services: Service[];
  serviceId: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="font-serif text-2xl text-[var(--kh-brown)]">Choose your session</legend>
      <p className="mt-1 text-[var(--kh-brown-soft)]">
        Unsure? The Signature Session is the right starting point for most first visits.
      </p>
      <div className="mt-6 grid gap-3">
        {services.map((s) => {
          const selected = s.id === serviceId;
          return (
            <label
              key={s.id}
              className={`relative flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition ${
                selected
                  ? "border-[var(--kh-gold)] bg-[color-mix(in_srgb,var(--kh-gold)_10%,var(--kh-cream-soft))]"
                  : "border-[var(--kh-line)] bg-white/60 hover:border-[var(--kh-gold-deep)]"
              }`}
            >
              <input
                type="radio"
                name="serviceId"
                value={s.id}
                checked={selected}
                onChange={() => onChange(s.id)}
                className="mt-1.5 accent-[var(--kh-brown)]"
              />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-serif text-xl text-[var(--kh-brown)]">{s.name}</p>
                  <p className="font-serif text-lg text-[var(--kh-gold-deep)]">${s.priceUsd}</p>
                </div>
                <p className="text-xs tracking-[0.18em] uppercase text-[var(--kh-gold-deep)] mt-1">
                  {s.durationMinutes} minutes · {s.tagline}
                </p>
                <p className="mt-2 text-[var(--kh-brown-soft)] text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
      {error ? <p className="kh-error mt-2">{error}</p> : null}
    </fieldset>
  );
}

function StepWhenWhere({
  form,
  areas,
  errors,
  update,
}: {
  form: FormState;
  areas: { id: string; label: string }[];
  errors: Record<string, string>;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <fieldset className="grid gap-5">
      <legend className="font-serif text-2xl text-[var(--kh-brown)]">When & where</legend>
      <div>
        <label className="kh-label" htmlFor="area">Service area</label>
        <select
          id="area"
          className="kh-select"
          value={form.area}
          onChange={(e) => update("area", e.target.value)}
        >
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
        {errors.area ? <p className="kh-error">{errors.area}</p> : null}
      </div>

      <div>
        <label className="kh-label" htmlFor="address">Full service address</label>
        <input
          id="address"
          type="text"
          autoComplete="street-address"
          className="kh-input"
          placeholder="Street, apt/unit, neighbourhood, city"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
        <p className="kh-help">Private home, hotel, or villa — we keep this confidential.</p>
        {errors.address ? <p className="kh-error">{errors.address}</p> : null}
      </div>

      <div>
        <label className="kh-label" htmlFor="addressNotes">Arrival notes (optional)</label>
        <textarea
          id="addressNotes"
          className="kh-textarea"
          placeholder="Gate code, security desk, landmark, parking instructions…"
          value={form.addressNotes}
          onChange={(e) => update("addressNotes", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="kh-label" htmlFor="preferredDate">Preferred date</label>
          <input
            id="preferredDate"
            type="date"
            className="kh-input"
            min={todayIso()}
            value={form.preferredDate}
            onChange={(e) => update("preferredDate", e.target.value)}
          />
          {errors.preferredDate ? <p className="kh-error">{errors.preferredDate}</p> : null}
        </div>
        <div>
          <label className="kh-label" htmlFor="preferredWindow">Preferred time window</label>
          <select
            id="preferredWindow"
            className="kh-select"
            value={form.preferredWindow}
            onChange={(e) => update("preferredWindow", e.target.value)}
          >
            <option value="">Select a window…</option>
            {TIME_WINDOWS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          {errors.preferredWindow ? <p className="kh-error">{errors.preferredWindow}</p> : null}
        </div>
      </div>
    </fieldset>
  );
}

function StepContact({
  form,
  errors,
  update,
}: {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <fieldset className="grid gap-5">
      <legend className="font-serif text-2xl text-[var(--kh-brown)]">Your details</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="kh-label" htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="kh-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          {errors.name ? <p className="kh-error">{errors.name}</p> : null}
        </div>
        <div>
          <label className="kh-label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="kh-input"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          {errors.phone ? <p className="kh-error">{errors.phone}</p> : null}
        </div>
      </div>
      <div>
        <label className="kh-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="kh-input"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        {errors.email ? <p className="kh-error">{errors.email}</p> : null}
      </div>
      <div>
        <label className="kh-label" htmlFor="message">Anything we should know?</label>
        <textarea
          id="message"
          className="kh-textarea"
          placeholder="Injuries, preferences, areas to focus or avoid, medical notes…"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
        <p className="kh-help">Optional — shared only with Jordan for your session.</p>
      </div>
    </fieldset>
  );
}

function StepReview({
  form,
  service,
  areas,
  onConsent,
  error,
}: {
  form: FormState;
  service: Service;
  areas: { id: string; label: string }[];
  onConsent: (v: boolean) => void;
  error?: string;
}) {
  const areaLabel = areas.find((a) => a.id === form.area)?.label || form.area;
  const rows: [string, string | undefined][] = [
    ["Session", `${service.name} · ${service.durationMinutes} min · $${service.priceUsd}`],
    ["Area", areaLabel],
    ["Address", form.address],
    ["Arrival notes", form.addressNotes || "—"],
    ["Preferred", `${form.preferredDate} · ${form.preferredWindow}`],
    ["Name", form.name],
    ["Email", form.email],
    ["Phone", form.phone],
    ["Notes for Jordan", form.message || "—"],
  ];

  return (
    <fieldset>
      <legend className="font-serif text-2xl text-[var(--kh-brown)]">Review & confirm</legend>
      <p className="mt-1 text-[var(--kh-brown-soft)]">
        A quick glance before we send this to Jordan.
      </p>
      <dl className="mt-6 divide-y divide-[var(--kh-line)] border-y border-[var(--kh-line)]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-4 py-3 text-sm">
            <dt className="uppercase tracking-[0.14em] text-xs text-[var(--kh-brown-soft)]">{k}</dt>
            <dd className="col-span-2 text-[var(--kh-ink)] break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <label className="mt-6 flex items-start gap-3 text-sm text-[var(--kh-brown-soft)]">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => onConsent(e.target.checked)}
          className="mt-1 h-5 w-5 accent-[var(--kh-brown)]"
        />
        <span>
          I understand this is a reservation request — Jordan will confirm by message within 24
          hours. I&rsquo;ve shared accurate contact details and a safe, private space for the
          session. I agree to the{" "}
          <Link href="#faq" className="kh-link">cancellation window</Link> (12 hours).
        </span>
      </label>
      {error ? <p className="kh-error mt-2">{error}</p> : null}
    </fieldset>
  );
}

function Summary({
  form,
  service,
  areas,
}: {
  form: FormState;
  service?: Service;
  areas: { id: string; label: string }[];
}) {
  const areaLabel = areas.find((a) => a.id === form.area)?.label || "—";
  return (
    <div className="kh-card sticky top-24">
      <p className="text-[var(--kh-gold-deep)] text-xs tracking-[0.22em] uppercase">
        Your reservation
      </p>
      <h3 className="mt-2 font-serif text-2xl text-[var(--kh-brown)]">
        {service?.name ?? "Select a session"}
      </h3>
      {service ? (
        <p className="mt-1 text-[var(--kh-brown-soft)]">
          {service.durationMinutes} min · ${service.priceUsd} USD
        </p>
      ) : null}
      <dl className="mt-6 space-y-3 text-sm">
        <Row k="Area" v={areaLabel} />
        <Row k="Address" v={form.address || "—"} />
        <Row k="When" v={form.preferredDate ? `${form.preferredDate} · ${form.preferredWindow || "—"}` : "—"} />
        <Row k="Name" v={form.name || "—"} />
      </dl>
      <hr className="kh-gold-rule my-6 !w-full" style={{ width: "100%" }} />
      <p className="text-xs text-[var(--kh-brown-soft)] leading-relaxed">
        This is a reservation request. Jordan will confirm availability by message — payment is
        not collected here.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-brown-soft)]">{k}</dt>
      <dd className="col-span-2 text-[var(--kh-ink)] break-words">{v}</dd>
    </div>
  );
}

function SuccessState({
  id,
  name,
  service,
}: {
  id: string;
  name: string;
  service?: string;
}) {
  return (
    <div className="kh-card text-center">
      <div
        aria-hidden
        className="mx-auto h-14 w-14 rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, var(--kh-ochre), var(--kh-gold))",
          color: "var(--kh-brown)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-5 font-serif text-3xl text-[var(--kh-brown)]">
        Thank you{name ? `, ${name.split(" ")[0]}` : ""}.
      </h2>
      <p className="mt-2 text-[var(--kh-brown-soft)] max-w-md mx-auto">
        Your {service ? <strong className="text-[var(--kh-brown)]">{service}</strong> : "session"}{" "}
        request is with Jordan. You&rsquo;ll hear back within 24 hours to confirm your window.
      </p>
      <p className="mt-3 text-xs tracking-[0.18em] uppercase text-[var(--kh-gold-deep)]">
        Reservation ID · {id.slice(0, 8)}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="kh-btn kh-btn-ghost">Back to home</Link>
        <a className="kh-btn kh-btn-gold" href="https://www.instagram.com/krownedhands/" target="_blank" rel="noreferrer">
          Follow @krownedhands
        </a>
      </div>
    </div>
  );
}
