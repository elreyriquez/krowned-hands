"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/testimonials";

type Props = {
  quotes: Testimonial[];
  /** Seconds between rotations */
  intervalSec?: number;
};

export function FeaturedQuoteRotator({ quotes, intervalSec = 8 }: Props) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduceMotion || quotes.length <= 1) return;
    const ms = intervalSec * 1000;
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setActive((prev) => {
          if (quotes.length <= 2) return (prev + 1) % quotes.length;
          let next = prev;
          while (next === prev) {
            next = Math.floor(Math.random() * quotes.length);
          }
          return next;
        });
        setVisible(true);
      }, 380);
    }, ms);
    return () => window.clearInterval(id);
  }, [intervalSec, quotes.length, reduceMotion]);

  const current: Testimonial | undefined = quotes[active];

  if (!current) return null;

  return (
    <div
      className="isolate min-h-[18rem] w-full pt-12 sm:pt-14 md:min-h-[24rem] md:pt-[4.75rem]"
      role="region"
      aria-label="Rotating guest quotes"
    >
      <blockquote
        className={`font-serif text-2xl md:text-4xl leading-snug transition-opacity duration-[380ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-live={reduceMotion ? "off" : "polite"}
      >
        &ldquo;{current.quote}&rdquo;
      </blockquote>
      <p
        className={`mt-6 text-[var(--kh-cream)]/75 tracking-[0.18em] uppercase text-xs transition-opacity duration-[380ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {current.attribution}
      </p>
    </div>
  );
}
