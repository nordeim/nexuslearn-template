import { expect, test } from "@playwright/test";

// Mobile navigation (375×667 — the reference app's mobile chrome):
// the fixed top bar with the hamburger trigger, the animated dropdown
// panel, and the symmetric md: breakpoints. This is the highest-regression-
// risk chrome for Tailwind v4 (Class B display-mismatch bugs) — the
// desktop row and the mobile panel MUST share the exact `md:` boundary.

// A touch-enabled 375×667 chromium context (mobile geometry, tap-ready).
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });

const NAV_LINKS = ["Home", "Courses", "AI Assistant", "Pricing", "Teach", "About", "Contact"];

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hamburger trigger is visible and desktop links are hidden on mobile", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Desktop link row must be hidden below md (symmetric breakpoint).
    const desktopRow = page.locator("nav .hidden.md\\:flex").first();
    await expect(desktopRow).toBeHidden();
  });

  test("tapping the hamburger opens the dropdown with all links + CTA", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();

    const panel = page.locator("nav div.md\\:hidden.bg-white");
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    for (const label of NAV_LINKS) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // Full-width gradient CTA at the bottom of the panel.
    const cta = panel.getByRole("button", { name: "My Dashboard" });
    await expect(cta).toBeVisible();
  });

  test("menu closes after navigating via a panel link (route-change close)", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();

    const panel = page.locator("nav div.md\\:hidden.bg-white");
    await panel.getByRole("link", { name: "Courses", exact: true }).tap();

    await expect(page).toHaveURL(/\/Courses/);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Panel collapses (height animates to 0).
    await expect(panel).toHaveCSS("height", "0px");
  });

  test("Escape key closes the open menu", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();
    await expect(page.locator("nav div.md\\:hidden.bg-white")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("menu icon swaps Menu -> X while open", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await expect(trigger.locator("svg.lucide-menu")).toHaveCount(1);

    await trigger.tap();
    await expect(trigger.locator("svg.lucide-x")).toHaveCount(1);
    await expect(trigger.locator("svg.lucide-menu")).toHaveCount(0);
  });

  test("mobile menu also works on the white-nav pages (scrolled state)", async ({ page }) => {
    await page.goto("/Courses");
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();
    const panel = page.locator("nav div.md\\:hidden.bg-white");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "Pricing", exact: true })).toBeVisible();
  });
});
