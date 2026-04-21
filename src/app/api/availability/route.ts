import { NextResponse } from "next/server";
import { readAll } from "@/lib/bookings";
import { computeAvailability } from "@/lib/availability";
import { findService } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/availability?date=YYYY-MM-DD&serviceId=krowned-reset-60
 *
 * Returns the list of 30-minute slot starts in Jordan's working window with
 * an `available` flag for each. A slot is unavailable when its [start, end)
 * interval overlaps any existing booking on that date (status new or confirmed),
 * when its end would run past 22:30, or when its start is in the past today.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || "";
  const serviceId = searchParams.get("serviceId") || "";
  const explicitDuration = Number(searchParams.get("duration")) || 0;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { message: "Query param `date` must be YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const service = findService(serviceId);
  const durationMinutes =
    service?.durationMinutes ||
    (explicitDuration > 0 && explicitDuration <= 240 ? explicitDuration : 60);

  const bookings = await readAll();
  const slots = computeAvailability({ date, durationMinutes, bookings });

  return NextResponse.json({
    date,
    serviceId: service?.id || serviceId || null,
    durationMinutes,
    slots,
  });
}
