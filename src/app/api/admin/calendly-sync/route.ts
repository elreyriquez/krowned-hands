import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { syncCalendlyRecentBookings } from "@/lib/calendly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncCalendlyRecentBookings({ lookbackDays: 45, maxEvents: 120 });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin.calendly-sync] failed", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Calendly sync failed." },
      { status: 500 },
    );
  }
}
