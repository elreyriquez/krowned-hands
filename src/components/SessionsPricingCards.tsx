"use client";

import Link from "next/link";
import { useQuoteCurrency } from "@/components/CurrencyProvider";
import { SITE_CONTACT_EMAIL } from "@/lib/external-links";
import { QuoteCurrencyToggle } from "@/components/QuoteCurrencyToggle";
import { dualPriceLabels } from "@/lib/pricing";
import type { Service } from "@/lib/services";

type Props = {
  services: Service[];
};

export function SessionsPricingCards({ services }: Props) {
  const { currency } = useQuoteCurrency();

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span
            className="kh-badge w-fit shrink-0"
            style={{
              background: "transparent",
              color: "var(--kh-gold)",
              borderColor: "color-mix(in srgb, var(--kh-gold) 45%, transparent)",
            }}
          >
            Sessions & investment
          </span>
          <h2 className="mt-4 max-w-xl font-serif text-3xl text-[var(--kh-cream)] md:text-4xl">
            Choose the session that meets you today.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:flex-col md:items-end lg:flex-row lg:items-center">
          <QuoteCurrencyToggle variant="dark" />
          <Link href="/book" className="kh-btn kh-btn-gold shrink-0">
            Reserve a session
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {services.map((s) => {
          const { primary, secondary } = dualPriceLabels(s, currency);
          return (
            <article
              key={s.id}
              className="kh-service-card flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="font-serif text-2xl text-[var(--kh-cream)]">{s.name}</h3>
                <div className="text-right shrink-0">
                  <p className="font-serif text-xl text-[var(--kh-gold)]">{primary}</p>
                  <p className="text-xs text-[var(--kh-cream)]/65 mt-0.5">{secondary}</p>
                </div>
              </div>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-[var(--kh-gold)]">
                {s.durationMinutes} minutes · {s.tagline}
              </p>
              <p className="mt-4 leading-relaxed text-[var(--kh-cream)]/85">{s.description}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={`/book?service=${s.id}`}
                  className="text-sm text-[var(--kh-gold)] underline decoration-white/25 underline-offset-4 transition-colors hover:text-[var(--kh-cream)]"
                >
                  Reserve this session →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-[var(--kh-cream)]/70">
        Krowned Hands serves Kingston and Montego Bay as home bases, with
        sessions across Jamaica, including hotels, villas, and resorts in Negril, Ocho Rios, and
        Port Antonio by arrangement. Out-of-parish travel may carry a small fee; we&rsquo;ll confirm
        before your visit.
      </p>
      <p className="mt-4 text-sm text-[var(--kh-cream)]/85 border-t border-white/10 pt-6">
        Packages and corporate bookings available: enquire via WhatsApp or{" "}
        <a
          className="text-[var(--kh-gold)] underline decoration-white/25 underline-offset-4 hover:text-[var(--kh-cream)]"
          href={`mailto:${SITE_CONTACT_EMAIL}`}
        >
          email
        </a>
        .
      </p>
    </>
  );
}
