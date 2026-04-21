import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--kh-line)] bg-[var(--kh-cream-soft)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo variant="footer" />
          <p className="mt-4 max-w-md text-[var(--kh-brown-soft)] leading-relaxed">
            Transformational body work. Mobile massage therapy, bodywork, and holistic services
            across Kingston and Montego Bay, Jamaica.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-[var(--kh-brown)] mb-3">Explore</h3>
          <ul className="space-y-2 text-sm text-[var(--kh-brown-soft)]">
            <li><Link href="/#services" className="hover:text-[var(--kh-brown)]">Services</Link></li>
            <li><Link href="/#about" className="hover:text-[var(--kh-brown)]">About Jordan</Link></li>
            <li><Link href="/#faq" className="hover:text-[var(--kh-brown)]">FAQ</Link></li>
            <li><Link href="/book" className="hover:text-[var(--kh-brown)]">Reserve a Session</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-[var(--kh-brown)] mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-[var(--kh-brown-soft)]">
            <li>Kingston · Montego Bay</li>
            <li>
              <a className="kh-link" href="https://www.instagram.com/krownedhands/" target="_blank" rel="noreferrer">
                @krownedhands
              </a>
            </li>
            <li>
              <a className="kh-link" href="mailto:hello@krownedhands.com">hello@krownedhands.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--kh-line)]">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--kh-brown-soft)]">
          <p>© {new Date().getFullYear()} Krowned Hands Ltd. All rights reserved.</p>
          <p className="opacity-80">Private and respectful. Your details are used only for booking.</p>
        </div>
      </div>
    </footer>
  );
}
