import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";
import { publicServices, SERVICE_AREAS } from "@/lib/services";

export const metadata: Metadata = {
  title: "Reserve a Session",
  description:
    "Reserve a mobile massage session with Krowned Hands in Kingston or Montego Bay. Pain relief, deep recovery, or nervous system reset.",
};

export default function BookPage() {
  const services = publicServices();
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

        <div className="mt-10">
          <Suspense fallback={<div className="kh-card">Loading booking form…</div>}>
            <BookingForm
              services={services}
              areas={SERVICE_AREAS.map((a) => ({ id: a.id, label: a.label }))}
            />
          </Suspense>
        </div>

        <div className="mt-14 rounded-2xl border border-[var(--kh-line)] bg-[var(--kh-cream-soft)] p-6 md:p-8">
          <h2 className="font-serif text-2xl text-[var(--kh-brown)] md:text-3xl">
            Booking & payment
          </h2>
          <ul className="mt-4 space-y-3 text-[var(--kh-brown-soft)] leading-relaxed list-disc pl-5">
            <li>
              A 50% deposit is required to confirm your reservation and must be made within 24 hours
              of booking.
            </li>
            <li>
              Deposits are non-refundable, except in the event of a fault on the service
              provider&rsquo;s end.
            </li>
          </ul>
          <h3 className="mt-8 font-serif text-lg text-[var(--kh-brown)]">Payment details</h3>
          <dl className="mt-4 grid gap-3 text-sm text-[var(--kh-brown-soft)] sm:grid-cols-2 sm:gap-x-10">
            <div>
              <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-gold-deep)]">
                Bank
              </dt>
              <dd className="mt-1 text-[var(--kh-ink)]">Scotiabank</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-gold-deep)]">
                Account name
              </dt>
              <dd className="mt-1 text-[var(--kh-ink)]">Jordan King</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-gold-deep)]">
                JMD savings
              </dt>
              <dd className="mt-1 font-mono text-[var(--kh-ink)] tabular-nums">000422950</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-gold-deep)]">
                USD savings
              </dt>
              <dd className="mt-1 font-mono text-[var(--kh-ink)] tabular-nums">000422810</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-gold-deep)]">
                Transit
              </dt>
              <dd className="mt-1 font-mono text-[var(--kh-ink)] tabular-nums">18465</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[11px] text-[var(--kh-gold-deep)]">
                Branch
              </dt>
              <dd className="mt-1 text-[var(--kh-ink)]">UWI</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
