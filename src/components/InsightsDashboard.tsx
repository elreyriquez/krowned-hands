"use client";

import { useMemo, useState } from "react";
import type { BookingRecord } from "@/lib/bookings";

type Props = { bookings: BookingRecord[] };

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function isoYear(iso: string) { return Number(iso.slice(0, 4)); }
function isoMonth(iso: string) { return Number(iso.slice(5, 7)) - 1; } // 0-based
function safeIsoDate(value: string | undefined): string | null {
  if (!value) return null;
  // Accept both YYYY-MM-DD and full ISO timestamps.
  const sliced = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(sliced) ? sliced : null;
}
function bookingMonthKey(b: BookingRecord): string | null {
  const primary = safeIsoDate(b.preferredDate);
  const fallback = safeIsoDate(b.createdAt);
  const iso = primary || fallback;
  if (!iso) return null;
  return `${isoYear(iso)}-${String(isoMonth(iso) + 1).padStart(2, "0")}`;
}
function serviceRevenueUsd(name: string): number {
  const n = name.toLowerCase();
  if (n.includes("reset")) return 100;
  if (n.includes("restore")) return 130;
  if (n.includes("renew")) return 160;
  return 0;
}
function serviceRevenueJmd(name: string): number {
  const n = name.toLowerCase();
  if (n.includes("reset")) return 15000;
  if (n.includes("restore")) return 20000;
  if (n.includes("renew")) return 25000;
  return 0;
}
function bookingRevenue(b: BookingRecord, currency: "usd" | "jmd"): number {
  if (currency === "usd") {
    if (b.priceUsd > 0) return b.priceUsd;
    return serviceRevenueUsd(b.serviceName);
  }
  if (typeof b.priceJmd === "number" && b.priceJmd > 0) return b.priceJmd;
  return serviceRevenueJmd(b.serviceName);
}

/* ---- helpers ---- */
function last12Months(): { year: number; month: number; key: string; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    });
  }
  return result;
}

function BarChart({
  data,
  color = "var(--kh-gold)",
  formatValue = (v) => String(v),
}: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="flex items-end gap-[3px] h-36">
        {data.map((d, i) => {
          const pct = max > 0 ? (d.value / max) * 100 : 0;
          const isHover = hover === i;
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-0.5 cursor-default group"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {isHover && d.value > 0 ? (
                <span className="text-[10px] font-semibold text-[var(--kh-brown)] whitespace-nowrap">
                  {formatValue(d.value)}
                </span>
              ) : (
                <span className="text-[10px] text-transparent select-none">0</span>
              )}
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(pct, d.value > 0 ? 4 : 0)}%`,
                  background: isHover
                    ? "var(--kh-brown)"
                    : color,
                  opacity: d.value === 0 ? 0.2 : 1,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-[3px] mt-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[9px] text-[var(--kh-brown-soft)] truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kh-card !p-5">
      <p className="text-xs tracking-[0.18em] uppercase text-[var(--kh-brown-soft)]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[var(--kh-brown)]">{value}</p>
      {sub ? <p className="mt-1 text-xs text-[var(--kh-brown-soft)]">{sub}</p> : null}
    </div>
  );
}

export function InsightsDashboard({ bookings }: Props) {
  const [currency, setCurrency] = useState<"usd" | "jmd">("usd");

  const active = useMemo(() => bookings.filter((b) => b.status !== "cancelled"), [bookings]);
  const months = useMemo(() => last12Months(), []);

  /* ---- Bookings per month ---- */
  const bookingsPerMonth = useMemo(() =>
    months.map((m) => ({
      label: m.label,
      value: active.filter((b) => bookingMonthKey(b) === m.key).length,
    })),
    [active, months]
  );

  /* ---- Revenue per month ---- */
  const revenuePerMonth = useMemo(() =>
    months.map((m) => ({
      label: m.label,
      value: active
        .filter((b) => bookingMonthKey(b) === m.key)
        .reduce((sum, b) => sum + bookingRevenue(b, currency), 0),
    })),
    [active, months, currency]
  );

  /* ---- Revenue by service ---- */
  const byService = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    active.forEach((b) => {
      const e = map.get(b.serviceName) ?? { count: 0, revenue: 0 };
      e.count++;
      e.revenue += bookingRevenue(b, currency);
      map.set(b.serviceName, e);
    });
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [active, currency]);

  /* ---- Most frequent clients ---- */
  const topClients = useMemo(() => {
    const map = new Map<string, { count: number; email: string; phone: string; lastDate: string }>();
    active.forEach((b) => {
      const key = b.email.toLowerCase();
      const e = map.get(key) ?? { count: 0, email: b.email, phone: b.phone, lastDate: "" };
      e.count++;
      if (!e.lastDate || b.preferredDate > e.lastDate) e.lastDate = b.preferredDate;
      map.set(key, e);
    });
    return [...map.entries()]
      .map(([, v]) => v)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [active]);

  /* ---- Bookings by area ---- */
  const byArea = useMemo(() => {
    const map = new Map<string, number>();
    active.forEach((b) => {
      const label = b.area === "other" ? (b.areaCustom?.split(",")[0] ?? "Other") : b.area.replace("-", " ");
      map.set(label, (map.get(label) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  /* ---- Status breakdown ---- */
  const statusCounts = useMemo(() => {
    const all = bookings;
    return {
      new: all.filter((b) => b.status === "new").length,
      confirmed: all.filter((b) => b.status === "confirmed").length,
      cancelled: all.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  /* ---- Totals ---- */
  const totalRevenue = active.reduce((s, b) => s + bookingRevenue(b, currency), 0);
  const avgPerSession = active.length > 0 ? Math.round(totalRevenue / active.length) : 0;
  const thisMonthCount = bookingsPerMonth[11]?.value ?? 0;
  const thisMonthRev = revenuePerMonth[11]?.value ?? 0;

  const fmtCur = (v: number) =>
    currency === "usd" ? `$${v.toLocaleString()}` : `J$${v.toLocaleString("en-JM")}`;

  return (
    <div className="space-y-10">
      {/* Currency toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs tracking-[0.16em] uppercase text-[var(--kh-brown-soft)]">Currency</span>
        {(["usd", "jmd"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-medium transition",
              currency === c
                ? "bg-[var(--kh-brown)] text-[var(--kh-cream)]"
                : "border border-[var(--kh-line)] text-[var(--kh-brown-soft)] hover:border-[var(--kh-gold)]",
            ].join(" ")}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total reservations" value={String(active.length)} sub="Excluding cancelled" />
        <StatCard label="This month" value={String(thisMonthCount)} sub="Active sessions" />
        <StatCard label="Total revenue" value={fmtCur(totalRevenue)} sub="All time, active sessions" />
        <StatCard label="Avg per session" value={fmtCur(avgPerSession)} />
      </div>

      {/* Bookings per month */}
      <div className="kh-card">
        <h2 className="font-serif text-xl text-[var(--kh-brown)] mb-4">Bookings per month</h2>
        <BarChart data={bookingsPerMonth} color="var(--kh-gold)" formatValue={(v) => `${v} sessions`} />
      </div>

      {/* Revenue per month */}
      <div className="kh-card">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif text-xl text-[var(--kh-brown)]">Revenue per month</h2>
          <span className="text-xs text-[var(--kh-brown-soft)]">{currency.toUpperCase()}</span>
        </div>
        <BarChart data={revenuePerMonth} color="var(--kh-ochre)" formatValue={fmtCur} />
        <p className="mt-3 text-xs text-[var(--kh-brown-soft)]">
          This month: <strong>{fmtCur(thisMonthRev)}</strong>
        </p>
      </div>

      {/* Service breakdown + Area side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Service breakdown */}
        <div className="kh-card">
          <h2 className="font-serif text-xl text-[var(--kh-brown)] mb-4">Sessions by service</h2>
          {byService.length === 0 ? (
            <p className="text-sm text-[var(--kh-brown-soft)]">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {byService.map((s) => {
                const pct = active.length > 0 ? (s.count / active.length) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--kh-brown)]">{s.name}</span>
                      <span className="text-[var(--kh-brown-soft)]">{s.count} · {fmtCur(s.revenue)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--kh-line)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--kh-gold)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bookings by area */}
        <div className="kh-card">
          <h2 className="font-serif text-xl text-[var(--kh-brown)] mb-4">Sessions by area</h2>
          {byArea.length === 0 ? (
            <p className="text-sm text-[var(--kh-brown-soft)]">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {byArea.map((a) => {
                const pct = active.length > 0 ? (a.value / active.length) * 100 : 0;
                return (
                  <div key={a.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--kh-brown)]">{a.label}</span>
                      <span className="text-[var(--kh-brown-soft)]">{a.value} sessions</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--kh-line)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--kh-ochre)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reservation status */}
      <div className="kh-card">
        <h2 className="font-serif text-xl text-[var(--kh-brown)] mb-4">Reservation status</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-serif text-3xl text-[var(--kh-gold)]">{statusCounts.new}</p>
            <p className="text-xs tracking-[0.16em] uppercase text-[var(--kh-brown-soft)] mt-1">New</p>
          </div>
          <div>
            <p className="font-serif text-3xl text-[#2d8a4e]">{statusCounts.confirmed}</p>
            <p className="text-xs tracking-[0.16em] uppercase text-[var(--kh-brown-soft)] mt-1">Confirmed</p>
          </div>
          <div>
            <p className="font-serif text-3xl text-[var(--kh-brown-soft)]">{statusCounts.cancelled}</p>
            <p className="text-xs tracking-[0.16em] uppercase text-[var(--kh-brown-soft)] mt-1">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Most frequent clients */}
      <div className="kh-card">
        <h2 className="font-serif text-xl text-[var(--kh-brown)] mb-4">Returning clients</h2>
        {topClients.length === 0 ? (
          <p className="text-sm text-[var(--kh-brown-soft)]">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--kh-line)]">
                  <th className="pb-2 pr-4 text-xs tracking-[0.14em] uppercase text-[var(--kh-brown-soft)] font-medium">#</th>
                  <th className="pb-2 pr-4 text-xs tracking-[0.14em] uppercase text-[var(--kh-brown-soft)] font-medium">Email</th>
                  <th className="pb-2 pr-4 text-xs tracking-[0.14em] uppercase text-[var(--kh-brown-soft)] font-medium">Sessions</th>
                  <th className="pb-2 pr-4 text-xs tracking-[0.14em] uppercase text-[var(--kh-brown-soft)] font-medium">Last visit</th>
                  <th className="pb-2 text-xs tracking-[0.14em] uppercase text-[var(--kh-brown-soft)] font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c, i) => (
                  <tr key={c.email} className="border-b border-[var(--kh-line)] last:border-0">
                    <td className="py-2.5 pr-4 text-[var(--kh-brown-soft)]">{i + 1}</td>
                    <td className="py-2.5 pr-4 text-[var(--kh-brown)]">{c.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--kh-gold)] text-[var(--kh-brown)] text-xs font-semibold">
                        {c.count}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--kh-brown-soft)]">{c.lastDate || "-"}</td>
                    <td className="py-2.5">
                      <div className="flex gap-2">
                        <a href={`mailto:${c.email}`} className="kh-link text-xs">Email</a>
                        <a href={`tel:${c.phone}`} className="kh-link text-xs">{c.phone}</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
