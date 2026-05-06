"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/bookings", label: "Reservations" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/insights", label: "Insights" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-1 border-b border-[var(--kh-line)] pb-4">
      {NAV.map((n) => {
        const active = path === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[var(--kh-brown)] text-[var(--kh-cream)]"
                : "text-[var(--kh-brown-soft)] hover:bg-[var(--kh-cream-soft)] hover:text-[var(--kh-brown)]",
            ].join(" ")}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
