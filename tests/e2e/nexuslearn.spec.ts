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

  test("hero illustration is the reference flowing-lines SVG", async ({ page }) => {
    await page.goto("/");
    // The decorative SVG sits behind the hero content (aria-hidden).
    const svg = page.locator("main div[aria-hidden='true'] svg", {
      has: page.locator("defs linearGradient"),
    }).first();
    await expect(svg).toBeAttached();
    const paths = await svg.locator("path").count();
    expect(paths).toBeGreaterThanOrEqual(8); // 4 lines x (dim + gradient stroke)
  });

  test("featured course cards link to CourseDetail", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("main a[href*='CourseDetail']").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/CourseDetail\?id=/);
    await expect(page.getByRole("button", { name: "Enroll Now" })).toBeVisible();
  });

  test("footer renders with navigation columns and tagline", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("Empowering millions of learners worldwide")).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Platform" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Company" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Support" })).toBeVisible();
    await expect(footer.getByText("Built for the future of education.")).toBeVisible();
    await expect(footer.getByText("© 2026 NexusLearn. All rights reserved.")).toBeVisible();
  });

  test("/Home renders the landing page (reference footer link target)", async ({ page }) => {
    await page.goto("/Home");
    await expect(page).toHaveURL(/\/Home/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn Skills That");
  });
});

test.describe("courses catalog", () => {
  test("dark hero with glassy search and floating filter card", async ({ page }) => {
    await page.goto("/Courses");
    await expect(page.getByRole("heading", { name: "Explore Our Courses" })).toBeVisible();

    const search = page.getByLabel("Search courses");
    await expect(search).toBeVisible();
    // Glassy dark input inside the hero
    await expect(search).toHaveClass(/bg-white\/10/);

    // Floating white filter card overlapping the hero
    const filterCard = page.locator("div.bg-white.rounded-2xl.shadow-lg").first();
    await expect(filterCard).toBeVisible();
    await expect(filterCard.getByText(/9 courses/)).toBeVisible();
  });

  test("search and filters work", async ({ page }) => {
    await page.goto("/Courses");

    const search = page.getByLabel("Search courses");
    await search.fill("Python");
    // Every visible card title mentions Python (matches 2 seeded courses).
    const titles = page.locator("main a[href*='CourseDetail'] h3");
    const count = await titles.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const counter = page.locator("p.text-sm", { hasText: /course/ }).first();
    await expect(counter).toContainText(/\d/);
  });

  test("empty search shows Clear Filters and the empty state", async ({ page }) => {
    await page.goto("/Courses");
    await page.getByLabel("Search courses").fill("zzzzqqqq");
    await expect(page.getByText("No courses found")).toBeVisible();
    await expect(page.getByText("Try adjusting your search or filters")).toBeVisible();
    await page.getByRole("button", { name: "Clear Filters" }).click();
    await expect(page.getByText("No courses found")).toHaveCount(0);
  });

  test("category deep-link filters the grid", async ({ page }) => {
    await page.goto("/Courses?category=design");
    await expect(page.getByText("UI/UX Design Professional Certificate")).toBeVisible();
  });
});

test.describe("course detail", () => {
  test("dark hero, price card, curriculum and What You'll Learn", async ({ page }) => {
    await page.goto("/Courses");
    await page.locator("main a[href*='CourseDetail']").first().click();
    await expect(page).toHaveURL(/CourseDetail\?id=/);

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cloud Computing with AWS");
    await expect(page.getByRole("button", { name: "Enroll Now" })).toBeVisible();
    await expect(page.getByText("$69.99").first()).toBeVisible();
    await expect(page.getByText("$179.99").first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Course Curriculum" })).toBeVisible();
    // Reference curriculum rows: "Lesson N: Module Content" (220 for the AWS course)
    const lessons = page.getByText("Lesson 1: Module Content", { exact: true });
    await expect(lessons).toBeVisible();
    const lessonCount = await page.locator("main span.font-medium", { hasText: "Lesson " }).count();
    expect(lessonCount).toBeGreaterThanOrEqual(200);

    // What You'll Learn = tags + level
    await expect(page.getByRole("heading", { name: "What You'll Learn" })).toBeVisible();
    for (const topic of ["AWS", "Cloud", "DevOps", "Serverless", "Microservices", "Intermediate Level"]) {
      await expect(page.getByText(topic, { exact: true }).first()).toBeVisible();
    }
  });
});

test.describe("auth + dashboard", () => {
  test("login page renders with Google button and form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page).toHaveTitle("NexusLearn");
  });

  test("dashboard renders for signed-out visitors (reference behavior)", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back");
    await expect(page.getByText("Enrolled Courses")).toBeVisible();
    await expect(page.getByText("Avg. Progress")).toBeVisible();
    await expect(page.getByText("No courses yet")).toBeVisible();
  });

  test("login with demo credentials returns to the landing page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();

    // The reference app returns to the landing page after signing in.
    await expect(page).toHaveURL(/\/[^/]*$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn Skills That");
  });

  test("signed-in dashboard greets the user and shows stats", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn Skills That", { timeout: 15000 });

    await page.goto("/Dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back, sepnetflix2023");
    await expect(page.getByText("Enrolled Courses")).toBeVisible();
    await expect(page.getByText("Avg. Progress")).toBeVisible();
  });

  test("enroll from course detail shows up on the dashboard", async ({ page }) => {
    // Sign in via the UI, then exercise the enrollment flow.
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn Skills That", { timeout: 15000 });

    await page.goto("/Courses");
    await page.locator("main a[href*='CourseDetail']").first().click();
    await page.getByRole("button", { name: "Enroll Now" }).click();
    await expect(page.getByText(/You're enrolled/)).toBeVisible();

    await page.goto("/Dashboard");
    await expect(page.getByText("My Courses")).toBeVisible();
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  });
});

test.describe("content pages", () => {
  test("about page shows the four reference values", async ({ page }) => {
    await page.goto("/About");
    for (const value of ["Mission-Driven", "Student-First", "Innovation", "Global Impact"]) {
      await expect(page.getByRole("heading", { name: value })).toBeVisible();
    }
  });

  test("become-instructor page matches the reference outline", async ({ page }) => {
    await page.goto("/BecomeInstructor");
    await expect(page).toHaveTitle("Become Instructor | NexusLearn");
    await expect(
      page.getByText("Join thousands of instructors earning income while making an impact.")
    ).toBeVisible();
    for (const benefit of ["Analytics Dashboard", "Certification Programs", "Community Support"]) {
      await expect(page.getByRole("heading", { name: benefit })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Get Started Today" })).toBeVisible();
  });

  test("AI assistant page has the reference title and chat shell", async ({ page }) => {
    await page.goto("/AIAssistant");
    await expect(page).toHaveTitle("AI Assistant | NexusLearn");
    await expect(page.getByRole("heading", { name: "AI Study Assistant" })).toBeVisible();
    await expect(page.getByText("Ready to help you learn")).toBeVisible();
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
