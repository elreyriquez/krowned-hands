import { redirect } from "next/navigation";
import { isAdminRequest, signOut } from "@/lib/auth";
import { readAll } from "@/lib/bookings";
import { InsightsDashboard } from "@/components/InsightsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminInsightsPage() {
  if (!(await isAdminRequest())) {
    redirect("/admin/login?next=/admin/insights");
  }
  const all = await readAll();

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[var(--kh-brown)]">Insights</h1>
          <p className="text-[var(--kh-brown-soft)] mt-1 text-sm">
            Revenue, volume, and client trends.
          </p>
        </div>
        <form action={handleSignOut}>
          <button className="kh-btn kh-btn-ghost !py-2 !px-4 !min-h-0 text-sm">Sign out</button>
        </form>
      </div>
      <InsightsDashboard bookings={all} />
    </div>
  );
}
