import Link from "next/link";
import { HeroPriceStat } from "@/components/HeroPriceStat";
import { MarketingPhoto } from "@/components/MarketingPhoto";
import { PillarCard } from "@/components/PillarCard";
import { FeaturedQuoteRotator } from "@/components/FeaturedQuoteRotator";
import { QuoteCurrencyToggle } from "@/components/QuoteCurrencyToggle";
import { Reveal } from "@/components/Reveal";
import { SessionsPricingCards } from "@/components/SessionsPricingCards";
import { GOOGLE_REVIEWS_URL, WHATSAPP_CHAT_URL } from "@/lib/external-links";
import { FEATURED_ROTATING_ANONYMOUS, GOOGLE_TESTIMONIALS } from "@/lib/testimonials";
import { publicServices } from "@/lib/services";

export default function HomePage() {
  const services = publicServices();
  const minUsd = Math.min(...services.map((s) => s.priceUsd));
  const minJmd = Math.min(...services.map((s) => s.priceJmd));
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="kh-hero-ground">
        <div className="mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
            <Reveal animation="from-left" className="md:col-span-7">
              <span className="kh-badge">Mobile Massage · Kingston & Montego Bay</span>
              <h1 className="mt-6 font-serif text-[var(--kh-brown)] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                Transformational
                <br />
                <span className="font-script text-[var(--kh-gold-deep)] text-5xl sm:text-6xl md:text-7xl leading-none block mt-2">
                  <span className="kh-stretch">body work</span>
                </span>
                <span className="block mt-2">wherever life has you.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[var(--kh-brown-soft)] leading-relaxed">
                Krowned Hands is Jordan&rsquo;s private mobile practice, bringing premium
                therapeutic massage to your spaces (home, hotel, villa, or retreat) across Jamaica.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/book" className="kh-btn kh-btn-primary">
                  Reserve Your Session
                </Link>
                <Link href="#services" className="kh-btn kh-btn-ghost">
                  Explore Services
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-[var(--kh-brown-soft)]">
                <div>
                  <p className="font-serif text-2xl text-[var(--kh-brown)]">60-120<span className="text-base">min</span></p>
                  <p className="tracking-[0.18em] uppercase text-xs mt-1">Session length</p>
                </div>
                <div className="h-8 w-px bg-[var(--kh-line)] hidden sm:block" />
                <div>
                  <p className="font-serif text-2xl text-[var(--kh-brown)]">In your space</p>
                  <p className="tracking-[0.18em] uppercase text-xs mt-1">Home · Hotel · Villa</p>
                </div>
                <div className="h-8 w-px bg-[var(--kh-line)] hidden md:block" />
                <HeroPriceStat minUsd={minUsd} minJmd={minJmd} />
                <div className="w-full sm:w-auto sm:ml-auto md:ml-0">
                  <p className="tracking-[0.18em] uppercase text-xs mb-2 sm:mb-0 sm:inline sm:mr-3 sm:align-middle text-[var(--kh-brown-soft)]">
                    Quote in
                  </p>
                  <QuoteCurrencyToggle className="align-middle" />
                </div>
              </div>
            </Reveal>
            <Reveal animation="from-right" delayMs={120} className="md:col-span-5">
              <MarketingPhoto
                src="/brand/krowned-hands-images/jordan-hero-portrait.png"
                alt="Jordan, therapeutic massage and bodywork, professional portrait"
                aspectClass="aspect-[3/4]"
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- PILLARS ---------- */}
      <section
        id="services"
        className="border-y border-[var(--kh-line)] bg-white"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
          <Reveal animation="fade" className="text-center max-w-2xl mx-auto">
            <span className="kh-badge">What the work is</span>
            <h2 className="kh-stagger mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
              <span style={{ "--i": 0 } as React.CSSProperties}>Three</span>{" "}
              <span style={{ "--i": 1 } as React.CSSProperties}>pillars.</span>
              <br className="hidden md:block" />{" "}
              <span style={{ "--i": 2 } as React.CSSProperties}>One</span>{" "}
              <span style={{ "--i": 3 } as React.CSSProperties}>intentional</span>{" "}
              <span style={{ "--i": 4 } as React.CSSProperties}>session.</span>
            </h2>
            <hr className="kh-gold-rule mx-auto my-6" />
            <p className="text-[var(--kh-brown-soft)] leading-relaxed">
              Every reservation is tailored, but most sessions move through one of these three lenses.
              Tell us where you are today; we&rsquo;ll meet you there.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Reveal animation="from-left" delayMs={0}>
              <PillarCard
                eyebrow="Pillar One"
                title="Pain Relief"
                body="Targeted, informed pressure for the places that need it most: neck, shoulders, lower back, hips. Acute tension, post-training, or chronic holding."
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 21s-7-4.35-7-10a5 5 0 019-3 5 5 0 019 3c0 5.65-7 10-7 10H12z" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                }
              />
            </Reveal>
            <Reveal animation="from-left" delayMs={140}>
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
            </Reveal>
            <Reveal animation="from-left" delayMs={280}>
              <PillarCard
                eyebrow="Pillar Three"
                title="Nervous System Reset"
                body="A calm, down-regulating modality: long strokes, breath, and quiet, designed to move you out of fight-or-flight before you leave the table."
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 12c3 0 3-4 6-4s3 8 6 8 3-4 6-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                }
              />
            </Reveal>
          </div>
          <Reveal animation="fade" delayMs={200} className="mt-10 max-w-3xl mx-auto text-center">
            <p className="text-[var(--kh-brown-soft)] leading-relaxed text-[15px] md:text-base border-t border-[var(--kh-line)] pt-8">
              Jordan also integrates functional movement assessment for clients dealing with chronic
              postural patterns. To ask how this can be part of your care,{" "}
              <a
                className="kh-link"
                href={WHATSAPP_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                inquire on WhatsApp
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- ABOUT JORDAN ---------- */}
      <section
        id="about"
        className="mx-auto max-w-6xl px-5 md:px-8 pt-20 md:pt-28 pb-16 md:pb-28"
      >
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <Reveal animation="from-left" className="md:col-span-5">
            <MarketingPhoto
              src="/brand/krowned-hands-images/jordan-founder-image.png"
              alt="Jordan, founder of Krowned Hands, massage therapist"
              aspectClass="aspect-[4/5]"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </Reveal>
          <Reveal animation="from-right" delayMs={120} className="md:col-span-7">
            <span className="kh-badge">Meet your therapist</span>
            <h2 className="mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
              Jordan King
            </h2>
            <hr className="kh-gold-rule my-6" />
            <p className="text-[var(--kh-brown-soft)] leading-relaxed text-lg">
              Jordan started Krowned Hands for one reason: he finally got out of pain and needed
              other people to feel that too.
            </p>
            <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">
              A single session changed his baseline after years of back pain. What followed was a
              deep dive into the body. Specifically, how freeing the muscular system frees
              everything else.
            </p>
            <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">
              He&rsquo;s certified in Swedish, deep tissue, lymphatic drainage, passive stretch
              therapy, Reiki, and postnatal massage, with a self-built practice in
              myofascial release, trigger point therapy, breathwork, and somatic release. His
              understanding of nervous system regulation runs deeper than any single course: built
              through lived experience, personal practice, ongoing study, and years of mentorship
              from practitioners with over two decades in the field.
            </p>
            <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">
              Clients say the same things: his presence, his stillness, the sense of safety. Slow,
              deliberate work. Strength and gentleness in the same hands. He&rsquo;s worked with
              athletes, celebrities, executives, retreat guests, and everyday people across
              Jamaica who decided their body deserved better.
            </p>
            <p className="mt-4 text-[var(--kh-brown-soft)] leading-relaxed">
              He believes the body is our universe. Movement is life. Freedom in the body opens
              everything else.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- SERVICES / PRICING (dark band, matches testimonials) ---------- */}
      <section className="relative">
        <div className="relative overflow-hidden bg-[var(--kh-charcoal)] text-[var(--kh-cream)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              background:
                "radial-gradient(50% 40% at 20% 30%, #d7a25a 0%, transparent 70%), radial-gradient(50% 40% at 80% 80%, #d7a25a 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
            <SessionsPricingCards services={services} />
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="border-y border-[var(--kh-line)] bg-white">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="kh-badge">How it works</span>
            <h2 className="mt-5 font-serif text-[var(--kh-brown)] text-3xl md:text-5xl">
              From reservation to rest.
            </h2>
            <hr className="kh-gold-rule mx-auto my-6" />
          </div>
          <Reveal animation="fade" threshold={0.25}>
            <ol className="mt-12 grid list-none gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Reserve your session",
                  body: "Share your preferred date, service area, and the space we'll be working in. We'll confirm by message.",
                },
                {
                  step: "02",
                  title: "We come to you",
                  body: "Jordan arrives with the full set-up: table, linens, oils, music. You choose the room. We take care of the rest.",
                },
                {
                  step: "03",
                  title: "Rest, then reset",
                  body: "After your session, you stay put. You get a short aftercare note by email within 24 hours.",
                },
              ].map((s, i) => (
                <li key={s.step} className="kh-card">
                  <p
                    className="kh-step-number font-serif text-4xl"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    {s.step}
                  </p>
                  <h3 className="mt-3 font-serif text-xl text-[var(--kh-brown)]">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--kh-brown-soft)]">{s.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
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
              <MarketingPhoto
                src="/brand/krowned-hands-images/editorial-image.png"
                alt="Therapeutic massage, detail of hands, linens, and session atmosphere"
                aspectClass="aspect-square"
                sizes="(max-width: 768px) 100vw, 38vw"
                className="!ring-white/10 shadow-none"
              />
            </div>
            <div className="grid w-full max-w-full shrink-0 grid-cols-1 gap-[1.15rem] md:col-span-12 md:grid-cols-3 md:gap-[1.15rem] lg:gap-5">
              {GOOGLE_TESTIMONIALS.map((t, index) => (
                <Reveal
                  key={index}
                  animation="fade-up"
                  delayMs={index * 130}
                  className="h-full"
                >
                  <figure className="flex h-full min-h-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-[1.15rem] sm:p-6">
                    <p className="min-h-0 flex-1 text-base leading-relaxed text-[var(--kh-cream)]/85 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <figcaption className="mt-[1.15rem] shrink-0 border-t border-white/10 pt-3.5 text-[11.5px] uppercase leading-snug tracking-[0.16em] text-[var(--kh-gold)] sm:text-xs">
                      {t.attribution}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
            <div className="md:col-span-12 flex justify-center pt-2 md:pt-4">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--kh-gold)] underline decoration-white/25 underline-offset-[5px] transition hover:text-[var(--kh-cream)] hover:decoration-[var(--kh-gold)]"
              >
                Read more reviews on Google
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="border-y border-[var(--kh-line)] bg-white">
        <div className="mx-auto max-w-4xl px-5 md:px-8 py-20 md:py-28">
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
                a: "Krowned Hands serves Kingston and Montego Bay as home bases, with sessions available across Jamaica, including hotels, villas, and resort properties in Negril, Ocho Rios, and Port Antonio by arrangement. Out-of-parish travel may carry a small fee; include your location when you reserve and we'll confirm.",
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
                a: "We require 24 hours' notice for cancellations or reschedules. Your deposit is held and transferable to a future booking within 10 days.",
              },
              {
                q: "Do you offer couples or back-to-back sessions?",
                a: "Yes, by arrangement. Reserve the session you want for yourself and leave a note about a partner, family member, or guest. Jordan will confirm a back-to-back or concurrent option based on availability.",
              },
              {
                q: "Is Krowned Hands a collective?",
                a: "Jordan is the founding therapist. We are expanding into a small, vetted therapist collective. Details to come. Current reservations are with Jordan unless otherwise confirmed.",
              },
            ].map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-serif text-xl text-[var(--kh-brown)]">{f.q}</dt>
                <dd className="mt-2 text-[var(--kh-brown-soft)] leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- CTA BAND (dark, matches testimonials) ---------- */}
      <section className="relative">
        <div className="relative overflow-hidden bg-[var(--kh-charcoal)] text-[var(--kh-cream)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              background:
                "radial-gradient(50% 40% at 20% 30%, #d7a25a 0%, transparent 70%), radial-gradient(50% 40% at 80% 80%, #d7a25a 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <div className="grid items-center gap-8 md:grid-cols-12">
              <Reveal animation="from-left" className="md:col-span-8">
                <h2 className="font-serif text-3xl leading-tight text-[var(--kh-cream)] md:text-5xl">
                  Ready when you are.
                </h2>
                <p className="mt-3 max-w-xl leading-relaxed text-[var(--kh-cream)]/85">
                  Reserve your first session in under two minutes. We&rsquo;ll follow up personally
                  to confirm your window.
                </p>
              </Reveal>
              <Reveal
                animation="from-right"
                delayMs={140}
                className="md:col-span-4 md:text-right"
              >
                <Link href="/book" className="kh-btn kh-btn-gold">
                  Reserve Your Session
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
