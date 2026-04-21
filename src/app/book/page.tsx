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
    <section className="kh-watercolor">
      <div className="mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-20 pb-24">
        <div className="max-w-2xl">
          <span className="kh-badge">Reserve a session</span>
          <h1 className="mt-5 font-serif text-[var(--kh-brown)] text-4xl md:text-5xl leading-tight">
            Your space.{" "}
            <span className="font-script text-[var(--kh-gold-deep)] text-5xl md:text-6xl">
              Our time.
            </span>
          </h1>
          <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">
            Share a few details and we&rsquo;ll confirm your window within 24 hours. No payment is
            collected here. This is a reservation request, not a calendar slot.
          </p>
        </div>
        <div className="mt-10">
          <Suspense fallback={<div className="kh-card">Loading booking form…</div>}>
            <BookingForm
              services={services}
              areas={SERVICE_AREAS.map((a) => ({ id: a.id, label: a.label }))}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
