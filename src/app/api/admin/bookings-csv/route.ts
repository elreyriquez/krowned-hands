import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { bookingsToCsv, readAll } from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET: download full booking ledger as CSV (requires admin cookie).
 */
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const records = await readAll();
  const csv = bookingsToCsv(records);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `krowned-hands-bookings-${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
