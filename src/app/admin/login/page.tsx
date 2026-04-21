import { redirect } from "next/navigation";
import { isAdminRequest, signIn } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (await isAdminRequest()) redirect("/admin/bookings");
  const sp = await searchParams;

  async function handle(formData: FormData) {
    "use server";
    const password = String(formData.get("password") || "");
    const next = String(formData.get("next") || "/admin/bookings");
    const ok = await signIn(password);
    if (!ok) redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
    redirect(next.startsWith("/") ? next : "/admin/bookings");
  }

  return (
    <div className="max-w-sm mx-auto kh-card mt-16">
      <h1 className="font-serif text-2xl text-[var(--kh-brown)]">Admin sign-in</h1>
      <p className="mt-1 text-sm text-[var(--kh-brown-soft)]">
        Enter the admin password set in <code>ADMIN_PASSWORD</code>.
      </p>
      <form action={handle} className="mt-6 grid gap-4">
        <input type="hidden" name="next" value={sp.next || "/admin/bookings"} />
        <label className="kh-label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="kh-input"
          autoComplete="current-password"
        />
        {sp.error ? <p className="kh-error">That password didn&rsquo;t match.</p> : null}
        <button type="submit" className="kh-btn kh-btn-primary mt-2">Sign in</button>
      </form>
    </div>
  );
}
