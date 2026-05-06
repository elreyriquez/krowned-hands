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
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    const next = String(formData.get("next") || "/admin/bookings");
    const ok = await signIn(username, password);
    if (!ok) redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
    redirect(next.startsWith("/") ? next : "/admin/bookings");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--kh-cream)] px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-script text-5xl text-[var(--kh-gold-deep)] leading-none">Krowned</p>
          <p className="font-serif text-sm tracking-[0.22em] uppercase text-[var(--kh-brown-soft)] mt-1">
            Admin Portal
          </p>
        </div>
        <div className="kh-card">
          <h1 className="font-serif text-2xl text-[var(--kh-brown)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--kh-brown-soft)]">
            Krowned Hands reservations dashboard.
          </p>
          <form action={handle} className="mt-6 grid gap-4">
            <input type="hidden" name="next" value={sp.next || "/admin/bookings"} />
            <div>
              <label className="kh-label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                autoComplete="username"
                className="kh-input"
              />
            </div>
            <div>
              <label className="kh-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="kh-input"
              />
            </div>
            {sp.error ? (
              <p className="kh-error">Username or password didn&rsquo;t match.</p>
            ) : null}
            <button type="submit" className="kh-btn kh-btn-primary mt-2">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
