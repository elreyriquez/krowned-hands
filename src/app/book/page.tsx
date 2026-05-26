import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";
import { publicServices, SERVICE_AREAS } from "@/lib/services";

export const metadata: Metadata = {
  title: "Reserve a Session",
  description:
    "Reserve mobile massage with Jordan in Kingston, Montego Bay, or across Jamaica. In-home, hotel, villa, and resort sessions. Therapeutic bodywork by reservation.",
};

export default function BookPage() {
  const services = publicServices();
  const embedUrl = process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL?.trim();
  const showEmbed =
    process.env.NEXT_PUBLIC_USE_CALENDLY_EMBED === "true" && Boolean(embedUrl);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-20 pb-24">
        <div className="max-w-2xl">
          <span className="kh-badge">Reserve a session</span>
          <h1 className="mt-5 font-serif text-[var(--kh-brown)] text-4xl md:text-5xl leading-tight">
            Your space.{" "}
            <span className="font-script text-[var(--kh-gold-deep)] text-5xl md:text-6xl">
              Our time.
            </span>
          </h1>
        </div>

        <div className="mt-10 space-y-8">
          {showEmbed && embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--kh-line)] bg-white shadow-sm">
              <iframe
                src={embedUrl}
                title="Calendly (optional embed)"
                className="h-[520px] w-full md:h-[560px]"
                loading="lazy"
              />
            </div>
          ) : null}

          <div>
            <Suspense fallback={<div className="kh-card">Loading reservation form…</div>}>
              <BookingForm
                services={services}
                areas={SERVICE_AREAS.map((a) => ({ id: a.id, label: a.label }))}
              />
            </Suspense>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-[var(--kh-line)] bg-[var(--kh-cream-soft)] p-6 md:p-8">
          <h2 className="font-serif text-2xl text-[var(--kh-brown)] md:text-3xl">
            Reservation & deposit
          </h2>
          <ul className="mt-4 space-y-3 text-[var(--kh-brown-soft)] leading-relaxed list-disc pl-5">
            <li>
              A 50% deposit is required to confirm your reservation and must be made within 24 hours
              after you submit your request.
            </li>
            <li>
              Deposits are non-refundable, except in the event of a fault on the service
              provider&rsquo;s end.
            </li>
            <li>
              Jordan will share payment instructions when your reservation is confirmed.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
