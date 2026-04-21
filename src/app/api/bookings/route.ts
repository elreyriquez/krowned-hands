import { NextResponse } from "next/server";
import { append, readAll } from "@/lib/bookings";
import { validateBooking } from "@/lib/validation";
import { notifyNewBooking } from "@/lib/notify";
import { isSlotBookable } from "@/lib/availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateBooking(payload as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json(
      { message: "Please fix the highlighted fields.", errors: result.errors },
      { status: 422 },
    );
  }

  // Race-safe availability check: even if the client held onto a slot that
  // was open seconds ago, re-run the overlap check against the authoritative
  // store before writing.
  const all = await readAll();
  const stillOpen = isSlotBookable(
    result.data.preferredDate,
    result.data.preferredTime,
    result.data.durationMinutes,
    all,
  );
  if (!stillOpen) {
    return NextResponse.json(
      {
        message:
          "That time was just taken. Please pick another available slot, we held the rest for you.",
        errors: { preferredTime: "Slot no longer available." },
      },
      { status: 409 },
    );
  }

  const record = await append(result.data);
  // Fire-and-forget; don't fail the request if notification fails.
  notifyNewBooking(record).catch((err) => console.error("[bookings.POST] notify error", err));

  return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
}
