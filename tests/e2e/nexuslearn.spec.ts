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

  test("learning-path cards use the reference gray surface with the transparent border", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section", { has: page.getByRole("heading", { name: "Structured Learning Paths" }) });
    const card = section.locator(".grid > div").first();
    await expect(card).toHaveClass(/bg-gray-50/);
    // Session-7 audit: the reference cards carry the transparent border +
    // hover:border-gray-100 pair (the session-3 borderless form has been
    // replaced on the live app).
    await expect(card).toHaveClass(/border border-transparent hover:border-gray-100/);
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

    // Session-7 reorder: the first catalog course is the WebDev bootcamp.
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Complete Web Development Bootcamp 2026");
    await expect(page.getByRole("button", { name: "Enroll Now" })).toBeVisible();
    await expect(page.getByText("$49.99").first()).toBeVisible();
    await expect(page.getByText("$149.99").first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Course Curriculum" })).toBeVisible();
    // Reference curriculum rows: "Lesson N: Module Content" (380 for the WebDev course)
    const lessons = page.getByText("Lesson 1: Module Content", { exact: true });
    await expect(lessons).toBeVisible();
    const lessonCount = await page.locator("main span.font-medium", { hasText: "Lesson " }).count();
    expect(lessonCount).toBeGreaterThanOrEqual(200);

    // What You'll Learn = tags + level
    await expect(page.getByRole("heading", { name: "What You'll Learn" })).toBeVisible();
    // WebDev bootcamp tag list (seed) + the sidebar level row
    for (const topic of ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "Beginner Level"]) {
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

test.describe("session-4 parity: page shells", () => {
  const SHELL_PAGES = [
    "/Courses",
    "/CourseDetail?id=seed-1",
    "/Dashboard",
    "/About",
    "/Contact",
    "/BecomeInstructor",
    "/AIAssistant",
  ];

  // The reference wraps every non-landing page the same way:
  // root > main.pt-20 > div.min-h-screen.bg-gray-50 > hero + content.
  // (The clone keeps min-h-dvh on the ROOT for mobile-viewport robustness.)
  for (const path of SHELL_PAGES) {
    test(`${path} uses the reference shell (main.pt-20 + gray wrapper)`, async ({ page }) => {
      await page.goto(path);
      const main = page.locator("main");
      await expect(main).toHaveClass(/(^|\s)pt-20(\s|$)/);
      const wrapper = page.locator("main > div.min-h-screen.bg-gray-50");
      await expect(wrapper).toBeVisible();
    });
  }

  test("courses hero clears the fixed navbar", async ({ page }) => {
    await page.goto("/Courses");
    // The h1 lives inside the Suspense-wrapped catalog — wait for it before measuring.
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const box = await h1.boundingBox();
    expect(box).not.toBeNull();
    // Reference: h1 top at y=144 (80px main padding + 64px hero padding);
    // the clone's old shell rendered it at y=64 — behind the 81px navbar.
    expect(box!.y).toBeGreaterThanOrEqual(100);
  });

  test("nav Home link targets /Home (reference href)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav a", { hasText: "Home" }).first()).toHaveAttribute("href", "/Home");
  });

  test("footer links match the reference targets", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Learning Paths" })).toHaveAttribute("href", "/Courses");
    await expect(footer.getByRole("link", { name: "Help Center" })).toHaveAttribute("href", "/Contact");
    await expect(footer.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/Contact");
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/About");
    await expect(footer.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/About");
  });
});

test.describe("session-4 parity: course detail About This Course", () => {
  test("ML course shows the expandable About This Course section", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-6");
    await expect(page.getByRole("heading", { name: "About This Course" })).toBeVisible();

    // Long description, clamped to 6 lines
    const desc = page.locator("p.line-clamp-6");
    await expect(desc).toContainText("Dive deep into the world of artificial intelligence");

    // Read More expands and removes the clamp
    const toggle = page.getByRole("button", { name: "Read More" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("button", { name: "Show Less" })).toBeVisible();
    await expect(page.locator("p.line-clamp-6")).toHaveCount(0);
  });

  test("courses without longDescription render no About This Course section (reference behavior)", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-2");
    await expect(page.getByRole("heading", { name: "About This Course" })).toHaveCount(0);
  });
});

test.describe("session-4 parity: AI assistant + contact shells", () => {
  test("AI chat card matches the reference (min-h 60vh, flex column, textarea)", async ({ page }) => {
    await page.goto("/AIAssistant");
    const card = page.locator("div[class*='min-h-[60vh]']");
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/flex flex-col/);

    // Messages area flexes with the card — the reference has no fixed height
    await expect(card.locator("> div").first()).toHaveClass(/flex-1/);

    // Composer is a textarea on the reference (auto-growing, max-h-32)
    const composer = page.locator("textarea");
    await expect(composer).toBeVisible();
    await expect(composer).toHaveAttribute("placeholder", "Ask a question...");

    // Hero icon is Sparkles inside the w-14 gradient box
    await expect(page.locator("svg.lucide-sparkles").first()).toBeVisible();
  });

  test("contact page uses the reference overlapping max-w-6xl container", async ({ page }) => {
    await page.goto("/Contact");
    await expect(page.locator("main .max-w-6xl.-mt-6")).toBeVisible();

    // Hero rhythm: pt-16 pb-12 (not py-20)
    const hero = page.locator("main > div > div").first();
    await expect(hero).toHaveClass(/pt-16/);
    await expect(hero).toHaveClass(/pb-12/);
  });
});

test.describe("session-4 parity: SEO files", () => {
  test("robots.txt allows everything and links the sitemap (reference behavior)", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    // Robots directives are case-insensitive; Next serializes "User-Agent".
    expect(body).toMatch(/user-agent: \*/i);
    expect(body).toMatch(/allow: \//i);
    expect(body).not.toMatch(/disallow/i);
    expect(body).toMatch(/sitemap: .+\/sitemap\.xml/i);
  });

  test("sitemap.xml lists the 9 reference routes with weekly changefreq", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    for (const route of [
      "/Courses",
      "/CourseDetail",
      "/AIAssistant",
      "/Pricing",
      "/BecomeInstructor",
      "/About",
      "/Contact",
      "/Dashboard",
    ]) {
      expect(body).toContain(`${route}<`);
    }
    expect(body.match(/<url>/g)?.length).toBe(9);
    expect(body.match(/<changefreq>weekly<\/changefreq>/g)?.length).toBe(9);
    // Landing is highest priority (serialized as 1 or 1.0 depending on Next version)
    expect(body).toMatch(/<priority>1(\.0)?<\/priority>/);
    expect(body).toMatch(/<priority>0\.8<\/priority>/);
  });
});

test.describe("404", () => {
  test("unknown route shows the reference 404 (light slate design)", async ({ page }) => {
    await page.goto("/ThisPageDoesNotExist");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();

    // The dynamic path appears in the message (quoted, no leading slash)
    await expect(page.getByText('"ThisPageDoesNotExist"')).toBeVisible();
    await expect(page.getByText("could not be found in this application")).toBeVisible();

    // Light slate shell — the reference 404 is not the dark cosmic gradient
    await expect(page.locator(".bg-slate-50")).toBeVisible();

    const goHome = page.getByRole("button", { name: "Go Home" });
    await expect(goHome).toBeVisible();
    await goHome.click();
    await expect(page).toHaveURL("/");
  });
});

// ---------------------------------------------------------------------------
// Session 5 — head/metadata parity, login state machine, newsletter,
// CourseDetail not-found, and residual class drift (BI/About/Pricing).
// Reference: docs/remediation-plan-session5.md
// ---------------------------------------------------------------------------

test.describe("session-5 parity: head metadata", () => {
  const REFERENCE_DESCRIPTION =
    "SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future.";

  test("every route ships the reference root description + OG/Twitter + canonical + icon + manifest", async ({ page }) => {
    for (const route of ["/", "/Courses", "/Pricing", "/login"]) {
      await page.goto(route);
      // The reference uses ONE description everywhere (no per-page overrides)
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBe(REFERENCE_DESCRIPTION);

      // OpenGraph + Twitter cards exist (landing carries the full set)
      expect(await page.locator('meta[property="og:title"]').count()).toBeGreaterThan(0);
      expect(await page.locator('meta[property="og:type"]').getAttribute("content")).toBe("website");
      expect(await page.locator('meta[property="og:site_name"]').getAttribute("content")).toBe("NexusLearn");
      expect(await page.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");

      // Per-route canonical resolves against the site origin (Next.js drops
      // the trailing slash on the root — accept both forms)
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBeTruthy();
      expect(new URL(canonical!).pathname).toBe(route);

      // Favicon + manifest are linked (the reference logo image)
      const icon = await page.locator('link[rel="icon"]').getAttribute("href");
      expect(icon).toContain("/logo.png");
      expect(await page.locator('link[rel="manifest"]').getAttribute("href")).toContain("manifest");
    }
  });

  test("manifest.json matches the reference fields", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.ok()).toBeTruthy();
    const manifest = (await res.json()) as Record<string, unknown>;
    expect(manifest.name).toBe("NexusLearn");
    expect(manifest.short_name).toBe("NexusLearn");
    expect(manifest.description).toBe(REFERENCE_DESCRIPTION);
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#000000");
    expect(manifest.background_color).toBe("#ffffff");
    const icons = manifest.icons as Array<{ src: string; sizes: string }>;
    expect(icons.map((i) => i.sizes).sort()).toEqual(["192x192", "512x512"]);
    expect(icons.every((i) => i.src.includes("/logo.png"))).toBe(true);
  });
});

test.describe("session-5 parity: login card shell", () => {
  test("divider renders OR via uppercase and the reference separator attributes", async ({ page }) => {
    await page.goto("/login");
    const label = page.locator("span", { hasText: "or" }).first();
    await expect(label).toHaveClass(/bg-white px-3/);
    // The wrapper applies text-transform (live displays "OR" from raw "or")
    await expect(page.locator("span.bg-white.px-3").locator("..")).toHaveClass(/uppercase/);
    // The rule is the shadcn Separator markup
    await expect(page.locator("div[role=none].shrink-0.h-\\[1px\\]")).toBeAttached();
  });

  test("Sign in is the reference slate button, not the gradient CTA", async ({ page }) => {
    await page.goto("/login");
    const signIn = page.locator('button[type="submit"]', { hasText: "Sign in" });
    await expect(signIn).toHaveClass(/bg-slate-900/);
    await expect(signIn).toHaveClass(/h-11 sm:h-12/);
    await expect(signIn).not.toHaveClass(/bg-gradient-to-r/);
  });

  test("login logo is the reference image with the slate glow", async ({ page }) => {
    await page.goto("/login");
    const img = page.locator('img[alt="NexusLearn logo"]');
    await expect(img).toBeVisible();
    expect(await img.getAttribute("src")).toContain("/logo.png");
    await expect(img.locator("..")).toHaveClass(/ring-4 ring-white\/50/);
    // The glow behind the logo is the subtle slate variant (not cyan/purple)
    await expect(page.locator(".from-slate-200.to-slate-300").first()).toBeAttached();
  });

  test("invalid credentials render the reference shadcn alert", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "WrongPassword1");
    await page.click('button[type="submit"]');
    const alert = page.locator("[role=alert]:not(#__next-route-announcer__)");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText("Invalid email or password");
    await expect(alert).toHaveClass(/bg-red-50\/70/);
    await expect(alert).toHaveClass(/border-red-200/);
    await expect(alert.locator("div")).toHaveClass(/text-red-700 text-sm/);
  });

  test("field labels carry the reference peer-disabled classes", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('label[for="email"]')).toHaveClass(
      /peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700/
    );
  });
});

test.describe("session-5 parity: forgot password flow", () => {
  test("reset view swaps in and submits to the check-your-email state", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();

    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(page.getByText("Enter your email and we'll send you a link to reset your password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to sign in" })).toBeVisible();

    await page.fill("#email", "parity@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText("parity@example.com")).toBeVisible();
    // The green reference alert
    const alert = page.locator("[role=alert]:not(#__next-route-announcer__)");
    await expect(alert).toHaveClass(/bg-green-50\/70/);
    await expect(alert.locator("div")).toHaveClass(/text-green-700 text-sm/);
    await expect(
      page.getByText("Please check your email for the password reset link. It may take a few minutes to arrive.")
    ).toBeVisible();

    // Back to sign in returns to the sign-in form
    await page.getByRole("button", { name: "Back to sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toBeVisible();
  });
});

test.describe("session-5 parity: signup + verify flow", () => {
  test("signup view validates, creates the account and verifies via the 6-digit code", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.locator('label[for="confirmPassword"]')).toHaveText("Confirm Password");

    // Client-side validation: mismatched passwords
    await page.fill("#email", `parity-${Date.now()}@example.com`);
    await page.fill("#password", "SuperSecret99!");
    await page.fill("#confirmPassword", "Different123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toHaveText("Passwords do not match");

    // Matching passwords -> verify-email state
    await page.fill("#confirmPassword", "SuperSecret99!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("We've sent a 6-digit code to")).toBeVisible();
    const codeInputs = page.locator('input[inputmode="numeric"]');
    await expect(codeInputs).toHaveCount(6);
    await expect(page.getByText("Didn't receive the code?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Resend" })).toBeVisible();

    // Enter the 6 digits (simulated delivery — any code verifies) -> signed in
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String((i + 1) % 10));
    }
    await page.getByRole("button", { name: "Verify email" }).click();
    await page.waitForURL("/");
    // Signed in: the API returns the session user
    const me = await page.request.get("/api/auth/me");
    expect((await me.json()).user?.email).toContain("@example.com");
  });

  test("duplicate signup email shows the reference error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "SomePassword1!");
    await page.fill("#confirmPassword", "SomePassword1!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toHaveText("A user with this email already exists");
  });
});

test.describe("session-5 parity: course detail not-found state", () => {
  test("unknown id renders the in-page state, not the 404", async ({ page }) => {
    await page.goto("/CourseDetail?id=does-not-exist");
    await expect(page.getByText("Course not found")).toBeVisible();
    const browse = page.getByRole("main").getByRole("link", { name: "Browse Courses" });
    await expect(browse).toBeVisible();
    await expect(browse).toHaveAttribute("href", "/Courses");
    // It lives inside the reference gray wrapper shell
    await expect(page.locator("main.pt-20 .bg-gray-50")).toBeVisible();
    // And it is NOT the 404 page
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toHaveCount(0);
    await browse.click();
    await expect(page).toHaveURL("/Courses");
  });

  test("missing id renders the same in-page state", async ({ page }) => {
    await page.goto("/CourseDetail");
    await expect(page.getByText("Course not found")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toHaveCount(0);
  });
});

test.describe("session-5 parity: cards + nav + newsletter", () => {
  test("EQ course card eyebrow shows the reference short label", async ({ page }) => {
    await page.goto("/Courses");
    const eyebrows = page.locator("a[href*='CourseDetail'] p.text-purple-600");
    // EQ (Emotional Intelligence & Mindfulness) is the 5th card in the
    // reference display order (session-7 reorder).
    await expect(eyebrows.nth(4)).toHaveText("Personal Dev");
    // The filter still offers the full category name
    await expect(page.getByRole("combobox").first()).toContainText("All Categories");
  });

  test("Home nav link is active on the landing page (desktop + mobile)", async ({ page }) => {
    await page.goto("/");
    const home = page.locator("nav a", { hasText: "Home" }).first();
    // The active variant ends with the purple token pair (inactive ends with
    // text-white/80 over the hero) — hover:bg-purple-50 alone must NOT match.
    await expect(home).toHaveClass(/ text-purple-600 bg-purple-50$/);
  });

  test("newsletter subscribes in place with the reference success state", async ({ page }) => {
    await page.goto("/");
    const email = page.locator('input[aria-label="Enter your email"]');
    await email.scrollIntoViewIfNeeded();
    await email.fill(`news-${Date.now()}@example.com`);
    await page.getByRole("button", { name: "Subscribe" }).click();

    // No navigation to the JSON response — the success state renders in place
    await expect(page.getByText("You're subscribed! Welcome aboard.")).toBeVisible();
    await expect(page.locator(".text-green-400 .lucide-circle-check-big, .text-green-400 svg")).toBeVisible();
    expect(page.url()).not.toContain("/api/newsletter");
  });
});

test.describe("session-5 parity: residual class drift", () => {
  test("pricing FAQ answers use the reference ml-7 gray-600 paragraph", async ({ page }) => {
    await page.goto("/Pricing");
    // The FAQ section (second section) items are bg-gray-50 rounded-2xl cards
    const answers = page
      .locator("main section")
      .nth(1)
      .locator("div.bg-gray-50.rounded-2xl")
      .locator("p");
    await expect(answers.first()).toHaveClass(/mt-3 text-gray-600 leading-relaxed ml-7/);
  });

  test("about hero h1 uses the text-3xl base (reference)", async ({ page }) => {
    await page.goto("/About");
    await expect(page.locator("h1")).toHaveClass(/text-3xl md:text-5xl/);
  });

  test("become-instructor sections match the reference structure", async ({ page }) => {
    await page.goto("/BecomeInstructor");
    // Section h2s are direct children of the max-w container at md:text-4xl
    const h2s = page.locator("main section h2");
    await expect(h2s.first()).toHaveClass(/text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16/);
    // Benefits cards are left-aligned with the border hover (no lift/shadow)
    const card = page.locator("main section").nth(1).locator("div.bg-white.rounded-2xl").first();
    await expect(card).toHaveClass(/hover:border-gray-200/);
    await expect(card).not.toHaveClass(/text-center/);
    // CTA section: h2 is a direct child (no inner max-w wrapper)
    const cta = page.locator("main section").nth(2);
    await expect(cta.locator("> h2")).toBeVisible();
    await expect(cta.locator("> div")).toHaveCount(0);
  });
});

test.describe("session-6 parity: course detail level row + enroll button", () => {
  test("What You'll Learn card ends with the reference level row (Award icon + level)", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-3");
    const card = page.locator("main .sticky.top-24");
    // The divider section under the tag checklist
    const divider = card.locator("div.mt-6.pt-6.border-t.border-gray-100");
    await expect(divider).toBeVisible();
    const row = divider.locator("div.flex.items-center.gap-2");
    await expect(row.locator("svg.lucide-award")).toHaveClass(/h-5 w-5 text-amber-500/);
    await expect(row.locator("span")).toHaveClass(/text-sm font-medium text-gray-700/);
    await expect(row.locator("span")).toHaveText("Intermediate Level");
  });

  test("level row reflects the course level (Beginner on the EQ course)", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-9");
    const row = page.locator("main .sticky.top-24 div.mt-6.pt-6.border-t span");
    await expect(row).toHaveText("Beginner Level");
  });

  test("Enroll Now button carries the reference shadcn base classes", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const btn = page.getByRole("button", { name: "Enroll Now" });
    await expect(btn).toHaveClass(/\[&_svg\]:size-4/);
    await expect(btn).toHaveClass(/hover:bg-primary\/90/);
    await expect(btn).not.toHaveClass(/disabled:opacity-60/);
  });
});

test.describe("session-6 parity: per-route OG identity", () => {
  test("og:title + twitter:title mirror the per-route document title", async ({ page }) => {
    const cases: Array<[string, string]> = [
      ["/Courses", "Courses | NexusLearn"],
      ["/Dashboard", "Dashboard | NexusLearn"],
      ["/Pricing", "Pricing | NexusLearn"],
      ["/About", "About | NexusLearn"],
      ["/Contact", "Contact | NexusLearn"],
      ["/BecomeInstructor", "Become Instructor | NexusLearn"],
      ["/AIAssistant", "AI Assistant | NexusLearn"],
    ];
    for (const [route, title] of cases) {
      await page.goto(route);
      expect(await page.title()).toBe(title);
      expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toBe(title);
      expect(await page.locator('meta[name="twitter:title"]').getAttribute("content")).toBe(title);
    }
  });

  test("og:url mirrors the per-route canonical", async ({ page }) => {
    for (const route of ["/Courses", "/Pricing", "/login"]) {
      await page.goto(route);
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
      expect(ogUrl).toBeTruthy();
      expect(new URL(ogUrl!).pathname).toBe(route);
    }
  });

  test("CourseDetail og identity carries the query string (reference behavior)", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    expect(await page.title()).toBe("Course Detail | NexusLearn");
    expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toBe("Course Detail | NexusLearn");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(new URL(ogUrl!).search).toBe("?id=seed-1");
  });

  test("root + login keep the plain NexusLearn OG title (reference behavior)", async ({ page }) => {
    for (const route of ["/", "/login"]) {
      await page.goto(route);
      expect(await page.title()).toBe("NexusLearn");
      expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toBe("NexusLearn");
    }
  });

  test("per-route OG cards keep the full root payload (description, site, image)", async ({ page }) => {
    await page.goto("/Courses");
    expect(await page.locator('meta[property="og:description"]').getAttribute("content")).toContain("SkillSphere");
    expect(await page.locator('meta[property="og:site_name"]').getAttribute("content")).toBe("NexusLearn");
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("/logo.png");
    expect(await page.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");
  });
});

test.describe("session-6 parity: pricing overlap + courses hero", () => {
  test("pricing cards section uses the reference -mt-8 overlap wrapper", async ({ page }) => {
    await page.goto("/Pricing");
    const wrapper = page.locator("main .min-h-screen > div.-mt-8");
    await expect(wrapper).toHaveCount(1);
    const inner = wrapper.locator("> section");
    await expect(inner).toHaveClass(/py-24 px-4 bg-gray-50/);
  });

  test("courses hero search input is the reference h-9 text input", async ({ page }) => {
    await page.goto("/Courses");
    const input = page.locator("main input").first();
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveClass(/\bh-9\b/);
    await expect(input).toHaveClass(/\bw-full\b/);
    await expect(input).toHaveClass(/file:text-foreground/);
  });

  test("courses catalog renders hero + content as the gray wrapper's direct children", async ({ page }) => {
    await page.goto("/Courses");
    // Wait out the Suspense fallback so the catalog (client island) has
    // rendered before asserting structure.
    await expect(page.getByRole("heading", { name: "Explore Our Courses" })).toBeVisible();
    await expect(page.locator("main .grid").first()).toBeVisible();
    const wrapper = page.locator("main .min-h-screen");
    // hero + content exactly — no intermediate classless component div
    expect(await wrapper.locator("> div").count()).toBe(2);
    expect(await wrapper.locator("> div:not([class])").count()).toBe(0);
    // The hero is the gradient element; the content is the floating -mt-6 area
    await expect(wrapper.locator("> div").first()).toHaveClass(/pt-16 pb-20 px-4/);
    await expect(wrapper.locator("> div").nth(1)).toHaveClass(/max-w-7xl mx-auto px-4 -mt-6/);
  });
});

test.describe("session-6 parity: landing + AI assistant drift", () => {
  test("landing hero pins the viewport height (min-h 100vh)", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("main > div > div").first();
    await expect(hero).toHaveClass(/min-h-\[100vh\]/);
  });

  test("landing sections render inside the reference classless main wrapper", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    // main's single child is the classless wrapper holding hero + 8 sections
    expect(await main.locator("> div").count()).toBe(1);
    expect(await main.locator("> section").count()).toBe(0);
    const wrapper = main.locator("> div");
    expect(await wrapper.locator("> div, > section").count()).toBe(9);
  });

  test("landing grids keep the reference column bases (featured, paths, testimonials)", async ({ page }) => {
    await page.goto("/");
    const grids = page.locator("main .grid");
    // Featured courses grid carries the grid-cols-1 base
    await expect(grids.nth(1)).toHaveClass(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8/);
    // Learning paths switch at lg (reference), not md
    await expect(grids.nth(2)).toHaveClass(/grid grid-cols-1 lg:grid-cols-3 gap-8/);
    // Testimonials grid carries the grid-cols-1 base
    await expect(grids.nth(6)).toHaveClass(/grid grid-cols-1 md:grid-cols-3 gap-8/);
  });

  test("AI welcome bubble uses the reference py-16 padding", async ({ page }) => {
    await page.goto("/AIAssistant");
    const bubble = page.locator("main .space-y-6 > div").first();
    await expect(bubble).toHaveClass(/py-16/);
    await expect(bubble).not.toHaveClass(/py-12/);
  });

  test("AI chat card matches the reference class string (no overflow-hidden)", async ({ page }) => {
    await page.goto("/AIAssistant");
    const card = page.locator("main div.min-h-\\[60vh\\]").first();
    await expect(card).toHaveClass(/min-h-\[60vh\] flex flex-col$/);
  });

  test("course card level badge carries the reference variant classes", async ({ page }) => {
    await page.goto("/Courses");
    const badge = page.locator("main .grid a").first().locator("span[data-slot='badge'], .absolute.top-3").first();
    await expect(badge).toHaveClass(/hover:bg-primary\/80/);
    await expect(badge).toHaveClass(/\bborder-0\b/);
  });
});

// ---------------------------------------------------------------------------
// Session 7 — parity pass: display order, category icons, featured header,
// testimonials redesign, button bases, filter card, form controls, hero sizes.
// Audit: docs/remediation-plan-session7.md (live re-audit, agent-browser).
// ---------------------------------------------------------------------------
test.describe("session-7 parity: reference display order", () => {
  test("catalog lists courses in the reference 'Newest' order", async ({ page }) => {
    await page.goto("/Courses");
    await page.waitForSelector("main .grid a");
    const titles = page.locator("main .grid a h3");
    expect(await titles.count()).toBe(9);
    expect(await titles.first().textContent()).toBe("Complete Web Development Bootcamp 2026");
    const order = await titles.allTextContents();
    expect(order).toEqual([
      "Complete Web Development Bootcamp 2026",
      "Data Science with Python & SQL",
      "Cloud Computing with AWS",
      "Business Strategy & Leadership",
      "Emotional Intelligence & Mindfulness",
      "Machine Learning & AI Masterclass",
      "UI/UX Design Professional Certificate",
      "Advanced Python Programming",
      "Digital Marketing Strategy A-Z",
    ]);
  });

  test("landing featured grid follows the reference featured subsequence", async ({ page }) => {
    await page.goto("/");
    const featured = page.locator("main section").nth(1); // Featured Courses
    const titles = featured.locator(".grid a h3");
    expect(await titles.allTextContents()).toEqual([
      "Complete Web Development Bootcamp 2026",
      "Business Strategy & Leadership",
      "Machine Learning & AI Masterclass",
      "UI/UX Design Professional Certificate",
      "Advanced Python Programming",
      "Digital Marketing Strategy A-Z",
    ]);
  });
});

test.describe("session-7 parity: category grid", () => {
  test("category icons carry the reference dead-gradient classes (not text colors)", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section").first(); // Browse by Category
    const icons = section.locator("div.grid a svg");
    expect(await icons.count()).toBe(7);
    // The reference ships bg-gradient + bg-clip-text classes (rendered near-black)
    await expect(icons.first()).toHaveClass(/bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text/);
    await expect(icons.nth(1)).toHaveClass(/from-cyan-500 to-cyan-600/);
    await expect(icons.nth(2)).toHaveClass(/from-pink-500 to-pink-600/);
    await expect(icons.nth(3)).toHaveClass(/from-purple-500 to-purple-600/);
    await expect(icons.nth(4)).toHaveClass(/from-rose-500 to-rose-600/);
    await expect(icons.nth(5)).toHaveClass(/from-emerald-500 to-emerald-600/);
    await expect(icons.nth(6)).toHaveClass(/from-violet-500 to-violet-600/);
    for (let i = 0; i < 7; i++) {
      await expect(icons.nth(i)).not.toHaveClass(/text-blue-600|text-cyan-600|text-orange-600/);
    }
  });

  test("Technology category uses the reference monitor icon", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section").first();
    await expect(section.locator("svg.lucide-monitor")).toHaveCount(1);
    await expect(section.locator("svg.lucide-cpu")).toHaveCount(0);
  });

  test("category tint wrappers use the reference palette", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section").first();
    await expect(section.locator("div.bg-pink-500\\/10")).toHaveCount(1);
    await expect(section.locator("div.bg-rose-500\\/10")).toHaveCount(1);
    await expect(section.locator("div.bg-emerald-500\\/10")).toHaveCount(1);
    await expect(section.locator("div.bg-violet-500\\/10")).toHaveCount(1);
  });

  test("category hover overlay has no rounded-2xl (reference class string)", async ({ page }) => {
    await page.goto("/");
    const overlay = page.locator("main section").first().locator("div.absolute.inset-0.bg-gradient-to-br").first();
    await expect(overlay).not.toHaveClass(/rounded-2xl/);
  });
});

test.describe("session-7 parity: featured header + learning paths + testimonials", () => {
  test("featured section header is the reference flex row with the in-header CTA", async ({ page }) => {
    await page.goto("/");
    const featured = page.locator("main section").nth(1);
    const container = featured.locator("div.max-w-7xl");
    // Header row + grid only — no below-grid button row
    expect(await container.locator("> div, > a").count()).toBe(2);
    const header = container.locator("> div.flex.flex-col");
    await expect(header).toHaveClass(/flex flex-col md:flex-row md:items-end md:justify-between mb-16/);
    // Left-aligned title block (subtitle max-w-xl, not the centered max-w-2xl)
    await expect(header.locator("p.mt-4.text-lg.text-gray-500.max-w-xl")).toHaveCount(1);
    // The outline button lives in the header (a.mt-6.md:mt-0), not below the grid
    const cta = header.locator("a.mt-6");
    await expect(cta).toHaveCount(1);
    const btn = cta.locator("button");
    await expect(btn).toHaveClass(/border-gray-300/);
    await expect(btn).toHaveClass(/hover:border-purple-500/);
    await expect(btn).toHaveClass(/\[&_svg\]:size-4/);
    await expect(featured.locator("div.text-center.mt-12")).toHaveCount(0);
  });

  test("learning path cards match the reference borders + per-path icons", async ({ page }) => {
    await page.goto("/");
    const paths = page.locator("main section").nth(2); // Structured Learning Paths
    const cards = paths.locator("div.grid > div");
    expect(await cards.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toHaveClass(/border border-transparent hover:border-gray-100/);
    }
    await expect(paths.locator("svg.lucide-trending-up")).toHaveCount(1);
    await expect(paths.locator("svg.lucide-target")).toHaveCount(1);
    await expect(paths.locator("div.inline-flex.p-3.bg-gradient-to-r.from-amber-500.to-orange-600")).toHaveCount(1);
  });

  test("testimonial cards use the reference design (rounded-3xl gray, h-10 quote)", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section").nth(5); // What Our Students Say
    const cards = section.locator("div.grid > div");
    expect(await cards.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toHaveClass(/relative bg-gray-50 rounded-3xl p-8/);
      await expect(cards.nth(i)).toHaveClass(/hover:shadow-xl/);
      await expect(cards.nth(i)).toHaveClass(/border border-transparent hover:border-gray-100/);
    }
    await expect(section.locator("svg.lucide-quote.h-10")).toHaveCount(3);
    await expect(section.locator("svg.lucide-quote.h-8")).toHaveCount(0);
    // Avatar row: no divider, name text-sm, role text-xs
    const first = cards.first();
    await expect(first.locator("div.flex.items-center.gap-3")).toHaveCount(1);
    await expect(first.locator("div.flex.items-center.gap-3.pt-6")).toHaveCount(0);
    await expect(first.locator("p.font-semibold.text-gray-900.text-sm")).toHaveCount(1);
    await expect(first.locator("p.text-xs.text-gray-500")).toHaveCount(1);
  });

  test("testimonials follow the reference order (Sarah, Elena, Marcus)", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("main section").nth(5);
    const names = section.locator("div.grid > div p.font-semibold");
    expect(await names.allTextContents()).toEqual(["Sarah Chen", "Elena Rodriguez", "Marcus Johnson"]);
    // Elena's avatar is the reference photo
    const elenaAvatar = section.locator("div.grid > div").nth(1).locator("img");
    await expect(elenaAvatar).toHaveAttribute(
      "src",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
    );
  });
});

test.describe("session-7 parity: landing button bases", () => {
  test("hero buttons carry the reference shadcn base", async ({ page }) => {
    await page.goto("/");
    const browse = page.getByRole("button", { name: "Browse Courses" });
    await expect(browse).toHaveClass(/\[&_svg\]:pointer-events-none/);
    await expect(browse).toHaveClass(/\[&_svg\]:size-4/);
    await expect(browse).toHaveClass(/hover:bg-primary\/90/);
    await expect(browse).toHaveClass(/disabled:opacity-50/);
    const start = page.getByRole("button", { name: "Start Learning" });
    await expect(start).toHaveClass(/\[&_svg\]:size-4/);
    await expect(start).toHaveClass(/disabled:opacity-50/);
  });

  test("section CTA buttons carry the reference base (AI, instructor, pricing, paths)", async ({ page }) => {
    await page.goto("/");
    const ai = page.getByRole("button", { name: "Try AI Assistant" });
    await expect(ai).toHaveClass(/hover:bg-primary\/90/);
    await expect(ai).toHaveClass(/\[&_svg\]:size-4/);
    const teach = page.getByRole("button", { name: "Start Teaching Today" });
    await expect(teach).toHaveClass(/hover:bg-primary\/90/);
    await expect(teach).toHaveClass(/disabled:opacity-50/);
    const startPro = page.getByRole("button", { name: "Start Pro Trial" });
    await expect(startPro).toHaveClass(/hover:bg-primary\/90/);
    await expect(startPro).toHaveClass(/\[&_svg\]:size-4/);
    const getStarted = page.getByRole("button", { name: "Get Started" });
    await expect(getStarted).toHaveClass(/disabled:opacity-50/);
    await expect(getStarted).toHaveClass(/\[&_svg\]:size-4/);
    const path = page.getByRole("button", { name: "Start This Path" }).first();
    await expect(path).toHaveClass(/\[&_svg\]:size-4/);
    await expect(path).toHaveClass(/disabled:opacity-50/);
  });
});

test.describe("session-7 parity: courses filter card + badge", () => {
  test("filter card leads with the sliders icon and uses the old-style triggers", async ({ page }) => {
    await page.goto("/Courses");
    await page.waitForSelector("main .grid a");
    const card = page.locator("main div.bg-white.rounded-2xl.shadow-lg");
    await expect(card.locator("svg.lucide-sliders-horizontal")).toHaveCount(1);
    await expect(card.locator("svg.lucide-sliders-horizontal")).toHaveClass(/h-5 w-5 text-gray-400 hidden sm:block/);
    const triggers = card.locator("button");
    expect(await triggers.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      await expect(triggers.nth(i)).toHaveClass(/ring-offset-background/);
      await expect(triggers.nth(i)).toHaveClass(/\[&>span\]:line-clamp-1/);
      await expect(triggers.nth(i)).not.toHaveClass(/data-\[slot=select-value\]/);
    }
    await expect(card.locator("svg.lucide-chevron-down.h-4")).toHaveCount(3);
  });

  test("level badge renders as the reference DIV with emerald Beginner", async ({ page }) => {
    await page.goto("/Courses");
    await page.waitForSelector("main .grid a");
    const first = page.locator("main .grid a").first(); // WebDev — Beginner
    const badge = first.locator("div.inline-flex.items-center.rounded-md.px-2\\.5");
    await expect(badge).toHaveCount(1);
    await expect(badge).toHaveClass(/bg-emerald-100 text-emerald-700/);
    await expect(badge).toHaveClass(/hover:bg-primary\/80 absolute top-3 left-3/);
    await expect(first.locator("span[data-slot='badge']")).toHaveCount(0);
  });
});

test.describe("session-7 parity: route-level fixes", () => {
  test("CourseDetail lessons stat uses the circle-play icon", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const statRow = page.locator("main span.flex.items-center.gap-2", { hasText: "380 lessons" });
    await expect(statRow.locator("svg.lucide-circle-play")).toHaveCount(1);
    await expect(statRow.locator("svg.lucide-book-open")).toHaveCount(0);
  });

  test("Pricing FAQ icon is the reference circle-help and the hero h1 base is text-3xl", async ({ page }) => {
    await page.goto("/Pricing");
    await expect(page.locator("svg[class*='lucide-circle-help']")).toHaveCount(4);
    await expect(page.locator("svg[class*='lucide-circle-question-mark']")).toHaveCount(0);
    await expect(page.locator("main h1")).toHaveClass(/^text-3xl md:text-5xl/);
  });

  test("Contact form controls match the reference (labels, textarea, send button)", async ({ page }) => {
    await page.goto("/Contact");
    const form = page.locator("main form");
    await expect(form.locator("label").first()).toHaveClass(
      /text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 font-medium/
    );
    await expect(form.locator("textarea")).toHaveClass(/min-h-\[60px\]/);
    const send = form.getByRole("button", { name: "Send Message" });
    await expect(send).toHaveClass(/px-8 py-6/);
    await expect(send).toHaveClass(/hover:scale-105/);
    await expect(send).toHaveClass(/hover:bg-primary\/90/);
    await expect(send.locator("svg.lucide-send")).toHaveCount(1);
    await expect(send.locator("svg.lucide-send")).toHaveClass(/ml-2 h-4 w-4/);
    // Info card anchors: no text-sm on the value links
    const email = page.locator("main a[href='mailto:hello@nexuslearn.com']");
    await expect(email).toHaveClass(/^text-gray-500 hover:text-purple-600 transition-colors$/);
  });

  test("Contact hero h1 base is text-3xl", async ({ page }) => {
    await page.goto("/Contact");
    await expect(page.locator("main h1")).toHaveClass(/^text-3xl md:text-5xl/);
  });

  test("About stats grid is bare inside the max-w-7xl wrapper with font-medium labels", async ({ page }) => {
    await page.goto("/About");
    const grid = page.locator("main div.grid.grid-cols-2");
    await expect(grid).toHaveClass(/^grid grid-cols-2 md:grid-cols-4 gap-8$/);
    await expect(grid.locator("..")).toHaveClass(/max-w-7xl mx-auto/);
    await expect(grid.locator("p.mt-2.text-gray-500.font-medium").first()).toBeVisible();
    await expect(grid.locator("p.mt-2.text-sm.text-gray-500")).toHaveCount(0);
  });

  test("BecomeInstructor hero matches the reference (h1, gradient, video icon)", async ({ page }) => {
    await page.goto("/BecomeInstructor");
    const h1 = page.locator("main h1");
    await expect(h1).toHaveClass(/^text-3xl md:text-5xl/);
    await expect(h1.locator("span.bg-gradient-to-r")).toHaveClass(/from-cyan-400 to-purple-500/);
    await expect(h1.locator("span.bg-gradient-to-r")).not.toHaveClass(/via-purple-500/);
    await expect(page.locator("main svg.lucide-video")).toHaveCount(1);
    await expect(page.locator("main svg.lucide-clapperboard")).toHaveCount(0);
    const subtitle = page.locator("main p.mt-6.text-lg.text-gray-400").first();
    await expect(subtitle).not.toHaveClass(/leading-relaxed/);
    const benefitH3 = page.locator("main h3.font-bold.text-gray-900.text-lg").first();
    await expect(benefitH3).toBeVisible();
  });

  test("AIAssistant send button + icon match the reference", async ({ page }) => {
    await page.goto("/AIAssistant");
    const send = page.locator("main form button[type='submit'], main button[aria-label='Send message']");
    await expect(send).toHaveClass(/hover:bg-primary\/90/);
    await expect(send).toHaveClass(/\[&_svg\]:size-4/);
    await expect(send).not.toHaveClass(/disabled:hover:scale-100/);
    await expect(send.locator("svg.lucide-send")).toHaveClass(/h-5 w-5$/);
  });

  test("login Google icon is wrapped in the reference -ml-4 div", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: "Continue with Google" });
    const wrapper = btn.locator("div.-ml-4");
    await expect(wrapper).toHaveCount(1);
    await expect(wrapper).toHaveClass(/transition-transform duration-200/);
    await expect(wrapper.locator("svg")).toHaveClass(/^h-5 w-5$/);
  });
});
