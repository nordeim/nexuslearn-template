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

test.describe("session-9 parity: the Tailwind v4 space-y engine trap", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Tailwind v4 rewrote the space-y-* engine: v3 shipped
  // `.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top }`
  // (specificity 0,2,0 — it OVERRIDES a child's own .mt-3), while v4 ships
  // `:where(.space-y-1 > :not(:last-child)) { margin-block-end }` (zero
  // specificity — the child's .mt-3 WINS). The reference panel lists the CTA
  // link as `block mt-3` but renders a 4px gap (the v3 engine wins); a naive
  // v4 port renders 12px and an 8px taller panel. The clone therefore ships
  // the CTA WITHOUT mt-3 (an engine-variance class-form fix, same precedent
  // as the hero gradient) and these specs pin the reference layout.
  test("panel CTA renders the reference 4px space-y gap (no mt-3 resurrection)", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();
    const panel = page.locator("nav div.md\\:hidden.bg-white");

    // The CTA link is the LAST child of the px-4 py-4 space-y-1 list: no
    // engine margin lands on it, and it must not carry a resurrected mt-3.
    const cta = panel.getByRole("link", { name: "My Dashboard" });
    await expect(cta).toHaveCSS("margin-top", "0px");
    // The gap is carried by the previous sibling's margin-block-end (4px).
    const contact = panel.getByRole("link", { name: "Contact", exact: true });
    await expect(contact).toHaveCSS("margin-bottom", "4px");
  });

  test("open panel height matches the reference 405px", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();
    const panel = page.locator("nav div.md\\:hidden.bg-white");
    // Live reference: 405px (7 links x 44px + 4px gaps + the 36px CTA + the
    // py-4 padding + 1px border-t). The pre-fix v4 clone rendered 413px.
    await expect(panel).toHaveCSS("height", "405px");
  });

  test("panel My Dashboard button carries transition-colors + the base trio", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await trigger.tap();
    const panel = page.locator("nav div.md\\:hidden.bg-white");
    const cta = panel.getByRole("button", { name: "My Dashboard" });
    await expect(cta).toHaveClass(/transition-colors/);
    await expect(cta).toHaveClass(/disabled:pointer-events-none/);
    await expect(cta).toHaveClass(/disabled:opacity-50/);
    await expect(cta).toHaveClass(/\[&_svg\]:pointer-events-none/);
    await expect(cta).toHaveClass(/\[&_svg\]:size-4/);
    await expect(cta).toHaveClass(/\[&_svg\]:shrink-0/);
    await expect(cta).toHaveClass(/hover:bg-primary\/90/);
  });

  test("mobile trigger is the bare reference string (no hover/transition classes)", async ({ page }) => {
    // The trigger keeps its ARIA wiring (a11y hardening) but must not carry
    // the transition/hover utilities the reference does not ship.
    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await expect(trigger).toHaveClass(/^md:hidden p-2 rounded-lg text-white\/80$/);
    await page.goto("/Courses");
    await expect(trigger).toHaveClass(/^md:hidden p-2 rounded-lg text-gray-700$/);
  });
});
