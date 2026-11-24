/**
 * Capture before/after PR evidence screenshots.
 * Uses system Chrome via Playwright chromium channel.
 *
 * Usage:  node scripts/capture-screenshots.mjs
 * Output: e2e/screenshots/<name>__<width>px__<scheme>.png
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "e2e", "screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = "http://127.0.0.1:3100";

const ROUTES = [
  { name: "style-guide",      path: "/docs/guide/style-guide" },
  { name: "docs-code-blocks", path: "/docs" },
  { name: "community",        path: "/community" },
];

const VIEWPORTS = [
  { label: "1440", width: 1440, height: 900 },
  { label: "390",  width: 390,  height: 844 },
];

const SCHEMES = ["light", "dark"];

async function capture(page, route, vp, scheme) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.emulateMedia({ colorScheme: scheme });

  // Prime the ThemeProvider key before first load
  await page.addInitScript((s) => {
    localStorage.setItem("offer-hub-theme", s);
  }, scheme);

  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(800);

  const file = join(OUT_DIR, `${route.name}__${vp.label}px__${scheme}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("✓", file.replace(join(__dirname, "..") + "\\", ""));
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const page = await browser.newPage();
      try {
        await capture(page, route, vp, scheme);
      } catch (err) {
        console.error(`✗ ${route.name}__${vp.label}px__${scheme}: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  }
}

await browser.close();
console.log("\nAll screenshots written to e2e/screenshots/");
