"use client";

import { useState } from "react";
import type { BookingRecord } from "@/lib/bookings";
import { formatServiceAreaLabel } from "@/lib/services";

type Props = { bookings: BookingRecord[] };

const STATUS_STYLE: Record<string, string> = {
  new: "bg-[var(--kh-gold)] text-[var(--kh-brown)]",
  confirmed: "bg-[#2d8a4e] text-white",
  cancelled: "bg-[var(--kh-line)] text-[var(--kh-brown-soft)] line-through",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-[var(--kh-gold)]",
  confirmed: "bg-[#2d8a4e]",
  cancelled: "bg-[var(--kh-line)]",
};

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatTime(hhmm?: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function CalendarView({ bookings }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based
  const [selected, setSelected] = useState<BookingRecord | null>(null);

  const monthStart = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = monthStart.getDay(); // 0=Sun

  const monthBookings = bookings.filter((b) => {
    if (!b.preferredDate) return false;
    const d = isoToLocalDate(b.preferredDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  function bookingsForDay(day: number): BookingRecord[] {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return monthBookings
      .filter((b) => b.preferredDate === iso)
      .sort((a, b) => (a.preferredTime || "").localeCompare(b.preferredTime || ""));
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Calendar grid */}
      <div>
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="kh-btn kh-btn-ghost !py-1.5 !px-3 !min-h-0 text-sm"
          >
            ← Prev
          </button>
          <h2 className="font-serif text-2xl text-[var(--kh-brown)]">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="kh-btn kh-btn-ghost !py-1.5 !px-3 !min-h-0 text-sm"
          >
            Next →
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-medium tracking-[0.16em] uppercase text-[var(--kh-brown-soft)] py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - firstDow + 1;
            const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const isToday =
              inMonth &&
              today.getDate() === dayNum &&
              today.getMonth() === month &&
              today.getFullYear() === year;
            const dayBookings = inMonth ? bookingsForDay(dayNum) : [];

            return (
              <div
                key={i}
                className={[
                  "min-h-[80px] rounded-lg border p-1.5 transition",
                  inMonth
                    ? "border-[var(--kh-line)] bg-white hover:border-[var(--kh-gold)]"
                    : "border-transparent bg-transparent",
                ].join(" ")}
              >
                {inMonth ? (
                  <>
                    <p className={[
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                      isToday
                        ? "bg-[var(--kh-brown)] text-[var(--kh-cream)]"
                        : "text-[var(--kh-brown-soft)]",
                    ].join(" ")}>
                      {dayNum}
                    </p>
                    <div className="space-y-0.5">
                      {dayBookings.slice(0, 3).map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setSelected(b)}
                          title={`${b.name} · ${b.serviceName}`}
                          className={[
                            "w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight",
                            STATUS_STYLE[b.status] ?? STATUS_STYLE.new,
                          ].join(" ")}
                        >
                          {formatTime(b.preferredTime)} {b.name.split(" ")[0]}
                        </button>
                      ))}
                      {dayBookings.length > 3 ? (
                        <p className="text-[10px] text-[var(--kh-brown-soft)] pl-1">
                          +{dayBookings.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--kh-brown-soft)]">
          {(["new","confirmed","cancelled"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5 capitalize">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT[s]}`} />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <aside className="lg:sticky lg:top-6 h-fit">
        {selected ? (
          <div className="kh-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-block text-[10px] font-medium tracking-[0.15em] uppercase px-2 py-0.5 rounded-full mb-2 ${STATUS_STYLE[selected.status] ?? STATUS_STYLE.new}`}>
                  {selected.status}
                </span>
                <h3 className="font-serif text-xl text-[var(--kh-brown)]">{selected.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="text-[var(--kh-brown-soft)] hover:text-[var(--kh-brown)] text-xl leading-none mt-1"
              >
                ×
              </button>
            </div>
            <hr className="kh-gold-rule my-3" />
            <dl className="space-y-2 text-sm">
              <Row k="Session" v={`${selected.serviceName} · ${selected.durationMinutes} min`} />
              <Row k="Date" v={selected.preferredDate} />
              <Row k="Time" v={formatTime(selected.preferredTime) || selected.preferredWindow || "-"} />
              <Row k="Area" v={formatServiceAreaLabel(selected.area, selected.areaCustom)} />
              <Row k="Address" v={selected.address} />
              {selected.addressNotes ? <Row k="Notes" v={selected.addressNotes} /> : null}
              <Row k="Price" v={`$${selected.priceUsd}${selected.priceJmd ? ` · J$${selected.priceJmd.toLocaleString("en-JM")}` : ""}`} />
              {selected.message ? <Row k="Client note" v={selected.message} /> : null}
              <Row k="Received" v={new Date(selected.createdAt).toLocaleString()} />
            </dl>
            <div className="mt-4 pt-3 border-t border-[var(--kh-line)] flex flex-col gap-2">
              <a
                href={`mailto:${selected.email}`}
                className="kh-btn kh-btn-primary !py-2 text-sm text-center"
              >
                Email {selected.name.split(" ")[0]}
              </a>
              <a
                href={`tel:${selected.phone}`}
                className="kh-btn kh-btn-ghost !py-2 text-sm text-center"
              >
                {selected.phone}
              </a>
            </div>
          </div>
        ) : (
          <div className="kh-card text-center text-[var(--kh-brown-soft)] text-sm py-10">
            <p className="font-serif text-lg text-[var(--kh-brown)] mb-2">No reservation selected</p>
            <p>Click any booking on the calendar to see details.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="uppercase tracking-[0.12em] text-[11px] text-[var(--kh-brown-soft)] pt-0.5">{k}</dt>
      <dd className="col-span-2 text-[var(--kh-ink)] break-words">{v}</dd>
    </div>
  );
}
