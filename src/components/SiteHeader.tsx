import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_srgb,var(--kh-cream)_82%,transparent)] border-b border-[var(--kh-line)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8 min-h-[4.75rem] py-2.5 flex items-center justify-between gap-4">
        <BrandLogo variant="header" />
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm text-[var(--kh-brown-soft)]">
          <Link href="/#services" className="hover:text-[var(--kh-brown)]">Services</Link>
          <Link href="/#about" className="hover:text-[var(--kh-brown)]">About</Link>
          <Link href="/#faq" className="hover:text-[var(--kh-brown)]">FAQ</Link>
          <Link href="/book" className="kh-btn kh-btn-primary !py-2 !px-5 !min-h-0 text-sm">
            Reserve a Session
          </Link>
        </nav>
        <Link href="/book" className="md:hidden kh-btn kh-btn-primary !py-2 !px-4 !min-h-0 text-sm">
          Reserve
        </Link>
      </div>
    </header>
  );
}
