/**
 * Renders docs/brand-guide-print.html to docs/BRAND_GUIDE.pdf (Playwright + Chromium).
 * Run from repo root: npm run docs:pdf
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs", "brand-guide-print.html");
const pdfPath = path.join(root, "docs", "BRAND_GUIDE.pdf");

const { chromium } = await import("playwright");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await page.pdf({
    path: pdfPath,
    format: "A4",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  console.log("Wrote", pdfPath);
} finally {
  await browser.close();
}
