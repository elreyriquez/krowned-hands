# Krowned Hands — website v1

Mobile massage therapy and holistic bodywork by Jordan.
Two routes: a marketing `/` page and an in-site booking flow at `/book` that
replaces the previous Calendly link.

---

## Stack & why

- **Next.js 16 (App Router)** + **React 19** + **TypeScript**
  Server components where it helps, a client component only for the booking form.
- **Tailwind CSS v4** with brand tokens defined in `globals.css` (`@theme`).
  No extra UI dependency; everything visual is bespoke so the brand reads as a
  boutique studio, not a generic template.
- **File-based JSON store** for booking records (`.data/bookings.json`).
  Zero native deps, easy to migrate; see "Booking data & storage" below.
- **Next built-in `next/font`** for Playfair Display (serif), Inter (sans),
  and Great Vibes (script for the _Krowned_ accent).

No paid SaaS is required to run v1. Notifications are optional and pluggable.

---

## Getting started

```bash
cp .env.example .env.local    # set ADMIN_PASSWORD at minimum
npm install
npm run dev                   # http://localhost:3000
```

Build + production start:

```bash
npm run build
npm start
```

### Troubleshooting — blank / wrong color / nothing loads

1. **Always start the server with npm** — do not paste `"dev": "next dev"` into the terminal; run **`npm run dev`** from the project folder after `npm install`.

2. **Wait until the terminal prints** something like **`Ready`** and **`http://localhost:3000`** before opening the browser.

3. **Forest green / random solid color / “Untitled” spinner** almost always means **another app owns port 3000** or the browser never got HTML from this project. Check what is listening:
   ```bash
   lsof -nP -iTCP:3000 | grep LISTEN
   ```
   Stop that process, or use a different port:
   ```bash
   npm run dev:3010
   ```
   Then open **http://127.0.0.1:3010** (not 3000).

4. **Confirm it’s this site:** View **Page Source** on the page — you should see **“Krowned Hands”** in the `<title>`. If not, you’re not hitting this Next.js app.

5. Prefer **Chrome or Safari directly** — not Cursor’s embedded Simple Browser — for localhost.

6. **Page spins / never loads but terminal says Ready:** Stop the server (`Ctrl+C`), run `npm run dev` again, then try **`http://localhost:3000`** *and* **`http://127.0.0.1:3000`** — some setups resolve `localhost` to IPv6 first. If it still hangs, try **`npm run dev:webpack`** (same port; uses webpack instead of Turbopack).

7. **Paste one command per line** — don’t merge folder names with `npm`, e.g. wrong: `cd .../krowned-handsnpm run dev` — right: `cd .../krowned-hands` then Enter, then `npm run dev`.

---

## Routes

| Route              | Purpose                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | Marketing home: hero, three pillars, services, about, how it works, testimonial strip, FAQ, CTA. |
| `/book`            | Multi-step reservation form (Session → When & Where → Your details → Review) with summary + success state. |
| `/api/bookings`    | `POST` endpoint the form submits to. Validates, persists, notifies.   |
| `/admin/login`     | Minimal password sign-in (uses `ADMIN_PASSWORD`).                      |
| `/admin/bookings`  | Reservations table (cookie-protected).                                 |

---

## Booking data & storage

Records are persisted to `./.data/bookings.json` (git-ignored).
See `src/lib/bookings.ts` for the full shape:

```ts
type BookingRecord = {
  id: string;              // uuid
  createdAt: string;       // ISO timestamp
  status: "new" | "confirmed" | "cancelled";
  serviceId: string;       // e.g. "signature-60"
  serviceName: string;
  durationMinutes: number;
  priceUsd: number;
  area: string;            // "kingston" | "montego-bay"
  address: string;
  addressNotes?: string;
  preferredDate: string;   // YYYY-MM-DD
  preferredWindow: string; // e.g. "Morning · 8:00 AM – 11:00 AM"
  name: string;
  email: string;
  phone: string;
  message?: string;
  consent: true;
};
```

### Swapping to a real database

Replace `readAll` and `append` in `src/lib/bookings.ts`. Everything else
already speaks this shape — including the admin page and the notifier.
Recommended production targets: Supabase, Neon, Turso (libSQL), or Vercel Postgres.

---

## Notifications (optional, pluggable)

Set any of the following in `.env.local`. None are required — if none are set,
bookings are still saved and visible in `/admin/bookings`, and a line is
written to the server log.

| Variable                | Effect                                                   |
| ----------------------- | -------------------------------------------------------- |
| `RESEND_API_KEY`        | Enables email via [Resend](https://resend.com).          |
| `BOOKINGS_EMAIL`        | Inbox that receives new-reservation emails (required with Resend). |
| `BOOKINGS_FROM_EMAIL`   | Optional "from" address. Defaults to `bookings@krownedhands.com`. |
| `BOOKINGS_WEBHOOK_URL`  | Generic `POST` webhook (Zapier, Make, n8n, Slack). Receives the full JSON record. |

The notifier fails open — a notification failure never breaks the reservation.

---

## Admin

- `/admin/login` — password from `ADMIN_PASSWORD`. The admin cookie is HMAC-signed
  (optional `ADMIN_SESSION_SECRET`, defaults to `ADMIN_PASSWORD`) and expires after 7 days.
- `/admin/bookings` — table of every reservation, most recent first.
  Click email/phone to reach the client directly.

For launch, replace this with a proper provider (Clerk, Auth.js, or
Vercel's Password Protection) and/or move the table into a dashboard tool.

---

## Design system

Brand tokens live in `src/app/globals.css` under `:root` and `@theme inline`:

| Token            | Use                                   |
| ---------------- | ------------------------------------- |
| `--kh-cream`     | Primary background                    |
| `--kh-cream-soft`| Cards / elevated surfaces             |
| `--kh-sand`      | Watercolor mid accents                |
| `--kh-ochre`     | Tan brush / highlights                |
| `--kh-gold`      | Champagne gold accent                 |
| `--kh-gold-deep` | Gold text that meets AA on cream      |
| `--kh-brown`     | Headline / primary button             |
| `--kh-brown-soft`| Body text                             |
| `--kh-charcoal`  | Single dark accent section (IG-echo)  |

Typography:

- Headlines — Playfair Display (`font-serif`)
- "Krowned" / flourish — Great Vibes (`font-script`)
- Body / UI — Inter (`font-sans`)

Watercolor backdrop is a pure-CSS composition (`.kh-watercolor`) — no images,
GPU-friendly, and respects `prefers-reduced-motion`.

---

## Images — placeholder zones for client supply

The site ships with **zero stock photos of people**. Every image slot is a
labelled `<ImagePlaceholder />` with an explicit aspect ratio and a hint so
the owner knows exactly what belongs where. Replace by swapping each
`<ImagePlaceholder … />` for a `<Image />` from `next/image`.

Current slots:

- Hero — `3:4` portrait of Jordan working
- About — `4:5` portrait of Jordan
- Testimonial accent — `1:1` editorial detail (hands / oil / linen)

---

## Privacy note

The form stores the fields shown above. For production you should:

1. Link to a short privacy page in the footer (currently TODO).
2. Confirm retention policy (how long reservations live in the store).
3. If hosting on shared infrastructure, move `.data/` onto a managed DB.

---

## File map

```
src/
  app/
    layout.tsx               # fonts, metadata, header + footer
    globals.css              # brand tokens, watercolor, button/input primitives
    page.tsx                 # marketing home (/)
    book/page.tsx            # /book — booking wrapper
    api/bookings/route.ts    # POST /api/bookings
    admin/
      layout.tsx             # noindex, max-w shell
      login/page.tsx         # server action login
      bookings/page.tsx      # reservations table
  components/
    SiteHeader.tsx
    SiteFooter.tsx
    BrandLogo.tsx            # official PNG lockup (`public/brand/logo-*.png`)
    ImagePlaceholder.tsx     # labelled aspect-ratio slots for client imagery
    PillarCard.tsx
    BookingForm.tsx          # multi-step, client-side
  lib/
    services.ts              # session catalog (edit pricing/durations here)
    bookings.ts              # JSON-file store, easy to swap
    validation.ts            # server-side validation (used by API)
    auth.ts                  # admin cookie sign/verify
    notify.ts                # Resend / webhook notifier (best-effort)
```

---

## Assumptions (flag any to revise)

1. **Calendly event types** — the live Calendly page couldn't be crawled during
   build, so the service catalog in `src/lib/services.ts` was composed from the
   growth action plan (~$150 anchor, premium positioning) plus the three brand
   pillars. Jordan can edit names, durations, and prices in one place.
2. **Service areas** — Kingston and Montego Bay, per the Instagram bio.
   Out-of-area visits are handled as a note on the reservation.
3. **Payment** — intentionally **not** collected at reservation. The form
   is a confirm-by-message flow to preserve the "reservation request" framing
   and avoid committing to Stripe before the owner is ready.
4. **Testimonials** — placeholders only, per step 4 of the growth action plan
   ("collect and confirm usage permissions").
5. **Collective / Retreats** — referenced only in the FAQ. The plan calls for
   them as separate pages once therapists and dates are confirmed; they were
   left out of v1 to match the two-page scope the client requested.
6. **Brand mark** — Put **real** PNG (with alpha) files at `public/brand/logo-mark.png` and
   `logo-type.png`. If `file public/brand/logo-mark.png` reports **JPEG**, the extension is wrong:
   JPG has no transparency; re-export from your design tool as PNG-24 transparent and overwrite.

---

## Running the booking flow end-to-end

```bash
# 1. Start dev server
npm run dev

# 2. In another tab, set a password and sign in as admin
echo 'ADMIN_PASSWORD=letmein' >> .env.local
# restart `npm run dev` to load the env file

# 3. Visit /book, complete the form
# 4. Visit /admin/login → /admin/bookings to see the record
```

## License / rights

- Layout, code, and copy in this repo: © Krowned Hands Ltd.
- Fonts are loaded via Google Fonts (OFL / free for commercial use).
- No third-party photography is bundled — the client supplies all imagery.
