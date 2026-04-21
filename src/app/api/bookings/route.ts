import { NextResponse } from "next/server";
import { append } from "@/lib/bookings";
import { validateBooking } from "@/lib/validation";
import { notifyNewBooking } from "@/lib/notify";

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
      { status: 422 }
    );
  }

  const record = await append(result.data);
  // Fire-and-forget; don't fail the request if notification fails.
  notifyNewBooking(record).catch((err) => console.error("[bookings.POST] notify error", err));

  return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
}
