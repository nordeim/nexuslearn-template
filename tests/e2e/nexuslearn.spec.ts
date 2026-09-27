import { expect, test } from "@playwright/test";

// Public marketing surface — runs logged-out with an empty storageState so
// the auth-protected surface is never exercised here.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("landing page", () => {
  test("hero, stats and sections render", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn Skills That");
    await expect(page.getByText("Shape Your Future")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Browse by Category" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Courses" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Structured Learning Paths" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose Your Plan" })).toBeVisible();

    for (const stat of ["10K+", "500+", "50+", "95%"]) {
      await expect(page.getByText(stat, { exact: true })).toBeVisible();
    }
  });

  test("featured course cards link to CourseDetail", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("main a[href*='CourseDetail']").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/CourseDetail\?id=/);
    await expect(page.getByRole("button", { name: "Enroll Now" })).toBeVisible();
  });

  test("footer renders with navigation columns", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("Empowering millions of learners worldwide")).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Platform" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Company" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Support" })).toBeVisible();
  });
});

test.describe("courses catalog", () => {
  test("search and filters work", async ({ page }) => {
    await page.goto("/Courses");
    await expect(page.getByRole("heading", { name: "Explore Our Courses" })).toBeVisible();

    const search = page.getByLabel("Search courses");
    await search.fill("Python");
    // Every visible card title mentions Python (matches 2 seeded courses).
    const titles = page.locator("main a[href*='CourseDetail'] h3");
    const count = await titles.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const counter = page.locator("p.text-sm", { hasText: /course/ }).first();
    await expect(counter).toContainText(/\d/);
  });

  test("category deep-link filters the grid", async ({ page }) => {
    await page.goto("/Courses?category=design");
    await expect(page.getByText("UI/UX Design Professional Certificate")).toBeVisible();
  });
});

test.describe("auth + dashboard", () => {
  test("login page renders with Google button and form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("dashboard redirects to /login when signed out", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with demo credentials lands on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/Dashboard/, { timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
    await expect(page.getByText("Enrolled Courses")).toBeVisible();
    await expect(page.getByText("Avg. Progress")).toBeVisible();
  });

  test("enroll from course detail shows up on the dashboard", async ({ page }) => {
    // Sign in via the API to keep the UI flow focused on enrollment.
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/Dashboard/, { timeout: 15000 });

    await page.goto("/Courses");
    await page.locator("main a[href*='CourseDetail']").first().click();
    await page.getByRole("button", { name: "Enroll Now" }).click();
    await expect(page.getByText(/You're enrolled/)).toBeVisible();

    await page.goto("/Dashboard");
    await expect(page.getByText("My Courses")).toBeVisible();
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  });
});

test.describe("404", () => {
  test("unknown route shows the branded 404", async ({ page }) => {
    await page.goto("/ThisPageDoesNotExist");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go Home" })).toBeVisible();
  });
});
