# Krowned Hands — Brand guide

The **printable brand style guide** (swatches, logo lockups, type specimens, do / don’t) lives in:

- **`docs/brand-guide-print.html`** — open in a browser for review or Print → Save as PDF  
- **`docs/BRAND_GUIDE.pdf`** — regenerate with `npm run docs:pdf` from the repo root (needs Playwright; run `npx playwright install chromium` once if prompted)

Use that document for partners, printers, and social templates. This file is a **short text companion** only.

---

## Brand essence

Jamaica-based mobile massage and bodywork (Kingston & Montego Bay), led by Jordan. Positioning: **transformational body work** — pain relief, deep recovery, nervous system reset — delivered **in the client’s space** (home, hotel, villa).

**Tone:** Warm, grounded, premium without cold luxury. Calm confidence and clear logistics.

**Name:** “Krowned Hands” as the formal name; script accents (e.g. “body work”) add softness and do not replace the wordmark.

---

## Typography

| Role | Family |
|------|--------|
| Headlines | **Playfair Display** |
| Body & UI | **Inter** |
| Accent script | **Great Vibes** (short phrases only) |

Google Fonts bundle used on the site: Inter (400–700), Playfair Display (400–700), Great Vibes.

---

## Core colors (hex)

| | |
|--|--|
| Cream | `#f7efe2` |
| Cream soft | `#fbf5ea` |
| Sand | `#ecdcc1` |
| Ochre | `#c89a5b` |
| Champagne gold | `#b88a4a` |
| Gold deep | `#8f6a33` |
| Chocolate | `#3b2419` |
| Brown soft | `#5a3a2a` |
| Ink | `#24201d` |
| Line / hairline | `#e5d6bf` |
| Charcoal (dark sections) | `#141210` |

Use gold as **accent** and warmth, not as the dominant fill everywhere. **Dark accents** (charcoal) balance the cream base: cream type and restrained gold highlights so emphasis stays warm, not flat.

---

## Logo

Assets: **`public/brand/logo-mark.png`** (mark), **`public/brand/logo-type.png`** (wordmark). Prefer PNG with transparency. Do not stretch, recolor arbitrarily, or add heavy drop shadows; see the do / don’t page in the HTML guide.

---

## Photography

Rounded frames, warm natural light, dignified alt text. Hero on the site uses a **flat cream** background behind portrait and copy; other sections may use the softer watercolor-style treatment.

---

## Quick do / don’t

**Do:** Playfair + Inter, cream and charcoal rhythm, generous space, clear CTAs.  
**Don’t:** Many display fonts, cold gray “template” neutrals, overcrowded hero, distorted logo.

---

*When design tokens or copy change in the product, update `docs/brand-guide-print.html` and regenerate the PDF in the same change.*
