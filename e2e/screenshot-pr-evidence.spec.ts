/**
 * Captures before/after visual evidence for PR #1785.
 *
 * Routes:   /docs/guide/style-guide, /docs (page with code blocks), /community
 * Viewports: 1440×900, 390×844
 * Schemes:   light, dark
 *
 * Run against `next start` on port 3100:
 *   npx playwright test e2e/screenshot-pr-evidence.spec.ts --project=chromium
 *
 * Screenshots are written to e2e/screenshots/.
 */

import * as fs from "fs";
import * as path from "path";
import { test, type Page } from "@playwright/test";

const ROUTES = [
  { name: "style-guide", path: "/docs/guide/style-guide" },
  { name: "docs-code-blocks", path: "/docs" },
  { name: "community", path: "/community" },
];

const VIEWPORTS = [
  { label: "1440", width: 1440, height: 900 },
  { label: "390", width: 390, height: 844 },
];

const SCHEMES: Array<"light" | "dark"> = ["light", "dark"];

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

async function preparePage(
  page: Page,
  route: string,
  width: number,
  height: number,
  scheme: "light" | "dark",
) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ colorScheme: scheme });

  await page.goto(route, { waitUntil: "networkidle", timeout: 60_000 });

  // Sync ThemeProvider localStorage key
  await page.evaluate((s) => {
    localStorage.setItem("offer-hub-theme", s);
  }, scheme);

  // Reload so the theme boot script picks up the stored preference
  await page.reload({ waitUntil: "networkidle", timeout: 60_000 });

  // Let any animations settle
  await page.waitForTimeout(500);
}

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
});

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const label = `${route.name}__${vp.label}px__${scheme}`;

      test(`screenshot: ${label}`, async ({ page }) => {
        await preparePage(page, route.path, vp.width, vp.height, scheme);

        const filePath = path.join(SCREENSHOTS_DIR, `${label}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
      });
    }
  }
}
