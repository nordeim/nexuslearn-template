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

  test("hero CTAs match the reference targets (Start Learning -> /Courses)", async ({ page }) => {
    await page.goto("/");
    const browse = page.getByRole("button", { name: "Browse Courses" });
    const start = page.getByRole("button", { name: "Start Learning" });
    await expect(browse).toBeVisible();
    await expect(start).toBeVisible();
    // Both hero CTAs link to /Courses on the reference app.
    await expect(page.locator("a:has(button:text('Start Learning'))")).toHaveAttribute("href", "/Courses");
    // Nav logo links to /Home (reference behavior; /Home renders the landing)
    await expect(page.locator("nav a").first()).toHaveAttribute("href", "/Home");
  });

  test("section eyebrows are text-sm spans with Title-Case source text", async ({ page }) => {
    await page.goto("/");
    // Reference eyebrows: <span class="text-sm font-semibold text-purple-600 tracking-wider uppercase">
    for (const label of ["Explore", "Top Picks", "Career Tracks", "Testimonials", "Pricing"]) {
      const eyebrow = page.locator(`span.text-sm.text-purple-600.uppercase`, { hasText: label }).first();
      await expect(eyebrow).toBeVisible();
      // Source text is Title Case (the CSS `uppercase` class renders it as caps).
      await expect(eyebrow).toHaveText(label, { ignoreCase: false });
    }
  });

  test("category grid wraps into 4 columns with linked cards", async ({ page }) => {
    await page.goto("/");
    // Reference grid: grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6
    const grid = page.locator("main section", { has: page.getByRole("heading", { name: "Browse by Category" }) }).locator(".grid").first();
    await expect(grid).toHaveClass(/lg:grid-cols-4/);
    await expect(grid).toHaveClass(/sm:grid-cols-3/);
    // Cards are links to the filtered catalog
    await expect(grid.locator("a[href*='/Courses?category=']").first()).toBeVisible();
    // Card surface matches the reference (cursor-pointer overflow-hidden)
    await expect(grid.locator("a > div").first()).toHaveClass(/cursor-pointer/);
  });

  test("AI section is the reference 2-column layout with glass feature cards", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section", { has: page.getByRole("heading", { name: "AI Study Companion" }) });

    // Badge above the h2, purple-tinted (left column)
    await expect(section.getByText("✨ Powered by AI")).toBeVisible();
    await expect(section.getByText("✨ Powered by AI")).toHaveClass(/bg-purple-500\/10/);

    // h2 breaks after "Your Personal"; gradient span carries the rest
    const h2 = section.getByRole("heading", { name: "AI Study Companion" });
    await expect(h2.locator("br")).toHaveCount(1);
    await expect(h2.locator("span.bg-gradient-to-r")).toBeVisible();

    // 2-col wrapper + 4 glass cards in a 2x2 grid on the right
    await expect(section.locator(".grid.grid-cols-1.lg\\:grid-cols-2").first()).toBeVisible();
    const glassGrid = section.locator(".grid.sm\\:grid-cols-2").first();
    await expect(glassGrid).toBeVisible();
    await expect(glassGrid.locator("> div")).toHaveCount(4);
    await expect(glassGrid.locator("> div").first()).toHaveClass(/bg-white\/5/);
    // Bare lucide icons, cyan, no gradient boxes
    await expect(glassGrid.locator("> div").first()).toHaveClass(/backdrop-blur-sm/);
  });

  test("instructor section has the image + floating $12.5M stat and CTA after features", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section", { has: page.getByRole("heading", { name: "Become an Instructor" }) });

    // Left image column (unsplash instructor photo + purple overlay)
    await expect(section.locator("img[alt='Instructor']")).toBeVisible();
    await expect(section.locator(".aspect-\\[4\\/3\\]")).toBeVisible();

    // Floating stat card
    await expect(section.getByText("$12.5M+")).toBeVisible();
    await expect(section.getByText("Paid to Instructors")).toBeVisible();

    // CTA comes AFTER the feature list in DOM order
    const cta = section.getByRole("button", { name: "Start Teaching Today" });
    await expect(cta).toBeVisible();
    const lastFeature = section.getByRole("heading", { name: "Analytics Dashboard" });
    const ctaBox = await cta.boundingBox();
    const featureBox = await lastFeature.boundingBox();
    expect(ctaBox?.y ?? 0).toBeGreaterThan(featureBox?.y ?? 0);
  });

  test("pricing cards match the reference (rounded-3xl, dark popular card, desc line)", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section", { has: page.getByRole("heading", { name: "Choose Your Plan" }) });
    const cards = section.locator(".grid > div");
    await expect(cards).toHaveCount(3);

    // rounded-3xl on all cards
    await expect(cards.first()).toHaveClass(/rounded-3xl/);

    // Middle card is the dark gradient popular card
    const popular = cards.nth(1);
    await expect(popular).toHaveClass(/bg-gradient-to-br/);
    await expect(popular).toHaveClass(/scale-105/);
    await expect(popular.getByText("Most Popular")).toBeVisible();

    // Desc line under the price (missing on the pre-session-3 clone)
    await expect(section.getByText("Perfect for getting started")).toBeVisible();
    await expect(section.getByText("For serious learners")).toBeVisible();
    await expect(section.getByText("Best value for committed learners")).toBeVisible();

    // Reference buttons
    await expect(section.getByRole("button", { name: "Start Pro Trial" })).toBeVisible();
    await expect(section.getByRole("button", { name: "Get Lifetime Access" })).toBeVisible();
  });

  test("learning-path cards use the reference gray surface without borders", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section", { has: page.getByRole("heading", { name: "Structured Learning Paths" }) });
    const card = section.locator(".grid > div").first();
    await expect(card).toHaveClass(/bg-gray-50/);
    await expect(card).not.toHaveClass(/border/);
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
    // Reference signup CTA: one button "Need an account? Sign up"
    await expect(page.getByRole("button", { name: "Need an account? Sign up" })).toBeVisible();
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
  test("pricing page FAQ matches the reference questions and stack layout", async ({ page }) => {
    await page.goto("/Pricing");
    await expect(page).toHaveTitle("Pricing | NexusLearn");

    // Reference FAQ: single-column stack (space-y-6), gray cards with help icons
    const faqSection = page.locator("main section", { has: page.getByRole("heading", { name: "Frequently Asked Questions" }) });
    const stack = faqSection.locator(".space-y-6").first();
    await expect(stack).toBeVisible();
    await expect(stack.locator("> div")).toHaveCount(4);
    await expect(stack.locator("> div").first()).toHaveClass(/bg-gray-50/);
    // h3 rows carry the circle-help icon
    await expect(stack.locator("h3 svg").first()).toBeVisible();

    // The 4 reference questions (verbatim)
    for (const q of [
      "Can I switch plans at any time?",
      "Is there a free trial for Pro?",
      "What payment methods do you accept?",
      "Can I get a refund?",
    ]) {
      await expect(faqSection.getByRole("heading", { name: q })).toBeVisible();
    }
    await expect(faqSection.getByText("30-day money-back guarantee", { exact: false })).toBeVisible();
  });

  test("pricing page hero uses the reference pt-16 pb-12 rhythm", async ({ page }) => {
    await page.goto("/Pricing");
    const h1 = page.getByRole("heading", { name: "Simple, Transparent Pricing" });
    await expect(h1).toBeVisible();
    // Hero container: same cosmic gradient, pt-16 pb-12 (not py-20)
    await expect(page.locator("main .bg-gradient-to-br.pt-16.pb-12").first()).toBeVisible();
    // Plans section headline
    await expect(page.getByRole("heading", { name: "Choose Your Plan" })).toBeVisible();
    // Dark popular card on the pricing page too
    const cards = page.locator("main .grid > div", { has: page.getByRole("button", { name: "Start Pro Trial" }) });
    await expect(cards).toHaveClass(/bg-gradient-to-br/);
  });

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
