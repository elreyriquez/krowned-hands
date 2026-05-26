"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/book", label: "Reserve a session" },
] as const;

export function SiteHeaderMobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const drawer =
    open && typeof document !== "undefined" ? (
      <div
        className="fixed inset-0 z-[60]"
        id="kh-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <button
          type="button"
          className="absolute inset-0 z-0 bg-[color-mix(in_srgb,var(--kh-brown)_45%,black)] backdrop-blur-sm"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <nav
          aria-label="Primary"
          className="pointer-events-none absolute inset-0 z-10 flex h-full min-h-0 w-full flex-col overflow-y-auto bg-[var(--kh-cream)] px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(2rem,env(safe-area-inset-top))] shadow-xl"
        >
          <div className="pointer-events-auto mb-6 flex items-start justify-end">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--kh-brown-soft)] underline decoration-[var(--kh-line)] underline-offset-4 hover:text-[var(--kh-brown)]"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <Link
            href="/"
            className="pointer-events-auto mb-4 font-serif text-lg text-[var(--kh-brown)] hover:text-[var(--kh-gold-deep)]"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                href === "/book"
                  ? "pointer-events-auto mt-4 kh-btn kh-btn-primary w-full justify-center text-center"
                  : "pointer-events-auto rounded-lg px-3 py-3 text-[var(--kh-brown-soft)] transition hover:bg-[color-mix(in_srgb,var(--kh-gold)_14%,transparent)] hover:text-[var(--kh-brown)]"
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    ) : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--kh-line)] bg-[var(--kh-cream-soft)] text-[var(--kh-brown)] shadow-sm transition hover:border-[var(--kh-gold-deep)] hover:bg-[color-mix(in_srgb,var(--kh-gold)_12%,var(--kh-cream-soft))]"
        aria-expanded={open}
        aria-controls="kh-mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          {open ? (
            <>
              <path d="M6 6l12 12M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}
