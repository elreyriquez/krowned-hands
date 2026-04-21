import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PillarCard } from "@/components/PillarCard";
import { FeaturedQuoteRotator } from "@/components/FeaturedQuoteRotator";
import { FEATURED_ROTATING_ANONYMOUS, GOOGLE_TESTIMONIALS } from "@/lib/testimonials";
import { publicServices } from "@/lib/services";

export default function HomePage() {
  const services = publicServices();
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="kh-watercolor">
        <div className="mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
            <div className="md:col-span-7">
              <span className="kh-badge">Mobile Massage · Kingston & Montego Bay</span>
              <h1 className="mt-6 font-serif text-[var(--kh-brown)] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                Transformational
                <br />
                <span className="font-script text-[var(--kh-gold-deep)] text-5xl sm:text-6xl md:text-7xl leading-none block mt-2">
                  body work
                </span>
                <span className="block mt-2">for how you actually live.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[var(--kh-brown-soft)] leading-relaxed">
                Krowned Hands is the private practice of Jordan — a Jamaica-based therapist
                bringing massage therapy, bodywork, and holistic services to your space. Pain
                relief. Deep recovery. Nervous system reset.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/book" className="kh-btn kh-btn-primary">
                  Reserve Your Session
                </Link>
                <Link href="#services" className="kh-btn kh-btn-ghost">
                  Explore Services
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-[var(--kh-brown-soft)]">
                <div>
                  <p className="font-serif text-2xl text-[var(--kh-brown)]">60–90<span className="text-base">min</span></p>
                  <p className="tracking-[0.18em] uppercase text-xs mt-1">Session length</p>
                </div>
                <div className="h-8 w-px bg-[var(--kh-line)]" />
                <div>
                  <p className="font-serif text-2xl text-[var(--kh-brown)]">In your space</p>
                  <p className="tracking-[0.18em] uppercase text-xs mt-1">Home · Hotel · Villa</p>
                </div>
                <div className="h-8 w-px bg-[var(--kh-line)] hidden sm:block" />
                <div className="hidden sm:block">
                  <p className="font-serif text-2xl text-[var(--kh-brown)]">From $150</p>
                  <p className="tracking-[0.18em] uppercase text-xs mt-1">USD per session</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-5">
              <ImagePlaceholder
                label="Hero portrait — Jordan at work, warm light, hands on client's shoulders"
                hint="3:4 · portrait"
                ratio="3/4"
                rounded="xl"
                tone="gold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PILLARS ---------- */}
      <section id="services" className="mx-auto max-w-6xl px-5 md:px-8 pt-20 md:pt-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="kh-badge">What the work is</span>
          <h2 className="mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
            Three pillars.<br className="hidden md:block" /> One intentional session.
          </h2>
          <hr className="kh-gold-rule mx-auto my-6" />
          <p className="text-[var(--kh-brown-soft)] leading-relaxed">
            Every booking is tailored — but most sessions move through one of these three lenses.
            Tell us where you are today; we&rsquo;ll meet you there.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PillarCard
            eyebrow="Pillar One"
            title="Pain Relief"
            body="Targeted, informed pressure for the places that need it most — neck, shoulders, lower back, hips. Acute tension, post-training, or chronic holding."
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 21s-7-4.35-7-10a5 5 0 019-3 5 5 0 019 3c0 5.65-7 10-7 10H12z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            }
          />
          <PillarCard
            eyebrow="Pillar Two"
            title="Deep Recovery"
            body="Slower, firmer work for athletes, high-output professionals, and anyone rebuilding after travel, long hours, or training load."
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 12h4l3-7 4 14 3-7h2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            }
          />
          <PillarCard
            eyebrow="Pillar Three"
            title="Nervous System Reset"
            body="A calm, down-regulating modality — long strokes, breath, quiet — designed to move you out of fight-or-flight before you leave the table."
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 12c3 0 3-4 6-4s3 8 6 8 3-4 6-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ---------- SERVICES / PRICING ---------- */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 pt-20 md:pt-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="kh-badge">Sessions & investment</span>
            <h2 className="mt-4 font-serif text-[var(--kh-brown)] text-3xl md:text-4xl max-w-xl">
              Choose the session that meets you today.
            </h2>
          </div>
          <Link href="/book" className="kh-btn kh-btn-gold self-start md:self-auto">
            Start a booking
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.id} className="kh-card flex flex-col">
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="font-serif text-2xl text-[var(--kh-brown)]">{s.name}</h3>
                <p className="font-serif text-xl text-[var(--kh-gold-deep)]">${s.priceUsd}</p>
              </div>
              <p className="mt-1 text-sm tracking-[0.16em] uppercase text-[var(--kh-gold-deep)]">
                {s.durationMinutes} minutes · {s.tagline}
              </p>
              <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">{s.description}</p>
              <div className="mt-auto pt-6">
                <Link href={`/book?service=${s.id}`} className="kh-link text-sm">
                  Reserve this session →
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--kh-brown-soft)]">
          Prices are in USD. Travel within Kingston and Montego Bay is included; out-of-parish
          travel may carry a small fee — we&rsquo;ll confirm before your visit.
        </p>
      </section>

      {/* ---------- ABOUT JORDAN ---------- */}
      <section id="about" className="mx-auto max-w-6xl px-5 md:px-8 pt-20 md:pt-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <ImagePlaceholder
              label="Jordan portrait — soft natural light, calm expression"
              hint="4:5 · portrait"
              ratio="4/5"
              rounded="xl"
            />
          </div>
          <div className="md:col-span-7">
            <span className="kh-badge">Meet your therapist</span>
            <h2 className="mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
              Jordan — founder of Krowned Hands.
            </h2>
            <hr className="kh-gold-rule my-6" />
            <p className="text-[var(--kh-brown-soft)] leading-relaxed text-lg">
              Krowned Hands began as a mobile practice built on a simple premise: the right
              session, in the right place, changes the week ahead. Jordan works with locals,
              travellers, corporate guests, and athletes across Jamaica — bringing therapeutic
              presence, practical technique, and a calm room, wherever you are.
            </p>
            <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">
              Every visit includes an in-person intake, a tailored session, and aftercare notes
              you can actually use. No rushed turnarounds. No upsells at the table.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="kh-card !p-4">
                <p className="font-serif text-2xl text-[var(--kh-brown)]">Mobile</p>
                <p className="text-[var(--kh-brown-soft)]">We come to you.</p>
              </div>
              <div className="kh-card !p-4">
                <p className="font-serif text-2xl text-[var(--kh-brown)]">Private</p>
                <p className="text-[var(--kh-brown-soft)]">One client at a time.</p>
              </div>
              <div className="kh-card !p-4 col-span-2 sm:col-span-1">
                <p className="font-serif text-2xl text-[var(--kh-brown)]">Practiced</p>
                <p className="text-[var(--kh-brown-soft)]">Locals · Tourists · Athletes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 pt-20 md:pt-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="kh-badge">How it works</span>
          <h2 className="mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
            From reservation to rest.
          </h2>
          <hr className="kh-gold-rule mx-auto my-6" />
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3 list-none">
          {[
            {
              step: "01",
              title: "Reserve your session",
              body: "Share your preferred date, service area, and the space we'll be working in. We'll confirm by message.",
            },
            {
              step: "02",
              title: "We come to you",
              body: "Jordan arrives with the full set-up — table, linens, oils, music. You choose the room. We take care of the rest.",
            },
            {
              step: "03",
              title: "Rest, then reset",
              body: "After your session, you stay put. You get a short aftercare note by email within 24 hours.",
            },
          ].map((s) => (
            <li key={s.step} className="kh-card">
              <p className="font-serif text-4xl text-[var(--kh-gold-deep)]">{s.step}</p>
              <h3 className="mt-3 font-serif text-xl text-[var(--kh-brown)]">{s.title}</h3>
              <p className="mt-2 text-[var(--kh-brown-soft)] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- DARK TESTIMONIAL ACCENT ---------- */}
      <section className="mt-24">
        <div className="relative overflow-hidden bg-[var(--kh-charcoal)] text-[var(--kh-cream)]">
          <div aria-hidden className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              background:
                "radial-gradient(50% 40% at 20% 30%, #d7a25a 0%, transparent 70%), radial-gradient(50% 40% at 80% 80%, #d7a25a 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-y-10 px-5 py-20 md:grid-cols-12 md:gap-x-10 md:gap-y-12 md:px-8 md:py-28 items-start md:items-stretch">
            <div className="flex flex-col items-start md:col-span-7 md:h-full md:min-h-0 md:justify-center">
              <span className="kh-badge w-fit shrink-0" style={{ background: "transparent", color: "var(--kh-gold)", borderColor: "color-mix(in srgb, var(--kh-gold) 45%, transparent)" }}>
                In their words
              </span>
              <FeaturedQuoteRotator quotes={FEATURED_ROTATING_ANONYMOUS} intervalSec={8} />
            </div>
            <div className="flex md:col-span-5 md:h-full md:min-h-0 md:items-center">
              <ImagePlaceholder
                label="Editorial detail — hands, oil, linen (dark mood shot)"
                hint="1:1 · square · dark"
                ratio="1/1"
                rounded="xl"
                tone="dark"
              />
            </div>
            <div className="grid w-full max-w-full shrink-0 grid-cols-1 gap-[1.15rem] md:col-span-12 md:grid-cols-3 md:gap-[1.15rem] lg:gap-5">
              {GOOGLE_TESTIMONIALS.map((t, index) => (
                <figure
                  key={index}
                  className="flex h-full min-h-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-[1.15rem] sm:p-6"
                >
                  <p className="min-h-0 flex-1 text-base leading-relaxed text-[var(--kh-cream)]/85 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <figcaption className="mt-[1.15rem] shrink-0 border-t border-white/10 pt-3.5 text-[11.5px] uppercase leading-snug tracking-[0.16em] text-[var(--kh-gold)] sm:text-xs">
                    {t.attribution}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto max-w-4xl px-5 md:px-8 pt-20 md:pt-28">
        <div className="text-center">
          <span className="kh-badge">Questions</span>
          <h2 className="mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
            Good to know.
          </h2>
          <hr className="kh-gold-rule mx-auto my-6" />
        </div>
        <dl className="mt-10 divide-y divide-[var(--kh-line)] border-y border-[var(--kh-line)]">
          {[
            {
              q: "Where do you travel to?",
              a: "Kingston and Montego Bay are the standard service areas. Sessions outside those areas are possible by arrangement — include your address when you reserve and we'll confirm.",
            },
            {
              q: "What do I need to have at home?",
              a: "Just a private room with enough space for the table (about 7x3 feet) and an outlet nearby. We bring the table, linens, oils, and music.",
            },
            {
              q: "How do I prepare for my session?",
              a: "Hydrate during the day, avoid heavy meals within 60 minutes of your start time, and wear whatever lets you relax. Everything else is our job.",
            },
            {
              q: "What's your cancellation policy?",
              a: "Life happens. Please give at least 12 hours' notice for cancellations or reschedules so we can offer your slot to someone else.",
            },
            {
              q: "Do you offer couples or back-to-back sessions?",
              a: "Yes — see the Couples Session above, or leave a note when booking for back-to-back sessions for a partner, family member, or guest.",
            },
            {
              q: "Is Krowned Hands a collective?",
              a: "Jordan is the founding therapist. We are expanding into a small, vetted therapist collective — details to come. Current bookings are with Jordan unless otherwise confirmed.",
            },
          ].map((f) => (
            <div key={f.q} className="py-6">
              <dt className="font-serif text-xl text-[var(--kh-brown)]">{f.q}</dt>
              <dd className="mt-2 text-[var(--kh-brown-soft)] leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 pt-20 md:pt-28 pb-12">
        <div
          className="relative overflow-hidden rounded-3xl border border-[var(--kh-line)] p-8 md:p-14"
          style={{
            background:
              "radial-gradient(60% 55% at 0% 0%, color-mix(in srgb, var(--kh-ochre) 40%, transparent), transparent 70%), radial-gradient(55% 50% at 100% 100%, color-mix(in srgb, var(--kh-sand) 70%, transparent), transparent 70%), var(--kh-cream-soft)",
          }}
        >
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-serif text-[var(--kh-brown)] text-3xl md:text-5xl leading-tight">
                Ready when you are.
              </h2>
              <p className="mt-3 text-[var(--kh-brown-soft)] max-w-xl">
                Reserve your first session in under two minutes. We&rsquo;ll follow up personally
                to confirm your window.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/book" className="kh-btn kh-btn-primary">
                Reserve Your Session
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
