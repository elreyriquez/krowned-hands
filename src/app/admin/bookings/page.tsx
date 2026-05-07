import { redirect } from "next/navigation";
import { isAdminRequest, signOut } from "@/lib/auth";
import { readAll } from "@/lib/bookings";
import { syncCalendlyRecentBookings } from "@/lib/calendly";
import { formatServiceAreaLabel } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  if (!(await isAdminRequest())) {
    redirect("/admin/login?next=/admin/bookings");
  }
  const all = await readAll();

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/admin/login");
  }

  async function handleCalendlySync() {
    "use server";
    try {
      await syncCalendlyRecentBookings({ lookbackDays: 45, maxEvents: 120 });
    } catch (err) {
      // Never crash admin UI on a manual sync attempt.
      console.error("[admin.bookings] calendly sync failed", err);
    }
    redirect("/admin/bookings");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--kh-brown)]">Reservations</h1>
          <p className="text-[var(--kh-brown-soft)] mt-1 text-sm">
            {all.length} total · most recent first
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={handleCalendlySync}>
            <button className="kh-btn kh-btn-ghost !py-2 !px-4 !min-h-0 text-sm">
              Sync Calendly now
            </button>
          </form>
          <a
            href="/api/admin/bookings-csv"
            className="kh-btn kh-btn-primary !py-2 !px-4 !min-h-0 text-sm"
          >
            Download CSV ledger
          </a>
          <form action={handleSignOut}>
            <button className="kh-btn kh-btn-ghost !py-2 !px-4 !min-h-0 text-sm">Sign out</button>
          </form>
        </div>
      </div>

      {all.length === 0 ? (
        <div className="kh-card mt-8 text-center">
          <p className="font-serif text-xl text-[var(--kh-brown)]">No reservations yet.</p>
          <p className="mt-2 text-sm text-[var(--kh-brown-soft)]">
            When a visitor completes the form at <code>/book</code>, you&rsquo;ll see it here.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border border-[var(--kh-line)] rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--kh-cream-soft)] text-[var(--kh-brown)]">
              <tr className="text-left">
                <th className="px-4 py-3 font-serif">Received</th>
                <th className="px-4 py-3 font-serif">Client</th>
                <th className="px-4 py-3 font-serif">Session</th>
                <th className="px-4 py-3 font-serif">Preferred</th>
                <th className="px-4 py-3 font-serif">Area</th>
                <th className="px-4 py-3 font-serif">Contact</th>
              </tr>
            </thead>
            <tbody>
              {all.map((b) => (
                <tr key={b.id} className="border-t border-[var(--kh-line)] align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--kh-brown-soft)]">
                    {new Date(b.createdAt).toLocaleString()}
                    <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mt-1">
                      {b.id.slice(0, 8)}
                    </div>
                    {b.source ? (
                      <div className="mt-2 inline-flex rounded-full border border-[var(--kh-line)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--kh-brown-soft)]">
                        {b.source}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--kh-brown)]">{b.name}</div>
                    {b.message ? (
                      <div className="mt-1 text-xs text-[var(--kh-brown-soft)] max-w-xs whitespace-pre-wrap">
                        {b.message}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--kh-brown)]">{b.serviceName}</div>
                    <div className="text-xs text-[var(--kh-brown-soft)]">
                      {b.durationMinutes} min · ${b.priceUsd}
                      {b.priceJmd != null ? ` · J$${b.priceJmd.toLocaleString("en-JM")}` : ""}
                      {b.quoteCurrency === "jmd" ? " · viewed JMD" : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{b.preferredDate}</div>
                    <div className="text-xs text-[var(--kh-brown-soft)]">
                      {b.preferredTime
                        ? `${b.preferredTime}${
                            b.preferredWindow ? ` · ${b.preferredWindow}` : ""
                          }`
                        : b.preferredWindow || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{formatServiceAreaLabel(b.area, b.areaCustom)}</div>
                    <div className="text-xs text-[var(--kh-brown-soft)] max-w-xs">{b.address}</div>
                    {b.addressNotes ? (
                      <div className="text-[11px] text-[var(--kh-brown-soft)] italic mt-1">
                        {b.addressNotes}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a className="kh-link block" href={`mailto:${b.email}`}>{b.email}</a>
                    <a className="kh-link block" href={`tel:${b.phone}`}>{b.phone}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
