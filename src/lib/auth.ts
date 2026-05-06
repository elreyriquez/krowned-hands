import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal admin auth. Replace with a real provider before launch.
 * Flow:
 *   1. Owner visits /admin/bookings.
 *   2. If no valid cookie, they enter ADMIN_PASSWORD at /admin/login.
 *   3. On success we set an HMAC-signed httpOnly cookie.
 */

const COOKIE_NAME = "kh_admin";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

function makeToken(): string {
  const issued = Date.now().toString();
  const sig = sign(issued);
  return `${issued}.${sig}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = sign(issued);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return false;
    }
  } catch {
    return false;
  }
  const issuedAt = Number(issued);
  if (!Number.isFinite(issuedAt)) return false;
  const ageSeconds = (Date.now() - issuedAt) / 1000;
  return ageSeconds < ONE_WEEK_SECONDS;
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function signIn(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME || "krownedhands";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass || !username || !password) return false;

  const uA = Buffer.from(username.toLowerCase());
  const uB = Buffer.from(expectedUser.toLowerCase());
  const userMatch =
    uA.length === uB.length && crypto.timingSafeEqual(uA, uB);

  const pA = Buffer.from(password);
  const pB = Buffer.from(expectedPass);
  const passMatch =
    pA.length === pB.length && crypto.timingSafeEqual(pA, pB);

  if (!userMatch || !passMatch) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
