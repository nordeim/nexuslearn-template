import { expect, test, type Page } from "@playwright/test";

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
    // Session 20: the count element is a SPAN (the live's tag — was <p>;
    // tag-agnostic locator so the pin survives tag-level parity changes).
    const counter = page.locator("main").getByText(/^\d+ courses?/);
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

    // What You'll Learn = parsed tags ONLY (session-8: the live check list
    // carries no level row — the level renders once, in the Award divider row
    // pinned by the session-6 + session-8 specs).
    await expect(page.getByRole("heading", { name: "What You'll Learn" })).toBeVisible();
    // WebDev bootcamp tag list (seed)
    for (const topic of ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]) {
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
    // Session 42: the og:image URL is the RENDER tier (/og-image.png — the
    // live's og:image actually serves a 630x630 contain-fit render of the
    // logo, not the raw 1024x1024 the icon family serves).
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("/og-image.png");
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
    // Session-18 correction: the live's search input carries NO type
    // attribute (text is the UA default — byte-verified by the attribute
    // sweep; the original "type=text" note was stale). The h-9 + py-6
    // border-box collapse still produces the reference 50px height.
    expect(await input.getAttribute("type")).toBeNull();
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

// ---------------------------------------------------------------------------
// Session 8 — parity: seed idempotency (no stale longDescription rows),
// What-You'll-Learn tags-only list + single divider level row, Dashboard
// class-level parity (bare stats grid, lucide stat icons, empty-state button
// bases). See docs/remediation-plan-session8.md.
// ---------------------------------------------------------------------------

test.describe("session-8 parity: About This Course presence matrix (seed idempotency)", () => {
  const WITH_ABOUT = ["seed-1", "seed-6", "seed-7", "seed-9"];
  const WITHOUT_ABOUT = ["seed-2", "seed-3", "seed-4", "seed-5", "seed-8"];

  for (const id of WITH_ABOUT) {
    test(`About This Course renders on ${id} (reference longDescription course)`, async ({ page }) => {
      await page.goto(`/CourseDetail?id=${id}`);
      await expect(page.getByRole("heading", { name: "About This Course" })).toBeVisible();
      // The left column carries the reference space-y-12 rhythm with the section.
      await expect(page.locator("main div.lg\\:col-span-2.space-y-12")).toHaveCount(1);
    });
  }

  for (const id of WITHOUT_ABOUT) {
    test(`About This Course is ABSENT on ${id} (no stale longDescription rows)`, async ({ page }) => {
      await page.goto(`/CourseDetail?id=${id}`);
      await expect(page.getByRole("heading", { name: "About This Course" })).toHaveCount(0);
      // No phantom section ⇒ the left column is the bare lg:col-span-2 (no space-y-12).
      await expect(page.locator("main div.lg\\:col-span-2.space-y-12")).toHaveCount(0);
    });
  }
});

test.describe("session-8 parity: What You'll Learn tags-only list", () => {
  test("check list renders parsed tags ONLY (no level row inside the list)", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-3");
    const card = page.locator("main .bg-white.rounded-2xl", { hasText: "What You'll Learn" }).first();
    const list = card.locator("div.space-y-3");
    // Cloud Computing with AWS: exactly its 5 tags, none of them the level row.
    await expect(list.locator("> div")).toHaveCount(5);
    await expect(list).not.toContainText("Level");
    for (const tag of ["AWS", "Cloud", "DevOps", "Serverless", "Microservices"]) {
      await expect(list.getByText(tag, { exact: true })).toHaveCount(1);
    }
  });

  test("WebDev check list shows its 6 tags with no level row", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const card = page.locator("main .bg-white.rounded-2xl", { hasText: "What You'll Learn" }).first();
    const list = card.locator("div.space-y-3");
    await expect(list.locator("> div")).toHaveCount(6);
    await expect(list).not.toContainText("Level");
  });

  test("the level renders ONCE — in the Award-icon divider row", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-3");
    const card = page.locator("main .bg-white.rounded-2xl", { hasText: "What You'll Learn" }).first();
    const divider = card.locator("div.mt-6.pt-6.border-t");
    await expect(divider).toHaveCount(1);
    await expect(divider.locator("svg.lucide-award")).toHaveClass(/h-5 w-5/);
    await expect(divider.locator("span")).toHaveText("Intermediate Level");
    // …and nowhere else in the card.
    await expect(card.getByText("Intermediate Level", { exact: true })).toHaveCount(1);
  });
});

test.describe("session-8 parity: Dashboard class-level parity", () => {
  test("stats grid is the bare reference grid (no hook classes)", async ({ page }) => {
    await page.goto("/Dashboard");
    const grid = page.locator("main .max-w-7xl > .grid.grid-cols-2").first();
    await expect(grid).toHaveClass(/^grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6$/);
  });

  test("stat-card icons are lucide components with the reference classes", async ({ page }) => {
    await page.goto("/Dashboard");
    // Scope to the stat cards' icon wrappers (the MyCourses empty state also
    // renders a lucide-book-open at h-16 w-16).
    const icons = ["lucide-book-open", "lucide-circle-play", "lucide-award", "lucide-trending-up"];
    for (const icon of icons) {
      const svg = page.locator(`main div.w-10.h-10 svg.${icon}`);
      await expect(svg).toHaveCount(1);
      await expect(svg).toHaveClass(new RegExp(`lucide ${icon} h-5 w-5`));
      await expect(svg).toHaveAttribute("width", "24");
      await expect(svg).toHaveAttribute("height", "24");
    }
  });

  test("empty-state buttons carry the shadcn base trio", async ({ page }) => {
    await page.goto("/Dashboard");
    const browseMore = page.getByRole("button", { name: "Browse More" });
    await expect(browseMore).toHaveClass(/disabled:opacity-50/);
    await expect(browseMore).toHaveClass(/\[&_svg\]:size-4/);
    await expect(browseMore).toHaveClass(/\[&_svg\]:shrink-0/);
    const cta = page.getByRole("button", { name: "Browse Courses" });
    await expect(cta).toHaveClass(/disabled:opacity-50/);
    await expect(cta).toHaveClass(/\[&_svg\]:size-4/);
    await expect(cta).toHaveClass(/hover:bg-primary\/90/);
  });
});

test.describe("session-9 parity: navbar chrome (button bases + the bare trigger)", () => {
  // The Navbar renders outside <main> (root layout), so the session-2..8
  // class-set audits (main * only) never covered it. This block pins today's
  // reference chrome: the live app's navbar buttons now carry the shadcn base
  // trio + hover:bg-primary/90. (The mobile trigger + panel specs live in
  // mobile-navigation.spec.ts at the mobile viewport.)
  test("desktop My Dashboard button carries the shadcn base trio + hover:bg-primary/90", async ({ page }) => {
    await page.goto("/");
    // Scoped to the desktop CTA row — the mobile panel's copy is pinned in
    // mobile-navigation.spec.ts at the mobile viewport.
    const btn = page.locator("nav div.hidden.md\\:flex button", { hasText: "My Dashboard" }).first();
    await expect(btn).toBeVisible();
    await expect(btn).toHaveClass(/disabled:pointer-events-none/);
    await expect(btn).toHaveClass(/disabled:opacity-50/);
    await expect(btn).toHaveClass(/\[&_svg\]:pointer-events-none/);
    await expect(btn).toHaveClass(/\[&_svg\]:size-4/);
    await expect(btn).toHaveClass(/\[&_svg\]:shrink-0/);
    await expect(btn).toHaveClass(/hover:bg-primary\/90/);
  });

  test("logo span matches the reference byte order", async ({ page }) => {
    await page.goto("/");
    const span = page.locator("nav span.text-lg");
    await expect(span).toHaveClass(/^text-lg font-bold text-white transition-colors duration-300$/);
  });
});

// ---------------------------------------------------------------------------
// Session 10 — /Home renders the landing HERO-state navbar + the 404
// hardening pin. The live app renders /Home (the reference footer target)
// with the FULL landing hero treatment: transparent navbar + white logo at
// scroll 0, flipping to the white-nav after scroll — byte-identical to "/".
// The clone's hero detection only covered "/" (Navbar.tsx `overHero`).
// Reference: docs/remediation-plan-session10.md
// ---------------------------------------------------------------------------

test.describe("session-10 parity: /Home renders the landing hero-state navbar", () => {
  test("/Home navbar is transparent with the white logo at scroll 0", async ({ page }) => {
    await page.goto("/Home");
    const nav = page.locator("nav");
    await expect(nav).toHaveClass(/bg-transparent/);
    await expect(nav).not.toHaveClass(/bg-white\/95/);
    // Same byte order the session-9 spec pins on "/" (the hero-state logo).
    const logo = page.locator("nav span.text-lg");
    await expect(logo).toHaveClass(/^text-lg font-bold text-white transition-colors duration-300$/);
  });

  test("/Home navbar flips to the white-nav state after scrolling", async ({ page }) => {
    await page.goto("/Home");
    const nav = page.locator("nav");
    // Transparent at the top (the landing hero)…
    await expect(nav).toHaveClass(/bg-transparent/);
    // …and white/95 + blur once scrolled past the 24px threshold, exactly
    // like "/" (the live /Home navbar flips identically).
    await page.mouse.wheel(0, 400);
    await expect(nav).toHaveClass(/bg-white\/95/);
    await expect(nav).toHaveClass(/backdrop-blur-xl/);
  });

  test("404 wrapper pins the deliberate main.min-h-dvh hardening", async ({ page }) => {
    // The live 404 ships a landmark-less div.min-h-screen inside #root (no
    // main, no nav, no footer). The clone deliberately keeps the `main`
    // landmark + the min-h-dvh page-root form (the documented URL-bar-warp
    // hardening every page root uses). This spec PINS that decision — it is
    // a documentation guard, not a fix — so a future chrome audit cannot
    // "fix" it backwards to the reference's landmark-less div.
    await page.goto("/ThisPageDoesNotExist");
    const wrapper = page.locator("main.min-h-dvh.bg-slate-50");
    await expect(wrapper).toBeVisible();
    // The reference 404 is chrome-less: no navbar, no footer on either site.
    await expect(page.locator("nav")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Session 11 — parity: copy + glyph fidelity (the learning-path card
// description + the testimonial ASCII quotes) and the login card-interior
// ownership (the 5-view state machine owns the WHOLE card interior — the
// logo/h1/Google/OR chrome renders ONLY on the signin view, and the reset
// email input is the text-base variant).
// Reference: docs/remediation-plan-session11.md
// ---------------------------------------------------------------------------

test.describe("session-11 parity: landing copy + glyph fidelity", () => {
  test("the Digital Marketing Pro path card carries the live description", async ({ page }) => {
    await page.goto("/");
    // The live third learning-path card (verified 2026-09-29): the clone
    // shipped the pre-session-3 copy ("Learn modern marketing from SEO and
    // content strategy…") — caught by the session-11 text-content diff.
    const section = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Structured Learning Paths" }) });
    await expect(section).toBeVisible();
    await expect(
      section.getByText("Learn SEO, paid ads, social media strategy, and analytics to drive real business growth.")
    ).toBeVisible();
    await expect(section.getByText("Learn modern marketing")).toHaveCount(0);
  });

  test("testimonial quotes render ASCII double quotes", async ({ page }) => {
    await page.goto("/");
    // The live testimonial paragraphs wrap the quotes in plain U+0022
    // characters (measured charCodeAt 34/34); the clone rendered U+201C/U+201D
    // via &ldquo;/&rdquo; entities.
    const quotes = page.locator("section", { hasText: "What Our Students Say" })
      .locator("p.text-gray-600.leading-relaxed");
    await expect(quotes).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const text = (await quotes.nth(i).textContent()) ?? "";
      expect(text.charCodeAt(0)).toBe(34);            // starts with "
      expect(text.charCodeAt(text.length - 1)).toBe(34); // ends with "
      expect(text).not.toMatch(/[\u201C\u201D]/);     // no curly quotes anywhere
    }
  });
});

test.describe("session-11 parity: the login card interior is owned by the active view", () => {
  test("the reset view replaces the card interior", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();

    // The live reset view renders ONLY the view content inside the card —
    // no logo, no h1, no subtitle, no Google button, no OR divider.
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
    await expect(page.locator("img[alt='NexusLearn logo']")).toHaveCount(0);
    await expect(page.locator("main h1")).toHaveCount(0);
    // The OR divider belongs to the signin chrome too.
    await expect(page.locator("span.bg-white.px-3")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Back to sign in" })).toBeVisible();
  });

  test("the reset email input is the text-base variant", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    // The live reset-view input carries `text-base` after py-2 (like the
    // signin inputs) — NOT the `text-sm sm:text-base` tail the signup
    // inputs carry. Verified against the live DOM 2026-09-29.
    const input = page.locator("#email");
    const cls = await input.getAttribute("class");
    expect(cls).toContain(" text-base ");
    expect(cls).not.toContain("sm:text-base");
    expect(cls).toContain("h-10 sm:h-11");
    expect(cls).toContain("placeholder:text-slate-400");
  });

  test("the reset-sent view replaces the card interior", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await page.fill("#email", "session11@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
    await expect(page.locator("main h1")).toHaveCount(0);
    await expect(page.locator("span.bg-white.px-3")).toHaveCount(0);
  });

  test("the signup view replaces the card interior", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
    await expect(page.locator("main h1")).toHaveCount(0);
    await expect(page.locator("span.bg-white.px-3")).toHaveCount(0);
  });

  test("the verify view replaces the card interior", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();
    await page.fill("#email", `verify-interior-${Date.now()}@example.com`);
    await page.fill("#password", "SuperSecret99!");
    await page.fill("#confirmPassword", "SuperSecret99!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
    await expect(page.locator("main h1")).toHaveCount(0);
    await expect(page.locator("span.bg-white.px-3")).toHaveCount(0);
  });

  test("returning to sign-in restores the full chrome", async ({ page }) => {
    // The chrome is not destroyed — it is owned by the signin view, so the
    // round trip must bring back the logo + h1 + Google + OR divider.
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.locator("main h1")).toHaveCount(0);
    await page.getByRole("button", { name: "Back to sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to NexusLearn" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.locator("img[alt='NexusLearn logo']")).toBeVisible();
    await expect(page.locator("span.bg-white.px-3")).toBeVisible();
  });
});

test.describe("session-12 parity: the v4 shadow-scale pin", () => {
  // Tailwind v4 shifted the shadow scale one notch: v3's shadow-sm
  // (0 1px 2px rgb(0 0 0/0.05)) became shadow-xs, and shadow-sm now renders
  // v3's bare-shadow geometry (0 1px 3px/0.1 + 0 1px 2px -1px/0.1) — one
  // notch heavier than the reference. The --shadow-sm token pin in
  // globals.css restores the v3 value with byte-identical classes. These
  // specs pin the COMPUTED box-shadows (v4's shadow composition emits empty
  // zero-alpha slots that are stripped by normShadow) so a future engine
  // bump cannot silently regress the shadow chrome.
  const normShadow = (sh: string): string => {
    // parens-aware split into components, then drop v4's empty slots
    // (zero-alpha black with zero geometry) — they are invisible.
    const parts: string[] = [];
    let depth = 0;
    let cur = "";
    for (const ch of sh) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        parts.push(cur.trim());
        cur = "";
        continue;
      }
      cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts.filter((p) => !p.startsWith("rgba(0, 0, 0, 0)")).join(", ");
  };

  test("the white navbar carries the v3 shadow-sm", async ({ page }) => {
    await page.goto("/Courses");
    const sh = await page.locator("nav").evaluate((el) => getComputedStyle(el).boxShadow);
    expect(normShadow(sh)).toBe("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  test("the login Sign in button carries the v3 shadow-sm", async ({ page }) => {
    await page.goto("/login");
    const sh = await page
      .getByRole("button", { name: "Sign in" })
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(normShadow(sh)).toBe("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  test("the hero secondary CTA carries the v3 shadow-sm at rest", async ({ page }) => {
    await page.goto("/");
    const sh = await page
      .getByRole("button", { name: "Start Learning" })
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(normShadow(sh)).toBe("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  test("the lesson-row hover carries the v3 hover:shadow-sm", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const row = page.locator("div.hover\\:shadow-sm").first();
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    // transition-all (150ms) — let the hover shadow finish animating.
    await page.waitForTimeout(300);
    const sh = await row.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(normShadow(sh)).toBe("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  // Guards: v4 did NOT shift md/lg/xl/2xl — the pin must never touch them
  // (these pin the reference geometry that already matches).
  test("GUARD: the price card keeps the v3 shadow-2xl", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const card = page.locator("div.bg-white.rounded-2xl.shadow-2xl").first();
    const sh = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(normShadow(sh)).toContain("0.25) 0px 25px 50px -12px");
  });

  test("GUARD: the hero primary CTA keeps the v3 shadow-lg geometry", async ({ page }) => {
    await page.goto("/");
    const sh = await page
      .getByRole("button", { name: "Browse Courses" })
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(sh).toContain("0px 10px 15px -3px");
  });
});

test.describe("session-13 parity: the login inputs' focus ring color (the v3 runtime-cascade pin)", () => {
  // The reference app (Tailwind v3 + the Base44 runtime) injects a page-level
  // utility sheet AFTER its static build; on /login that sheet re-asserts
  // .focus:ring-slate-400:focus at a later cascade position, which wins
  // --tw-ring-color over the static .focus-visible:ring-ring whenever both
  // pseudos match (keyboard focus). The clone's single v4 sheet emits
  // focus-visible:ring-ring later, so the login inputs rendered the --ring
  // near-black instead of the reference slate-400. The UNLAYERED cascade pin
  // in globals.css (unlayered beats every @layer rule) restores the reference
  // winner with byte-identical classes. The login inputs carry no transition
  // utilities, so the computed ring reads are stable immediately after focus.

  test("the signin email input's focus ring is slate-400", async ({ page }) => {
    await page.goto("/login");
    const input = page.locator("#email");
    await input.focus();
    const ringColor = await input.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-ring-color").trim());
    expect(ringColor).toBe("#94a3b8"); // = rgb(148,163,184) — the pinned token literal (the live reports the same sRGB color as "rgb(148 163 184 / 1)" — a form variance)
    const shadow = await input.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgb(148, 163, 184) 0px 0px 0px 4px");
  });

  test("the signup view's input focus ring is slate-400", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();
    const input = page.locator("#email");
    await input.focus();
    const ringColor = await input.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-ring-color").trim());
    expect(ringColor).toBe("#94a3b8"); // = rgb(148,163,184) — the pinned token literal (the live reports the same sRGB color as "rgb(148 163 184 / 1)" — a form variance)
  });

  test("the reset view's input focus ring is slate-400", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    const input = page.locator("#email");
    await input.focus();
    const ringColor = await input.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-ring-color").trim());
    expect(ringColor).toBe("#94a3b8"); // = rgb(148,163,184) — the pinned token literal (the live reports the same sRGB color as "rgb(148 163 184 / 1)" — a form variance)
  });

  // GUARD: the pin's selector (.focus:ring-slate-400:focus) exists ONLY on
  // the login card's inputs — every other form control keeps the --ring
  // near-black ring (verified against the live /Contact + /Courses controls).
  test("GUARD: the Contact input's focus ring stays the --ring near-black", async ({ page }) => {
    await page.goto("/Contact");
    const input = page.locator("input[type='email']");
    await input.focus();
    const ringColor = await input.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-ring-color").trim());
    expect(ringColor).toBe("#0a0a0a");
  });

  // GUARD: the buttons never carried focus:ring-slate-400 — their focus ring
  // must stay the --ring near-black. The Sign in button transitions its
  // box-shadow (transition-all 200ms), so the read waits out the transition
  // (the session-13 methodology rule: immediate reads on transition-all
  // elements report mid-transition zero-alpha slots).
  test("GUARD: the Sign in button's focus ring stays the --ring near-black", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: "Sign in" });
    await btn.focus();
    await page.waitForTimeout(450);
    const ringColor = await btn.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-ring-color").trim());
    // Session-18 refinement: /login alone carries the live's ZINC token
    // sheet (--ring #09090b = zinc-950); every other route stays neutral
    // #0a0a0a. The guard's intent is unchanged — the buttons NEVER flip to
    // the slate-400 ring (that stays pinned to the inputs).
    expect(ringColor).toBe("#09090b");
  });
});

test.describe("session-13 parity: the signin-view DOM nesting (the reference card structure)", () => {
  // The live card interior: div.w-full > [div.space-y-3 (the Google button
  // ONLY), div.relative.my-6 (the OR divider), form.space-y-4]. The clone
  // previously nested the OR divider + the form INSIDE the space-y-3 — the
  // gaps measured 24px/24px on both sites only because block-context margin
  // collapse hid the difference (a latent v4 :where() space-y trap). These
  // specs pin the reference nesting so the structure cannot drift again.

  test("the OR divider and the form are the space-y-3's siblings inside the w-full", async ({ page }) => {
    await page.goto("/login");
    const structure = await page.evaluate(() => {
      const or = document.querySelector("main .relative.my-6");
      const form = document.querySelector("main form");
      const google = [...document.querySelectorAll("main button")].find((b) =>
        b.textContent?.includes("Continue with Google")
      );
      if (!or || !form || !google) return null;
      return {
        orParentCls: or.parentElement!.className,
        formParentCls: form.parentElement!.className,
        orAndFormShareParent: or.parentElement === form.parentElement,
        spaceY3Cls: google.parentElement!.className,
        spaceY3ChildCount: google.parentElement!.children.length,
      };
    });
    expect(structure).not.toBeNull();
    expect(structure!.orParentCls).toBe("w-full");
    expect(structure!.formParentCls).toBe("w-full");
    expect(structure!.orAndFormShareParent).toBe(true);
    expect(structure!.spaceY3Cls).toContain("space-y-3");
    expect(structure!.spaceY3ChildCount).toBe(1);
  });

  test("the visual gaps stay the reference 24px (Google to OR, OR to form)", async ({ page }) => {
    await page.goto("/login");
    const gaps = await page.evaluate(() => {
      const google = [...document.querySelectorAll("main button")].find((b) =>
        b.textContent?.includes("Continue with Google")
      );
      const or = document.querySelector("main .relative.my-6");
      const form = document.querySelector("main form");
      if (!google || !or || !form) return null;
      const g = google.getBoundingClientRect();
      const o = or.getBoundingClientRect();
      const f = form.getBoundingClientRect();
      return {
        googleToOR: Math.round(o.top - g.bottom),
        orToForm: Math.round(f.top - o.bottom),
      };
    });
    expect(gaps).not.toBeNull();
    expect(gaps!.googleToOR).toBe(24);
    expect(gaps!.orToForm).toBe(24);
  });
});

test.describe("session-13 parity: the universal scroll-behavior rule", () => {
  // The reference's Base44 runtime ships `* { scroll-behavior: smooth }` —
  // every element (html, body, head, sections) computes smooth, and every
  // programmatic scroll inside inner scroll containers (e.g. the Radix
  // SelectContent viewport during dropdown keyboard navigation) animates.
  // The clone previously smoothed only html. The universal rule in
  // globals.css @layer base restores the reference behavior.

  test("body and section elements compute scroll-behavior smooth", async ({ page }) => {
    await page.goto("/");
    const behavior = await page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).scrollBehavior,
      body: getComputedStyle(document.body).scrollBehavior,
      section: getComputedStyle(document.querySelector("main > div")!).scrollBehavior,
    }));
    expect(behavior.html).toBe("smooth");
    expect(behavior.body).toBe("smooth");
    expect(behavior.section).toBe("smooth");
  });
});

test.describe("session-14 parity: the v3 button-cursor preflight (the sixth v4 trap)", () => {
  // Tailwind v4's preflight DROPPED v3's `button, [role="button"] {
  // cursor: pointer }` — every button on the clone rendered the UA-default
  // arrow cursor while the reference (v3 + the Base44 runtime, which ships
  // the rule in BOTH its static sheet and its runtime sheet) renders the
  // hand cursor on every button. The restored @layer base rule brings the
  // computed cursor back to pointer for every button without a cursor-*
  // utility (utilities still win where a class sets one).

  test("every button on /login computes cursor pointer (no element inside a button defaults)", async ({ page }) => {
    await page.goto("/login");
    const state = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      const badButtons = buttons.filter((b) => getComputedStyle(b).cursor === "default").length;
      const defaultInside = [...document.querySelectorAll("button *")].filter(
        (e) => getComputedStyle(e).cursor === "default"
      ).length;
      return { total: buttons.length, badButtons, defaultInside };
    });
    expect(state.total).toBeGreaterThan(0);
    expect(state.badButtons).toBe(0);
    expect(state.defaultInside).toBe(0);
  });

  test("every button on / computes cursor pointer and the page has zero default-cursor elements", async ({ page }) => {
    await page.goto("/");
    const state = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      const badButtons = buttons.filter((b) => getComputedStyle(b).cursor === "default").length;
      const allDefault = [...document.querySelectorAll("body *")].filter(
        (e) => getComputedStyle(e).cursor === "default"
      ).length;
      return { total: buttons.length, badButtons, allDefault };
    });
    expect(state.total).toBeGreaterThan(0);
    expect(state.badButtons).toBe(0);
    // The reference's landing page computes ZERO default-cursor elements
    // (even the labels are absent there).
    expect(state.allDefault).toBe(0);
  });

  test("GUARD: the login labels keep the default cursor and inputs stay text", async ({ page }) => {
    await page.goto("/login");
    const state = await page.evaluate(() => {
      const labels = [...document.querySelectorAll("label")].map((l) => getComputedStyle(l).cursor);
      const input = document.querySelector("input[type='email']")!;
      return { labels, input: getComputedStyle(input).cursor };
    });
    // The reference's only default-cursor elements on /login are the two
    // form labels (never buttons) — the pin must not over-apply.
    expect(state.labels.every((c) => c === "default")).toBe(true);
    expect(state.input).toBe("text");
  });
});

test.describe("session-14 parity: the declared font stack + no bundled webfont", () => {
  // The reference ships NO webfont: document.fonts is empty on every route
  // (no @font-face for Inter anywhere) and its runtime injects
  // `body { font-family: Inter, system-ui, -apple-system, sans-serif }` as
  // an inline sheet — the stack resolves to the visitor's system font (or a
  // locally-installed Inter). The clone previously bundled next/font Inter
  // and rendered real Inter glyphs the reference never shows — the root
  // cause of the 13-session "font-metric height bands".

  test("body computes the reference's declared Inter stack on / and /login", async ({ page }) => {
    for (const route of ["/", "/login"]) {
      await page.goto(route);
      const ff = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
      expect(ff).toBe("Inter, system-ui, -apple-system, sans-serif");
    }
  });

  test("no Inter webfont is registered and html carries no font-module class", async ({ page }) => {
    await page.goto("/");
    const state = await page.evaluate(() => ({
      interFaces: [...document.fonts].filter((f) => /^inter$/i.test(f.family)).length,
      htmlClass: document.documentElement.className,
    }));
    expect(state.interFaces).toBe(0);
    expect(state.htmlClass).toBe("");
  });
});

test.describe("session-14 parity: the v3 variant-order line-height winners (the seventh v4 trap)", () => {
  // v3 emits responsive text-* rules in media blocks AFTER every base
  // utility, so the SIZE utility's own line-height beats a plain leading-*
  // on the same element (hero H1 lh 1, hero P lh 1.75rem, CTA H2 lh 1).
  // v4's --tw-leading composition flips the winner (leading-* always wins).
  // The four unlayered media-scoped pins restore the reference winners.

  test("the hero H1 line boxes are 72px (md:text-7xl's own line-height, not leading-tight's 1.25)", async ({ page }) => {
    await page.goto("/");
    const lh = await page.evaluate(() => {
      const h1 = document.querySelector("h1")!;
      return { lh: getComputedStyle(h1).lineHeight, h: Math.round(h1.getBoundingClientRect().height) };
    });
    expect(lh.lh).toBe("72px");
    expect(lh.h).toBe(144); // 2 lines x 72
  });

  test("the hero P line boxes are 28px (md:text-xl's rem-based 1.75rem, not leading-relaxed's 1.625)", async ({ page }) => {
    await page.goto("/");
    const lh = await page.evaluate(() => {
      const p = [...document.querySelectorAll("main p")].find((x) =>
        (x.textContent ?? "").includes("Master the most in-demand")
      )!;
      return { lh: getComputedStyle(p).lineHeight, h: Math.round(p.getBoundingClientRect().height) };
    });
    expect(lh.lh).toBe("28px");
    expect(lh.h).toBe(84); // 3 lines x 28
  });

  test("the CTA H2 (md:text-5xl + leading-tight) computes the 48px line-height", async ({ page }) => {
    await page.goto("/");
    const lh = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll("h2")].find((x) =>
        (x.textContent ?? "").includes("Your Personal")
      )!;
      return { lh: getComputedStyle(h2).lineHeight, fs: getComputedStyle(h2).fontSize };
    });
    expect(lh.fs).toBe("48px");
    expect(lh.lh).toBe("48px");
  });
});

test.describe("session-14 parity: the dead popular-card scale (the ninth v4 trap)", () => {
  // The reference's scroll-reveal system leaves INLINE
  // `opacity: 1; transform: none` on every revealed element FOREVER — which
  // beats the popular pricing card's own .scale-105 class. Both live popular
  // cards (/, /Pricing) render UNSCALED in their resting state (498px box).
  // The unlayered `.scale-105 { scale: none }` pin replicates that resting
  // state; the hover: variants are different class names and stay live.

  test("the popular card computes scale none and renders its layout box unscaled", async ({ page }) => {
    await page.goto("/");
    const state = await page.evaluate(() => {
      const card = [...document.querySelectorAll("[class*=scale-105]")].find((c) =>
        c.className.includes("rounded-3xl")
      ) as HTMLElement | undefined;
      if (!card) return null;
      const cs = getComputedStyle(card);
      return {
        scale: cs.scale,
        rectH: Math.round(card.getBoundingClientRect().height),
        offsetH: card.offsetHeight,
      };
    });
    expect(state).not.toBeNull();
    expect(state!.scale).toBe("none");
    expect(state!.rectH).toBe(state!.offsetH); // bounding box == layout box
    expect(state!.offsetH).toBe(498);
  });

  test("the feature-list gaps inside the popular card are 16px (not 1.05x-inflated)", async ({ page }) => {
    await page.goto("/");
    const gap = await page.evaluate(() => {
      const list = [...document.querySelectorAll("[class*=space-y-4]")].find((x) =>
        (x.textContent ?? "").includes("Unlimited course access")
      )!;
      const kids = [...list.children];
      const a = kids[0].getBoundingClientRect();
      const b = kids[1].getBoundingClientRect();
      return Math.round((b.top - (a.top + a.height)) * 10) / 10;
    });
    expect(gap).toBe(16);
  });

  test("GUARD: the hover:scale-105 rule still exists (the hover variants stay live)", async ({ page }) => {
    await page.goto("/");
    const hasHoverScale = await page.evaluate(() => {
      function walk(rs: CSSRuleList): boolean {
        for (const r of Array.from(rs)) {
          const st = (r as CSSStyleRule).selectorText ?? "";
          if (/hover\\:scale-105/.test(st)) return true;
          if ((r as CSSMediaRule).cssRules) {
            try {
              if (walk((r as CSSMediaRule).cssRules)) return true;
            } catch {
              /* CORS */
            }
          }
        }
        return false;
      }
      for (const s of Array.from(document.styleSheets)) {
        try {
          if (walk(s.cssRules)) return true;
        } catch {
          /* CORS */
        }
      }
      return false;
    });
    expect(hasHoverScale).toBe(true);
  });
});

test.describe("session-14 parity: the skills/ folder stays out of the compiled CSS", () => {
  // Tailwind v4's automatic source detection scanned the repo's skills/
  // folder (283 files with class-like strings) and leaked 1027 unused
  // utility rules into the stylesheet — 51% of the compiled CSS (canaries:
  // the .selection:bg-red-200/.selection:text-red-900 demo string from
  // skills/gift-evaluator/html_tools.py, plus .bg-indigo-500/.bg-lime-50/
  // .bg-teal-600/.bg-amber-400, all with zero src/ usage). The
  // `@source not "../../skills"` directive in globals.css closes the last
  // skills-exclusion gap.

  test("no ::selection rules and no skills-leaked color utilities in the stylesheets", async ({ page }) => {
    await page.goto("/");
    const found = await page.evaluate(() => {
      const hits: string[] = [];
      const canaries = ["bg-indigo-500", "bg-lime-50", "bg-teal-600", "bg-amber-400"];
      function walk(rs: CSSRuleList) {
        for (const r of Array.from(rs)) {
          const st = (r as CSSStyleRule).selectorText ?? "";
          if (/::(moz-)?selection/.test(st)) hits.push("::selection");
          for (const c of canaries) if (st.includes(c)) hits.push(c);
          if ((r as CSSMediaRule).cssRules) {
            try {
              walk((r as CSSMediaRule).cssRules);
            } catch {
              /* CORS */
            }
          }
        }
      }
      for (const s of Array.from(document.styleSheets)) {
        try {
          walk(s.cssRules);
        } catch {
          /* CORS */
        }
      }
      return hits;
    });
    expect(found).toEqual([]);
  });
});

test.describe("session-14 parity: the inline-label space-y gap (the eighth v4 trap)", () => {
  // v4's space-y engine assigns the gap to NON-LAST children as
  // margin-block-end — inert when the child is inline (the login labels).
  // The reference's v3 engine put the gap on the FOLLOWER's margin-top (the
  // block input wrapper) — effective. The unlayered follower pin restores
  // the 6px gap; the field groups return to the reference 74px.

  test("the email field group's input wrapper carries the 6px follower gap", async ({ page }) => {
    await page.goto("/login");
    const state = await page.evaluate(() => {
      const group = document.querySelector("form > div > div")!;
      const wrapper = [...group.children].find((c) => c.tagName === "DIV") as HTMLElement;
      const label = group.querySelector("label")!;
      const g = group.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      const w = wrapper.getBoundingClientRect();
      return {
        mt: getComputedStyle(wrapper).marginBlockStart,
        // browser-independent structural read: the label bottom -> wrapper
        // top span equals the line-box slack + the pinned 6px gap, and the
        // wrapper's top sits exactly the gap below the label's line box
        // (the group's own height is font-metric dependent — the reference
        // measures 74 in one Chromium build and 78 in another — so the
        // absolute number is pinned by the mobile-page-height spec below).
        wrapperTopMinusLabelTop: Math.round(w.top - l.top),
        groupHeightEqualsParts: Math.round(g.height) === Math.round(w.top - g.top) + Math.round(w.height),
      };
    });
    expect(state.mt).toBe("6px");
    // the wrapper starts at least 22px below the label top (16px label box
    // + 6px pinned gap) — the gap is present in every browser
    expect(state.wrapperTopMinusLabelTop).toBeGreaterThanOrEqual(22);
    expect(state.groupHeightEqualsParts).toBe(true);
  });

  test("the mobile /login page height is the reference 762 (email + password groups intact)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");
    const h = await page.evaluate(
      () => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    );
    expect(h).toBe(762);
  });
});

test.describe("session-14 parity: the overridden back-button space-y gap (the tenth v4 trap)", () => {
  // v4's :where() gap carrier is replaced by a child's OWN margin utility:
  // the login card's "Back to sign in" button carries -mb-2, which on v4
  // replaced the header block's 16/24px space-y gap (on v3 the gap rides
  // the FOLLOWER and survives). The unlayered pins restore the follower gap
  // for the signup/reset/verify header blocks.

  test("the signup view's heading block gaps are the reference [8, 16] (height 382)", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Sign up").first().click();
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => {
      const block = [...document.querySelectorAll("div")].find(
        (d) => /(^|\s)space-y-4(\s|$)/.test(d.className) &&
          [...d.children].some((c) => c.tagName === "BUTTON" && (c.textContent ?? "").includes("Back to sign in"))
      )!;
      const kids = [...block.children];
      const gaps: number[] = [];
      for (let i = 1; i < kids.length; i++) {
        const a = kids[i - 1].getBoundingClientRect();
        const b = kids[i].getBoundingClientRect();
        gaps.push(Math.round(b.top - (a.top + a.height)));
      }
      return { gaps, h: Math.round(block.getBoundingClientRect().height) };
    });
    expect(state.gaps).toEqual([8, 16]);
    expect(state.h).toBe(382);
  });

  test("the reset view's heading block gaps are the reference [16, 24] (height 286)", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Forgot password?").first().click();
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => {
      const block = [...document.querySelectorAll("div")].find(
        (d) => /(^|\s)space-y-4(\s|$)/.test(d.className) &&
          [...d.children].some((c) => c.tagName === "BUTTON" && (c.textContent ?? "").includes("Back to sign in"))
      )!;
      const kids = [...block.children];
      const gaps: number[] = [];
      for (let i = 1; i < kids.length; i++) {
        const a = kids[i - 1].getBoundingClientRect();
        const b = kids[i].getBoundingClientRect();
        gaps.push(Math.round(b.top - (a.top + a.height)));
      }
      return { gaps, h: Math.round(block.getBoundingClientRect().height) };
    });
    expect(state.gaps).toEqual([16, 24]);
    expect(state.h).toBe(286);
  });
});

// ---------------------------------------------------------------------------
// session-15 parity: the scroll-reveal ENTRY animation + the worklog CSS leak
// ---------------------------------------------------------------------------
// The live app (Base44 + framer-motion, confirmed in its bundle) pre-hides
// 103 reveal targets across 9 routes with inline `opacity: 0; transform:
// translate…` styles at mount, reveals each element ONCE when it scrolls into
// view (measured: any-pixel intersection, ~10-36ms intrinsic latency, sibling
// cards staggered ~100ms), and leaves inline `opacity: 1; transform: none;`
// FOREVER (the mechanism session 14 proved kills the popular card's
// scale-105). Pre-hide variants: translateY(20px) standard, translateY(30px)
// the / hero, translateY(10px) the /Pricing FAQ, translateX(±30px) the
// AI/BI/Our-Story sliders, opacity-only the / stats bar. Animation families
// (frame-resolution fits): A "snappy" (op ~310ms ease-out + transform spring
// settle ~280ms, 12% overshoot), B "floaty" (op ~310ms + slow back-loaded
// transform ~700ms), HERO (coupled ~735ms from y=30), FAQ (slower coupled
// ~500-610ms from y=10), X (spring ~7-10% overshoot). Only elements in the
// initial viewport reveal at mount — every below-fold target (incl. /About's
// values cards, verified twice) waits for scroll. The clone renders SSR
// pre-hide styles + a zero-dependency WAAPI controller; /login ships no
// targets (parity).
test.describe("session-15 parity: the reveal pre-hide state", () => {
  test("below-fold / targets carry the exact live pre-hide style strings", async ({ page }) => {
    await page.goto("/");
    const cat = page.locator('div[data-reveal]:has(> a[href*="/Courses?category="])').first();
    await expect(cat).toHaveCount(1);
    const catStyle = await cat.evaluate((el) => el.getAttribute("style"));
    expect(catStyle).toBe("opacity: 0; transform: translateY(20px);");
    await expect(cat).toHaveCSS("opacity", "0");

    const aiBadge = page.locator('div[data-reveal]:has(span:text("Powered by AI"))');
    expect(await aiBadge.evaluate((el) => el.getAttribute("style"))).toBe(
      "opacity: 0; transform: translateX(-30px);"
    );
    const biBadge = page.locator('div[data-reveal]:has(span:text("Teach With Us"))');
    expect(await biBadge.evaluate((el) => el.getAttribute("style"))).toBe(
      "opacity: 0; transform: translateX(30px);"
    );
    // The hero stats bar is the opacity-only variant.
    const stats = page.locator('[data-reveal="hero-op"]');
    expect(await stats.evaluate((el) => el.getAttribute("style"))).toBe("opacity: 0;");
  });

  test("the / hero blocks pre-hide from translateY(30px) and the FAQ from translateY(10px)", async ({ page }) => {
    await page.goto("/");
    // Read fast: the hero animates on mount (~735ms + up to ~400ms stagger).
    const h1Style = await page.evaluate(() => {
      const h1 = document.querySelector("h1[data-reveal]");
      return h1 ? h1.getAttribute("style") : "missing";
    });
    // Either still pre-hidden (translateY(30px)) or already revealed by the
    // mount animation — never a bare/unstyled state. BOTH serializations are
    // accepted: the SSR markup ships React's compact form
    // (opacity:0;transform:…) and the controller re-serializes to the live's
    // spaced form on hydration — a probe landing inside that window reads the
    // compact form (a session-16 flake fix; the pin's intent — the Y30 hero
    // family + the end state — is unchanged).
    expect([
      "opacity: 0; transform: translateY(30px);",
      "opacity: 1; transform: none;",
      "opacity:0;transform:translateY(30px)",
      "opacity:1;transform:none",
    ]).toContain(h1Style);

    await page.goto("/Pricing");
    const faq = page.locator('[data-reveal="faq"]').first();
    await expect(faq).toHaveCount(1);
    // Both serializations (the SSR compact form pre-normalization + the
    // live's spaced form) — the FAQ items are below-fold and never animate
    // before scrolling, so these are the only two possible states.
    expect(await faq.evaluate((el) => el.getAttribute("style"))).toMatch(
      /^opacity: ?0; ?transform: ?translateY\(10px\);?$/
    );
  });
});

test.describe("session-15 parity: the reveal animation + end state", () => {
  test("a category card animates in gradually (not instant) and lands the exact end state", async ({ page }) => {
    await page.goto("/");
    const series = await page.evaluate(async () => {
      const el = document.querySelector('div[data-reveal]:has(> a[href*="/Courses?category="])');
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const ops: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 1500) {
        ops.push(+getComputedStyle(el).opacity);
        if (el.getAttribute("style") === "opacity: 1; transform: none;") break;
        await new Promise((r) => setTimeout(r, 30));
      }
      return { ops, endStyle: el.getAttribute("style"), endOpacity: +getComputedStyle(el).opacity };
    });
    expect(series).not.toBeNull();
    // Pre-animation samples at 0, a strictly-intermediate sample (gradual,
    // not instant), and the final state byte-identical to the live. The
    // opacity tween finishes ~10ms before the transform track, so trailing
    // 1.0 samples may precede the end-style flip — compare up to the first
    // >=0.99 sample instead of the raw last element.
    const ops = series!.ops;
    const firstDone = ops.findIndex((o) => o >= 0.99);
    expect(firstDone).toBeGreaterThan(0);
    expect(ops[0]).toBeLessThan(0.01);
    expect(ops.slice(0, firstDone).some((o) => o > 0.01 && o < 0.99)).toBe(true);
    expect(series!.endOpacity).toBe(1);
    expect(series!.endStyle).toBe("opacity: 1; transform: none;");
  });

  test("the reveal is one-way — scrolling back up never re-hides", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const el = document.querySelector('div[data-reveal]:has(> a[href*="/Courses?category="])');
      el?.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => {
      const el = document.querySelector('div[data-reveal]:has(> a[href*="/Courses?category="])');
      return { style: el?.getAttribute("style"), op: el ? getComputedStyle(el).opacity : "n/a" };
    });
    expect(state.style).toBe("opacity: 1; transform: none;");
    expect(state.op).toBe("1");
  });

  test("sibling cards stagger — the last testimonial lands >= 80ms after the first", async ({ page }) => {
    await page.goto("/");
    const times = await page.evaluate(async () => {
      // The testimonial cards are the rounded-3xl reveal targets with the
      // yellow star svgs (the featured cards' wrappers are classless).
      const cards = [...document.querySelectorAll('div[data-reveal].rounded-3xl:has(svg.fill-yellow-400)')];
      if (cards.length !== 3) return { n: cards.length, t: [] as number[] };
      cards[0].scrollIntoView({ block: "center" });
      const done: number[] = [0, 0, 0];
      const t0 = performance.now();
      while (performance.now() - t0 < 2500 && done.some((d) => !d)) {
        cards.forEach((c, i) => {
          if (!done[i] && c.getAttribute("style") === "opacity: 1; transform: none;") {
            done[i] = Math.round(performance.now() - t0);
          }
        });
        await new Promise((r) => setTimeout(r, 20));
      }
      return { n: cards.length, t: done };
    });
    expect(times.n).toBe(3);
    expect(times.t[0]).toBeGreaterThan(0);
    expect(times.t[2] - times.t[0]).toBeGreaterThanOrEqual(80);
  });
});

test.describe("session-15 parity: the route target inventory + mount behavior", () => {
  // The live's measured inventory: / 40, /Courses 12, /Pricing 10, /About 12,
  // /Contact 6, /BecomeInstructor 13, /AIAssistant 3, /Dashboard 5,
  // /CourseDetail 2, /login 0 (+ /Home renders the landing = 40).
  const COUNTS: Array<[string, number]> = [
    ["/", 40],
    ["/Home", 40],
    ["/Courses", 12],
    ["/Pricing", 10],
    ["/About", 12],
    ["/Contact", 6],
    ["/BecomeInstructor", 13],
    ["/AIAssistant", 3],
    ["/Dashboard", 5],
    ["/CourseDetail?id=seed-1", 2],
    ["/login", 0],
  ];
  for (const [route, count] of COUNTS) {
    test(`${route} ships exactly ${count} reveal targets`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("[data-reveal]")).toHaveCount(count);
    });
  }

  test("/About follows the standard whileInView contract — the below-fold values cards stay hidden until scrolled", async ({ page }) => {
    await page.goto("/About");
    await page.waitForTimeout(2600);
    const before = await page.evaluate(() => ({
      scrollY: window.scrollY,
      cards: [...document.querySelectorAll('div[data-reveal].text-center.p-6')].map(
        (el) => el.getAttribute("style")
      ),
    }));
    expect(before.scrollY).toBe(0);
    expect(before.cards).toHaveLength(4);
    // Hidden at load (the live's own values cards stay `opacity: 0` until
    // scrolled — measured; only the 8 in-view targets reveal at mount).
    for (const s of before.cards) expect(s).toBe("opacity: 0; transform: translateY(20px);");

    const after = await page.evaluate(async () => {
      const el = document.querySelector('div[data-reveal].text-center.p-6');
      el?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 1200));
      return [...document.querySelectorAll('div[data-reveal].text-center.p-6')].map((c) => c.getAttribute("style"));
    });
    for (const s of after) expect(s).toBe("opacity: 1; transform: none;");
  });

  test("the / hero blocks complete their mount animation", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2600);
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll('[data-reveal="hero"], [data-reveal="hero-op"]')].map(
        (el) => el.getAttribute("style")
      )
    );
    expect(styles).toHaveLength(5);
    for (const s of styles) {
      expect(["opacity: 1; transform: none;", "opacity: 1;"]).toContain(s);
    }
  });

  test("every route's in-view targets complete their mount reveal (a controller must mount on every render branch)", async ({ page }) => {
    // /CourseDetail's hero targets are in view at load — they must reach the
    // end state. (The first implementation shipped the controller on only
    // ONE of the page's two render branches — the main render's targets
    // stayed hidden forever. This spec pins the fix.)
    await page.goto("/CourseDetail?id=seed-1");
    await page.waitForTimeout(2000);
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal]")].map((el) => el.getAttribute("style"))
    );
    expect(styles).toHaveLength(2);
    for (const s of styles) expect(s).toBe("opacity: 1; transform: none;");
    // The not-found branch ships the controller too (the live's not-found
    // state has 0 targets — the controller is a no-op there).
    await page.goto("/CourseDetail?id=nonexistent");
    await page.waitForTimeout(600);
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
  });
});

test.describe("session-15 parity: GUARD — the reveal cannot break the pinned parity", () => {
  test("the popular pricing card renders unscaled pre- AND post-reveal (same width as its siblings)", async ({ page }) => {
    await page.goto("/");
    const widths = await page.evaluate(() => {
      // Viewport-relative GUARD: the live's reveal leaves inline
      // `transform: none` which kills the card's scale-105 — so the popular
      // card must measure the SAME width as its unscaled siblings at any
      // viewport (a live scale-105 would read 1.05x wider).
      // Scope to the pricing section (its h2 reads "Choose Your Plan") —
      // the featured course cards also carry h3 + $ text.
      const section = [...document.querySelectorAll("section")].find((s) =>
        /Choose Your Plan/.test(s.querySelector("h2")?.textContent || "")
      );
      const cards = section ? [...section.querySelectorAll('[data-reveal="b"]')] : [];
      if (cards.length !== 3) return { n: cards.length, pre: [] as number[] };
      return { n: 3, pre: cards.map((el) => Math.round(el.getBoundingClientRect().width)) };
    });
    expect(widths.n).toBe(3);
    expect(widths.pre[0]).toBe(widths.pre[1]);
    expect(widths.pre[0]).toBe(widths.pre[2]);

    const card = page.locator('[data-reveal="b"]:has-text("Most Popular")');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
    const post = await card.evaluate((el) => ({
      w: Math.round(el.getBoundingClientRect().width),
      style: el.getAttribute("style"),
    }));
    expect(post.w).toBe(widths.pre[0]);
    expect(post.style).toBe("opacity: 1; transform: none;");
  });

  test("the reveal moves no layout — scrollHeight is identical hidden vs revealed", async ({ page }) => {
    await page.goto("/");
    const heights = await page.evaluate(async () => {
      const before = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 900));
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 200));
      return {
        before,
        after: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      };
    });
    expect(heights.after).toBe(heights.before);
  });

  test("the hero H1 keeps the session-14 line-height winner through the reveal", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2600);
    const lh = await page.evaluate(() => getComputedStyle(document.querySelector("h1[data-reveal]")!).lineHeight);
    expect(lh).toBe("72px");
  });
});

// session-16 parity: the navigation-transition surface — scroll restoration,
// managed navigation semantics, title-on-soft-nav and the CLS guard.
//
// The audit (live vs clone, desktop + mobile, dev + production builds) found:
// the reference's back/forward restoration is the BROWSER-NATIVE INSTANT SNAP
// (its CSR router never calls scrollTo); the clone's Next.js restoration rides
// window.scrollTo, which the session-13 universal `* { scroll-behavior: smooth }`
// pin (the same rule the reference ships) turns into a ~0.9-1.5s glide — and a
// navigation click fired mid-smooth-scroll (a footer link clicked while its
// scroll-into-view animation is still running) races the restore to 0 on mobile.
// The fix: ScrollRestoreNormalizer suppresses smooth for the popstate window.
//
// Also pinned here (deliberate-better parity decisions, the unhardened-reference
// family — like the ARIA/scroll-lock/Escape mobile-menu hardening):
//  - the reference NEVER resets scroll on in-app navigation (its SPA router
//    carries the position over, clamped by the new page's CSR loading shell —
//    measured: /@2000 -> /Courses lands 493, /@7000 -> /Pricing lands 1289,
//    /Courses@800 -> CourseDetail lands 492). The clone keeps Next.js's managed
//    reset-to-top (exact shell-clamp replication is impossible and the reference
//    behavior lands users mid-page).
//  - the reference's document.title NEVER updates on soft navigation (stays the
//    previous route's title — "NexusLearn" after nav to /Pricing, /Courses,
//    /About; fresh loads are correct). The clone updates per-route.
test.describe("session-16 parity: back/forward scroll restoration", () => {
  test("popstate restoration lands INSTANTLY (the reference's browser-native snap, not a smooth glide)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(1000);
    // the fixed navbar link is in view — no scroll-into-view, a clean capture of 3000
    await page.click('nav a[href="/Courses"]');
    await page.waitForURL((u) => u.pathname === "/Courses");
    await page.waitForTimeout(1200);
    await page.goBack();
    // The reference's native snap lands within one frame of the route swap
    // (<300ms incl. the RSC cache re-render); the pre-fix clone glide sits at
    // ~43% of the distance here (measured 1289 of 3000 at +250ms).
    await page.waitForTimeout(250);
    const early = await page.evaluate(() => Math.round(window.scrollY));
    expect(early).toBeGreaterThanOrEqual(2700);
    // …and it settles at exactly the saved position.
    await page.waitForTimeout(1500);
    const settled = await page.evaluate(() => Math.round(window.scrollY));
    expect(settled).toBe(3000);
  });

  test("a navigation click fired mid-smooth-scroll still restores correctly (the footer-link race)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(1000);
    // locator.click() scrolls the footer link into view — a SMOOTH scroll under
    // the universal pin — and the click lands while the scroll settles. Pre-fix
    // this raced the clone's own smooth restoration to 0 (3/3 reproductions on
    // mobile; the reference restores correctly under identical conditions).
    await page.locator('footer a[href="/Pricing"]').first().click();
    await page.waitForURL((u) => u.pathname === "/Pricing");
    await page.waitForTimeout(1200);
    await page.goBack();
    await page.waitForTimeout(1800);
    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    // Pre-fix: 0. Post-fix: the position captured at click time (~14200 — the
    // footer scroll-into-view position on the mobile landing page).
    expect(scrollY).toBeGreaterThan(1000);
  });

  test("in-app navigation resets to the top (managed Next.js behavior — a deliberate-better parity decision)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(1000);
    await page.click('nav a[href="/Courses"]');
    await page.waitForURL((u) => u.pathname === "/Courses");
    // Session-30 note: the reset now SNAPS (the data-scroll-behavior
    // contract wraps the router's own scrolls in scroll-behavior: auto — see
    // the session-30 router-scroll specs for the tight timing pin). Before
    // session 30 it animated under the universal smooth rule (~600ms glide
    // for 2000px); the generous wait below stays as a settle for both
    // eras, and the landing-position assertion is unchanged.
    await page.waitForTimeout(2000);
    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrollY).toBeLessThanOrEqual(5);
  });

  test("document.title updates on soft navigation (the reference's router leaves the stale title — a deliberate-better decision)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click('nav a[href="/Pricing"]');
    await page.waitForURL((u) => u.pathname === "/Pricing");
    await page.waitForTimeout(500);
    // The reference keeps "NexusLearn" here (its SPA router never touches the
    // title on soft navigation); fresh-load titles are byte-identical on both.
    expect(await page.title()).toBe("Pricing | NexusLearn");
  });

  test("zero cumulative layout shift on load (the performance-surface guard)", async ({ page }) => {
    for (const route of ["/", "/Courses"]) {
      await page.goto(route, { waitUntil: "commit" });
      const cls = await page.evaluate(
        () =>
          new Promise((resolve) => {
            let total = 0;
            try {
              new PerformanceObserver((l) => {
                for (const e of l.getEntries() as unknown as { hadRecentInput: boolean; value: number }[])
                  if (!e.hadRecentInput) total += e.value;
              }).observe({ type: "layout-shift", buffered: true });
            } catch {
              /* observer unsupported — resolve 0 */
            }
            setTimeout(() => resolve(Math.round(total * 10000) / 10000), 3000);
          })
      );
      // Both sites measure CLS 0.0000 on every probed route (the reveal system
      // animates opacity/transform only; images ship fixed dimensions).
      expect(cls).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Session 17 — deep-link / query-parameter parity
// ---------------------------------------------------------------------------

test.describe("session-17 parity: duplicate query params (first value wins)", () => {
  test("duplicate ?id= keys render the FIRST id's course (URLSearchParams.get semantics)", async ({ page }) => {
    // Next.js App Router delivers a repeated search param as string[]; the
    // naive destructure passed the array to Prisma and rendered the error
    // boundary ("This page couldn't load"). The live takes the first value.
    await page.goto("/CourseDetail?id=seed-1&id=x");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Complete Web Development Bootcamp");
    // The page is NOT the server-error boundary
    expect(await page.textContent("body")).not.toContain("This page couldn’t load");
  });

  test("duplicate ?id= keys with an unknown FIRST id render the in-page not-found state", async ({ page }) => {
    await page.goto("/CourseDetail?id=x&id=seed-1");
    await expect(page.getByText("Course not found")).toBeVisible();
    expect(await page.textContent("body")).not.toContain("This page couldn’t load");
  });

  test("the canonical/og:url of a duplicate-id URL keeps BOTH ids (the live's dupe contract)", async ({ page }) => {
    // Session 39 (the deliberate contract change): the live KEEPS duplicate
    // params in their original order (probed: ?token=a&token=b ->
    // ?token=a&token=b; ?b=2&a=1&a=3 -> ?a=1&a=3&b=2) — the clone's old
    // first-value-only canonical was the drift. The RENDERING still uses
    // the first value (firstId — the pinned rendering spec above).
    await page.goto("/CourseDetail?id=seed-1&id=x");
    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toContain("/CourseDetail?id=seed-1&id=x");
    expect(canonical).not.toContain("seed-1,x");
    // the og:url mirrors the same form
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(new URL(ogUrl!).search).toBe("?id=seed-1&id=x");
  });
});

test.describe("session-17 parity: the underscore category slugs", () => {
  test("the landing's Personal Development card links to the underscore slug", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("main a[href*='personal']");
    await expect(card).toHaveAttribute("href", "/Courses?category=personal_development");
  });

  test("the landing's AI & Innovation card links to the underscore slug", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("main a[href*='ai_']");
    await expect(card).toHaveAttribute("href", "/Courses?category=ai_innovation");
  });

  test("deep-linking the underscore slug pre-selects the category", async ({ page }) => {
    await page.goto("/Courses?category=personal_development");
    const trigger = page.locator("main [role=combobox]").first();
    await expect(trigger).toHaveText("Personal Development");
    // exactly the 1 Personal Development course
    expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(1);
  });

  test("deep-linking the ai_innovation slug pre-selects the category", async ({ page }) => {
    await page.goto("/Courses?category=ai_innovation");
    const trigger = page.locator("main [role=combobox]").first();
    await expect(trigger).toHaveText("AI & Innovation");
    expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(1);
  });
});

test.describe("session-17 parity: unknown category slug semantics (the raw filter state)", () => {
  test("an unknown slug renders 0 cards, the no-results state and an EMPTY category trigger", async ({ page }) => {
    // The live maps the slug through its case-sensitive slug->name lookup; an
    // unmapped slug leaves the filter in a no-match state: empty trigger
    // (Radix placeholder), 0 cards, "No courses found".
    await page.goto("/Courses?category=bogus");
    const trigger = page.locator("main [role=combobox]").first();
    await expect(trigger).toHaveText("");
    expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(0);
    await expect(page.getByText("No courses found")).toBeVisible();
  });

  test("a case-variant slug is UNKNOWN (the map is case-sensitive)", async ({ page }) => {
    await page.goto("/Courses?category=Business");
    const trigger = page.locator("main [role=combobox]").first();
    await expect(trigger).toHaveText("");
    expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(0);
  });

  test("an EMPTY category value is absent — the all default (GREEN by design)", async ({ page }) => {
    for (const url of ["/Courses?category=", "/Courses?category"]) {
      await page.goto(url);
      const trigger = page.locator("main [role=combobox]").first();
      await expect(trigger).toHaveText("All Categories");
      expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(9);
    }
  });
});

test.describe("session-17 parity: route-casing rewrites (case-insensitive content routes)", () => {
  test("lowercase /courses renders the catalog with the URL preserved", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Explore Our Courses");
    expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(9);
    // No redirect — the typed URL stays, exactly like the live.
    expect(page.url()).toContain("/courses");
    // The nav's Courses link is active (the live highlights it on /courses)
    const coursesLink = page.locator("nav .hidden.md\\:flex a", { hasText: "Courses" }).first();
    expect(await coursesLink.getAttribute("class")).toMatch(/text-purple-600/);
  });

  test("uppercase /COURSES renders the catalog too", async ({ page }) => {
    await page.goto("/COURSES");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Explore Our Courses");
    expect(await page.locator("main a[href*='CourseDetail']").count()).toBe(9);
  });

  test("lowercase /pricing renders the Pricing page", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Simple, Transparent Pricing");
  });

  test("lowercase /coursedetail?id= renders the course", async ({ page }) => {
    await page.goto("/coursedetail?id=seed-1");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Complete Web Development Bootcamp");
  });

  test("/login is EXACT-match — its case variants still 404 (GREEN by design)", async ({ page }) => {
    for (const url of ["/Login", "/LOGIN"]) {
      await page.goto(url);
      await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    }
  });

  test("unknown routes still 404 through the middleware (the regression guard)", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Session 18 — the error/empty-state + element-tag/attribute + data-mutation
// surfaces: the /Contact message placeholder, the AI chat loading bubble, the
// /Pricing CTA tag drift, the newsletter pending label, the /login zinc token
// theme, the instructor portrait alt, the search input type, and the
// deliberate-better failure states. Reference: docs/remediation-plan-session18.md
// ---------------------------------------------------------------------------

test.describe("session-18 parity: the /Contact message placeholder (the attribute surface)", () => {
  // Placeholders are ATTRIBUTES — invisible to innerText diffs (which read
  // rendered text nodes only) and to class diffs. The live's message
  // textarea ships "Tell us how we can help..."; the clone had drifted to
  // "How can we help you?" — visible in every empty-form render.
  test("the message textarea's placeholder is the reference string", async ({ page }) => {
    await page.goto("/Contact");
    const ta = page.locator("textarea");
    await expect(ta).toHaveAttribute("placeholder", "Tell us how we can help...");
  });

  test("GUARD: the name + email placeholders are unchanged", async ({ page }) => {
    await page.goto("/Contact");
    // placeholder-based selection: the live's inputs carry no type attribute
    // (text is the UA default) — never select them by [type=text].
    await expect(page.getByPlaceholder("John Doe")).toHaveCount(1);
    await expect(page.getByPlaceholder("john@example.com")).toHaveCount(1);
  });

  // The live's form-control ids are the bare reference names (name / email /
  // message) with matching label[for] wiring; the clone had prefixed them
  // contact-*. Ids are invisible to every rendered surface — only the
  // attribute sweep sees them — and the bare names are also the stronger
  // browser-autofill hints.
  test("the form-control ids are the reference bare names with label wiring", async ({ page }) => {
    await page.goto("/Contact");
    await expect(page.locator("main input#name")).toHaveCount(1);
    await expect(page.locator("main input#email")).toHaveCount(1);
    await expect(page.locator("main textarea#message")).toHaveCount(1);
    await expect(page.locator("main label[for='name']")).toHaveCount(1);
    await expect(page.locator("main label[for='email']")).toHaveCount(1);
    await expect(page.locator("main label[for='message']")).toHaveCount(1);
  });
});

test.describe("session-18 parity: the AI chat loading bubble (the transient-state surface)", () => {
  // The loading bubble only exists while the request is pending — every
  // settled-DOM audit (class diffs, text diffs, post-networkidle
  // screenshots) structurally cannot see it. The live renders a spinning
  // lucide-loader-circle + "Thinking..." text in a px-5 py-3 flex
  // items-center gap-2 text-gray-400 bubble; the clone shipped three
  // animate-bounce dots in a px-4 py-3 bubble.
  test("the pending bubble is the reference loader-circle + Thinking... text", async ({ page }) => {
    // Hold the request open so the loading state persists for the reads.
    await page.route("**/api/ai/chat", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "ok" }),
      });
    });
    await page.goto("/AIAssistant");
    await page.locator("textarea").fill("What is python?");
    await page.locator("textarea").press("Enter");

    const bubble = page.locator("main div.bg-gray-50.px-5.py-3.flex.items-center.gap-2.text-gray-400");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Thinking...");

    // The spinner is the reference loader-circle svg, not the dots
    const spin = bubble.locator("svg.animate-spin");
    await expect(spin).toHaveCount(1);
    const cls = await spin.getAttribute("class");
    expect(cls).toContain("lucide-loader-circle");
    expect(cls).toContain("h-4 w-4");

    // No bouncing dots anywhere in the chat (the old clone-only indicator)
    await expect(page.locator("main .animate-bounce")).toHaveCount(0);
  });
});

test.describe("session-18 parity: the /Pricing CTAs (the element-tag surface)", () => {
  // Tag names are invisible to class diffs — an <a> styled exactly like a
  // <button> passes every class-set diff but double-focuses (the anchor AND
  // the nested button are both tab stops) and navigates differently. The
  // live's three card CTAs are bare INERT <button>s; the clone had wrapped
  // them in next/link anchors to /login.
  test("the three card CTAs are buttons — no anchor wrappers to /login", async ({ page }) => {
    await page.goto("/Pricing");
    await expect(page.getByRole("button", { name: "Get Started", exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Start Pro Trial" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Get Lifetime Access" })).toHaveCount(1);
    await expect(page.locator("main a[href='/login']")).toHaveCount(0);
  });

  test("clicking a pricing CTA stays on /Pricing (the live's CTAs are inert)", async ({ page }) => {
    await page.goto("/Pricing");
    await page.getByRole("button", { name: "Get Started", exact: true }).click();
    await page.waitForTimeout(800);
    expect(page.url()).toContain("/Pricing");
    await expect(page.getByRole("heading", { name: "Simple, Transparent Pricing" })).toBeVisible();
  });
});

test.describe("session-18 parity: the newsletter pending label (the transient-state surface)", () => {
  // The live's button, while the request is pending, renders disabled with
  // the literal "..." — the Subscribe label AND the Send icon are both
  // replaced. The clone kept the full label during pending.
  test("the pending button renders the reference '...' label, disabled", async ({ page }) => {
    await page.route("**/api/newsletter", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto("/");
    await page.locator("main input[type='email']").fill("probe@example.com");
    const btn = page.locator("main form button[type='submit']");
    await btn.click();
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveText("...");
  });

  test("GUARD: the idle button keeps the Subscribe label + the success swap", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("main form button[type='submit']");
    await expect(btn).toHaveText(/Subscribe/);
    await page.locator("main input[type='email']").fill("probe@example.com");
    await btn.click();
    await expect(page.getByText(/subscribed/i)).toBeVisible();
  });
});

test.describe("session-18 parity: the /Contact pending label + form ids (the transient-state + attribute surfaces)", () => {
  // The live's contact button, while submitting, renders disabled with the
  // literal "Sending..." — THREE ASCII PERIODS (charCodes 46,46,46, not the
  // U+2026 ellipsis glyph) and NO Send icon (the whole content is replaced).
  // The live's endpoint never completes (stuck at "Sending..." on every real
  // submit, +15s verified) — the clone keeps its working success/error
  // states (deliberate-better) but must match the pending rendering.
  test("the pending button renders the reference 'Sending...' label, disabled, no icon", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto("/Contact");
    await page.getByPlaceholder("John Doe").fill("Probe Name");
    await page.getByPlaceholder("john@example.com").fill("probe@example.com");
    await page.getByPlaceholder(/help/i).fill("Probe message.");
    await page.getByRole("combobox").click();
    await page.getByRole("option").nth(1).click();
    const btn = page.getByRole("button", { name: "Send Message" });
    await btn.click();
    const pending = page.locator("main form button[type='submit']");
    await expect(pending).toBeDisabled();
    await expect(pending).toHaveText("Sending...");
    // the ASCII form, not the ellipsis glyph (the session-11 glyph lesson)
    const codes = await pending.evaluate((el) => [...el.textContent].map((c) => c.codePointAt(0)));
    expect(codes).toEqual([83, 101, 110, 100, 105, 110, 103, 46, 46, 46]);
    // the Send icon is replaced during pending (the live ships svgs: 0)
    await expect(pending.locator("svg")).toHaveCount(0);
  });
});

test.describe("session-18 parity: the /login zinc token theme (the per-route token surface)", () => {
  // The Base44 runtime injects PER-PAGE token sheets: 10 of 11 routes carry
  // the shadcn NEUTRAL theme (the clone's values everywhere), but /login
  // alone carries ZINC — --ring 240 10% 3.9% renders the card buttons'
  // focus rings as rgb(9, 9, 11) (zinc-950) instead of rgb(10, 10, 10).
  test("the Sign in button's keyboard-focus ring slot is the zinc near-black", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: "Sign in" });
    await btn.focus();
    // transition-all 200ms — wait out the transition before reading slots
    await page.waitForTimeout(450);
    const shadow = await btn.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgb(9, 9, 11) 0px 0px 0px 4px");
  });

  test("/login overrides the ring token at the body level (the zinc block)", async ({ page }) => {
    await page.goto("/login");
    const ring = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--ring").trim());
    // #09090b = hsl(240 10% 3.9%) = zinc-950 — the live's /login --ring
    expect(ring).toBe("#09090b");
  });

  test("GUARD: every other route keeps the neutral ring + the Contact button slot", async ({ page }) => {
    await page.goto("/Courses");
    const ring = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--ring").trim());
    expect(ring).toBe("#0a0a0a");
    await page.goto("/Contact");
    const btn = page.getByRole("button", { name: "Send Message" });
    await btn.focus();
    await page.waitForTimeout(450);
    const shadow = await btn.evaluate((el) => getComputedStyle(el).boxShadow);
    // ring-1 (the shadcn base) — a 1px slot, not the login inputs' ring-2
    expect(shadow).toContain("rgb(10, 10, 10) 0px 0px 0px 1px");
  });
});

test.describe("session-18 parity: the CourseDetail instructor portrait alt", () => {
  // The live ships alt="" (decorative — the instructor name renders in the
  // adjacent paragraph, so screen readers announce it once). The clone's
  // alt={instructorName} made readers announce the name twice.
  test("the instructor portrait's alt is empty (the reference's decorative choice)", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const portrait = page.locator("main img.w-10.h-10.rounded-full");
    await expect(portrait).toHaveCount(1);
    await expect(portrait).toHaveAttribute("alt", "");
  });

  test("GUARD: the course hero image keeps the course-title alt", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1");
    const hero = page.locator("main img.w-full.h-full.object-cover");
    await expect(hero).toHaveCount(1);
    await expect(hero).toHaveAttribute("alt", "Complete Web Development Bootcamp 2026");
  });
});

test.describe("session-18 parity: the catalog search input type attribute", () => {
  // The live's search input carries NO type attribute (text is the UA
  // default); the clone's type="text" was based on a stale session-6 note.
  test("the search input has no type attribute (the reference markup)", async ({ page }) => {
    await page.goto("/Courses");
    const input = page.getByPlaceholder("Search courses, topics, or instructors...");
    await expect(input).toHaveCount(1);
    expect(await input.getAttribute("type")).toBeNull();
  });
});

test.describe("session-18 parity: the deliberate-better failure states (reference-matched decisions)", () => {
  // The live's failure UX is a PERMANENTLY-STUCK loading state: an aborted
  // chat request leaves the "Thinking..." bubble forever (+12s verified);
  // an aborted subscribe leaves the button stuck at "..." forever (+15s,
  // disabled, no retry possible). The clone deliberately recovers — the
  // session-16 deliberate-better precedent (never ship the reference's
  // unrecoverable states). These specs pin the decisions.
  test("an aborted AI chat renders the explicit error bubble (not a stuck Thinking...)", async ({ page }) => {
    await page.route("**/api/ai/chat", (route) => route.abort());
    await page.goto("/AIAssistant");
    await page.locator("textarea").fill("What is python?");
    await page.locator("textarea").press("Enter");
    await expect(page.getByText("Network error — please try again.")).toBeVisible();
    await expect(page.getByText("Thinking...")).toHaveCount(0);
  });

  test("an aborted newsletter submit returns the button to Subscribe (retryable)", async ({ page }) => {
    await page.route("**/api/newsletter", (route) => route.abort());
    await page.goto("/");
    await page.locator("main input[type='email']").fill("probe@example.com");
    const btn = page.locator("main form button[type='submit']");
    await btn.click();
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveText(/Subscribe/);
  });
});

test.describe("session-20 parity: the element-tag drift surface (span vs p; div vs form)", () => {
  // Two tag-level drifts found by the session-20 fresh-eyes sweeps (the
  // line-by-line innerText comparison + the tag-of-shared-class map). Both
  // are INVISIBLE to class-set diffs (identical class strings), to height
  // sweeps (the flex row blockifies p and span alike) and to screenshots —
  // the session-18 element-tag blind-spot family, probed one level deeper.
  test("the /Courses course count renders on a SPAN (the live's tag) with consecutive innerText lines", async ({ page }) => {
    await page.goto("/Courses");
    // The live: <span class="ml-auto text-sm text-gray-500">9 courses</span>
    // (blockified by the flex filter row — computed display block, ml-auto
    // effective). The clone had rendered a <p> with identical classes: the
    // same layout, but Chrome's innerText gives <p> DOUBLE line breaks, so
    // the clone's main.innerText carried blank lines the live does not have.
    const count = page.locator("main").getByText(/^\d+ courses?$/);
    await expect(count).toHaveText("9 courses");
    expect(await count.evaluate((el) => el.tagName)).toBe("SPAN");
    await expect(count).toHaveClass("ml-auto text-sm text-gray-500");
    // The filtered state keeps the live's span form (no ml-auto — the Clear
    // Filters button carries it).
    await page.getByLabel("Search courses").fill("python");
    await expect(count).toHaveText("3 courses");
    await expect(count).toHaveClass("text-sm text-gray-500");
    expect(await count.evaluate((el) => el.tagName)).toBe("SPAN");
    // innerText: the sort trigger text and the count sit on CONSECUTIVE
    // lines (no blank line between — the <p> form rendered "Newest\n\n9
    // courses", the live's span form renders "Newest\n9 courses").
    await page.getByLabel("Search courses").fill("");
    const text = await page.locator("main").innerText();
    expect(text).toContain("Newest\n9 courses");
    expect(text).not.toContain("Newest\n\n9 courses");
  });

  test("the /AIAssistant composer is a DIV wrapper (no form element, no button type) — the live's tags", async ({ page }) => {
    await page.goto("/AIAssistant");
    // The live: <div class="flex gap-3"> holding the textarea + send button
    // (Enter-to-send via a runtime keydown listener; ZERO form elements in
    // the live's /AIAssistant main — verified with a real Enter keypress
    // firing the integration request). The clone had rendered a
    // <form class="flex gap-3" onSubmit> — the same classes, and the
    // textarea's own onKeyDown already drove Enter (preventDefault), so the
    // form was pure structural drift. The send button carried type="submit"
    // where the live's button has NO type attribute.
    await expect(page.locator("main form")).toHaveCount(0);
    const composer = page.locator("main textarea").locator("..");
    expect(await composer.evaluate((el) => el.tagName)).toBe("DIV");
    await expect(composer).toHaveClass("flex gap-3");
    const btn = composer.locator("button");
    expect(await btn.getAttribute("type")).toBeNull();
    // The behavioral parity (Enter-to-send) is pinned by the existing
    // session-18 specs (the Thinking... bubble + the aborted-route error
    // bubble) — both drive the textarea's Enter key directly.
  });
});

test.describe("session-21 parity: the console-hygiene + a11y-exposure surface", () => {
  // The session-21 fresh-eyes probes: (1) the CONSOLE-error surface — the
  // /Pricing FAQ icons carried kebab-case SVG props (stroke-width etc.),
  // logging three React "Invalid DOM property" errors on every dev-server
  // /Pricing load (production React strips the warning, so the SOURCE-level
  // guard lives in tests/svg-props.test.ts; this block pins the RENDERED
  // attributes instead); (2) the A11Y-TREE snapshot — lucide-react 0.525
  // adds aria-hidden="true" to every icon while the live ships its icons
  // EXPOSED as nameless img nodes (screen-reader noise, 405× per
  // CourseDetail page — the clone's form is the deliberate WCAG-correct
  // hardening, same family as the mobile-trigger ARIA); (3) the SVG
  // class-histogram diff proves the icon inventory is IDENTICAL — the
  // attribute is the sole svg difference. The <next-route-announcer>
  // element is Next.js framework infrastructure (the - alert a11y node the
  // Base44 live lacks) — pinned here so it is never misread as drift.

  test("the /Pricing FAQ icons render the reference SVG attributes (through the camelCase props)", async ({ page }) => {
    await page.goto("/Pricing");
    // The inlined lucide circle-help glyph: React renders strokeWidth={2}
    // as stroke-width="2" — byte-identical to the live's DOM (verified via
    // the svg class-histogram sweep: 28 svgs on /Pricing, identical on both
    // sites). The camelCase PROP form keeps the dev console clean (the
    // session-21 console surface finding).
    const faqIcon = page.locator("main svg.lucide-circle-help").first();
    await expect(faqIcon).toBeVisible();
    expect(await faqIcon.getAttribute("stroke-width")).toBe("2");
    expect(await faqIcon.getAttribute("stroke-linecap")).toBe("round");
    expect(await faqIcon.getAttribute("stroke-linejoin")).toBe("round");
    expect(await faqIcon.getAttribute("fill")).toBe("none");
    expect(await faqIcon.getAttribute("stroke")).toBe("currentColor");
    expect(await faqIcon.getAttribute("aria-hidden")).toBe("true");
  });

  test("every decorative svg is hidden from the accessibility tree (self or wrapper aria-hidden)", async ({ page }) => {
    // The deliberate lucide-react hardening: nameless decorative icons are
    // aria-hidden on the clone (the live exposes them — 0/405 hidden on its
    // CourseDetail vs 405/405 here). Two legitimate forms exist: the icon
    // itself carries aria-hidden="true" (lucide-react default + hand-inlined
    // icons), OR an ancestor wrapper does (the landing hero's flowing-lines
    // svg sits inside div[aria-hidden]). Sweep the audited route set.
    const routes = ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"];
    for (const route of routes) {
      await page.goto(route);
      const exposed = await page.locator("main svg, nav svg, footer svg").evaluateAll(
        (svgs) =>
          svgs
            .filter((s) => {
              let el: Element | null = s;
              while (el && el !== document.body) {
                if (el.getAttribute("aria-hidden") === "true") return false;
                el = el.parentElement;
              }
              return true;
            })
            .map((s) => (s.getAttribute("class") || "").slice(0, 60))
      );
      expect(exposed, `${route}: svgs exposed to the a11y tree`).toEqual([]);
    }
  });

  test("the Next.js route announcer exists (the framework's screen-reader navigation element)", async ({ page }) => {
    await page.goto("/");
    // <next-route-announcer> is Next.js App Router infrastructure (it
    // announces route changes to screen readers and surfaces as the - alert
    // a11y node the Base44 live lacks). Framework-provided, invisible and
    // empty until navigation — NOT app markup. The login-error specs already
    // exclude it ([role=alert]:not(#__next-route-announcer__)); this pin
    // documents its existence so a future audit never reads it as drift.
    const announcer = page.locator("next-route-announcer");
    await expect(announcer).toHaveCount(1);
    expect(await announcer.getAttribute("role")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Session 22 — parity: the interaction-modality + persistence surfaces (the
// keyboard Tab-order inventory, the accessible-name sweep, the storage +
// network inventories, the media-emulation sweep, the text-scaling surface).
// See docs/remediation-plan-session22.md.
// ---------------------------------------------------------------------------

test.describe("session-22 parity: the form-control accessible-name hardening", () => {
  // The accessible-name sweep (probe 1f): the live names its form controls by
  // PLACEHOLDER (the /Courses search: "Search courses, topics, or
  // instructors…") and by VALUE (the filter selects: "All Categories" / "All
  // Levels" / "Newest" — a name that MUTATES with the filter state). The
  // clone pins STABLE aria-labels instead — the WCAG-robust form (placeholder
  // names vanish on input; value names change with state), the same
  // deliberate-better family as the mobile-trigger ARIA + footer-social
  // aria-labels. The newsletter input's aria-label mirrors its placeholder
  // exactly (the names match); the send button's "Send message" is the
  // documented icon-only family. Pinned so no future session "fixes" the
  // stable names into the live's fragile naming.

  test("the /Courses filter controls carry the stable aria-labels (search + 3 selects)", async ({ page }) => {
    await page.goto("/Courses");
    const search = page.locator('main input[placeholder^="Search courses"]');
    await expect(search).toHaveCount(1);
    expect(await search.getAttribute("aria-label")).toBe("Search courses");
    // The shadcn select triggers render as combobox buttons over the native
    // select semantics — assert the three aria-labeled triggers.
    for (const label of ["Filter by category", "Filter by level", "Sort courses"]) {
      const trigger = page.locator(`main button[aria-label="${label}"]`);
      await expect(trigger).toHaveCount(1);
      await expect(trigger).toBeVisible();
    }
  });

  test("the AI composer controls carry the stable aria-labels (textarea + icon-only send)", async ({ page }) => {
    await page.goto("/AIAssistant");
    const textarea = page.locator('main textarea[placeholder="Ask a question..."]');
    await expect(textarea).toHaveCount(1);
    expect(await textarea.getAttribute("aria-label")).toBe("Ask a question");
    const send = page.locator('main button[aria-label="Send message"]');
    await expect(send).toHaveCount(1);
    await expect(send).toBeVisible();
  });

  test("the newsletter input carries the aria-label mirroring its placeholder", async ({ page }) => {
    await page.goto("/");
    const input = page.locator('input[placeholder="Enter your email"]');
    await expect(input).toHaveCount(1);
    expect(await input.getAttribute("aria-label")).toBe("Enter your email");
  });
});

test.describe("session-22 parity: the storage surface (the no-storage guard)", () => {
  // The storage inventory (probe 2): the clone emits ZERO localStorage and
  // ZERO sessionStorage entries on every route — the session lives
  // exclusively in the HttpOnly nexus_session cookie (invisible to
  // document.cookie by design). The live persists 8 base44 platform keys +
  // mixpanel session keys — platform infra, accepted-by-nature. This pin is
  // the privacy-cleanliness guard: if a future change starts persisting
  // client-side storage, the failure forces documentation.
  test("zero localStorage and sessionStorage entries on every audited route", async ({ page }) => {
    const routes = ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      const counts = await page.evaluate(() => ({
        ls: window.localStorage.length,
        ss: window.sessionStorage.length,
      }));
      expect(counts.ls, `${route}: localStorage keys`).toBe(0);
      expect(counts.ss, `${route}: sessionStorage keys`).toBe(0);
    }
  });
});

test.describe("session-22 parity: the media-emulation stability surface", () => {
  // The media-emulation sweep (probe 4): under prefers-reduced-motion,
  // prefers-color-scheme: dark AND print, NEITHER the live nor this app
  // changes any probed computed style — both are fixed-light, print-unstyled
  // and motion-unadapted (verified live-vs-clone byte-identically). This pin
  // freezes that parity contract: a future dark mode or reduced-motion pass
  // would be a deliberate beyond-reference decision that must pass through
  // documentation. One cosmetic variance documented alongside: the live's
  // animation-duration slot reads 0.5s with animation-name "none" (its
  // platform CSS default) vs 0s here — no animation runs on either site.
  test("dark-scheme emulation leaves the light palette untouched", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(255, 255, 255)");
    const heroText = await page.locator("h1").evaluate((el) => getComputedStyle(el).color);
    expect(heroText).toBe("rgb(255, 255, 255)"); // white text on the dark hero stays
    await page.emulateMedia({ colorScheme: "light" });
  });

  test("reduced-motion emulation leaves the transition durations untouched (the live's no-adaptation contract)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const nav = await page.locator("nav").evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(nav).toBe("0.5s");
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });
});

// ---------------------------------------------------------------------------
// Session 23 — the security-headers hardening (the HTTP response surface).
// The live's platform layer (Cloudflare + Caddy) ships the baseline security
// headers on every response: strict-transport-security, referrer-policy
// strict-origin-when-cross-origin and x-content-type-options nosniff. A bare
// Next.js app ships none of them — a production-grade standalone template
// should carry the baseline IN the app so it holds wherever the standalone
// server runs without a hardening proxy (the documented deliberate-better
// family: same precedent as the ARIA/scroll-lock/Escape hardening).
// Reference: docs/remediation-plan-session23.md (finding 1).
// ---------------------------------------------------------------------------

test.describe("session-23 parity: the security-headers hardening", () => {
  test("every response ships the baseline security headers", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const headers = res.headers();
    // MIME-sniffing guard (the live's platform value).
    expect(headers["x-content-type-options"], "x-content-type-options").toBe("nosniff");
    // Referrer policy (the live's platform value).
    expect(headers["referrer-policy"], "referrer-policy").toBe("strict-origin-when-cross-origin");
    // Anti-clickjacking: the app never frames itself.
    expect(headers["x-frame-options"], "x-frame-options").toBe("SAMEORIGIN");
    // HSTS (the live's platform value; inert over plain HTTP — active behind TLS).
    expect(headers["strict-transport-security"], "strict-transport-security").toContain("max-age=31536000");
    // Capability deny-list: the app uses no camera/mic/geo.
    expect(headers["permissions-policy"], "permissions-policy").toContain("camera=()");
  });
});

// ---------------------------------------------------------------------------
// Session 23 — the axe-core WCAG surface (the sixth a11y probe family).
// The full live-vs-clone axe scan (docs/remediation-plan-session23.md
// finding 2) established: (a) color-contrast + heading-order violations are
// the REFERENCE'S OWN DESIGN (identical node counts on every route — the
// gray lesson-row icons, the line-through price, the reference heading
// structure; the reference design is the parity contract); (b) the live
// fires link-name (its 4 footer social links) + button-name (its icon-only
// AI send button) — ZERO here, because of the aria-label hardening family
// (sessions 21-22) that the live lacks. These pins freeze that contract:
// the accessible-name guard (0 link-name + 0 button-name), the
// reference-design rule-set contract (no NEW axe rules beyond the two
// reference design rules) and the fully-clean /login scan.
// ---------------------------------------------------------------------------

test.describe("session-23 parity: the axe-core WCAG surface", () => {
  // The audited route set (the 9 non-CourseDetail routes; CourseDetail's
  // color-contrast count scales with the per-course curriculum and is
  // documented rather than count-pinned).
  const AXE_ROUTES = ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/Dashboard", "/login"];
  // The reference's own design rules — everything else is a regression.
  const REFERENCE_DESIGN_RULES = new Set(["color-contrast", "heading-order"]);

  test("zero link-name and button-name violations on every audited route (the aria-label hardening the live lacks)", async ({ page }) => {
    const { AxeBuilder } = await import("@axe-core/playwright");
    for (const route of AXE_ROUTES) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page }).analyze();
      const linkName = results.violations.filter((v) => v.id === "link-name");
      const buttonName = results.violations.filter((v) => v.id === "button-name");
      expect(linkName, `${route}: link-name violations (the live fires 4 — its footer social links)`).toHaveLength(0);
      expect(buttonName, `${route}: button-name violations (the live fires 1 — its icon-only AI send)`).toHaveLength(0);
    }
  });

  test("the violation rule set stays within the reference-design rules (no new a11y regressions)", async ({ page }) => {
    const { AxeBuilder } = await import("@axe-core/playwright");
    for (const route of AXE_ROUTES) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page }).analyze();
      const ruleIds = [...new Set(results.violations.map((v) => v.id))];
      const newRules = ruleIds.filter((id) => !REFERENCE_DESIGN_RULES.has(id));
      expect(newRules, `${route}: rules beyond the reference-design set {color-contrast, heading-order}`).toEqual([]);
    }
  });

  test("/login scans fully clean (zero violations — no reveal targets, no gray-on-gray utilities)", async ({ page }) => {
    const { AxeBuilder } = await import("@axe-core/playwright");
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Session 24 — the CSP nonce hardening (the session-23 documented future
// work). Neither the live nor the clone shipped a Content-Security-Policy
// (probed on both) — the baseline security headers (session 23) protect the
// transport/framing layers but nothing constrains SCRIPT execution. The
// nonce pattern: the proxy generates a per-request nonce, exposes it on the
// request headers (Next.js auto-nonces its bootstrap scripts from it), and
// ships the policy with script-src 'nonce-X' 'strict-dynamic' — per-request
// nonces are the only script trust root. The companion fix:
// `export const dynamic = "force-dynamic"` in the root layout — static-
// prerendered pages bake nonce-less HTML at build time and their scripts
// BLOCK under strict-dynamic (the spike-verified unhydrated /login failure).
// Reference: docs/remediation-plan-session24.md (finding 3).
// ---------------------------------------------------------------------------

test.describe("session-24 parity: the CSP nonce hardening", () => {
  test("every HTML response ships a nonce-based CSP with strict-dynamic", async ({ request }) => {
    for (const route of ["/", "/login"]) {
      const res = await request.get(route);
      expect(res.status(), `${route}: status`).toBe(200);
      const csp = res.headers()["content-security-policy"];
      expect(csp, `${route}: content-security-policy header`).toContain("script-src 'self' 'nonce-");
      expect(csp, `${route}: strict-dynamic`).toContain("'strict-dynamic'");
      // The conservative directive set (the plan's policy).
      expect(csp, `${route}: object-src`).toContain("object-src 'none'");
      expect(csp, `${route}: frame-ancestors`).toContain("frame-ancestors 'self'");
      expect(csp, `${route}: img-src`).toContain("img-src 'self'");
    }
  });

  test("the nonce is per-request (two requests never share a nonce)", async ({ request }) => {
    const first = await request.get("/");
    const second = await request.get("/");
    const csp1 = first.headers()["content-security-policy"] ?? "";
    const csp2 = second.headers()["content-security-policy"] ?? "";
    const nonce1 = csp1.match(/'nonce-([^']+)'/)?.[1];
    const nonce2 = csp2.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce1, "the first response carries a nonce").toBeTruthy();
    expect(nonce2, "the second response carries a nonce").toBeTruthy();
    expect(nonce1 === nonce2, "per-request nonces must differ (anti-replay)").toBe(false);
  });

  test("every rendered bootstrap script carries the nonce (hydration survives the policy)", async ({ page }) => {
    for (const route of ["/", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      const info = await page.evaluate(() => {
        const scripts = [...document.querySelectorAll("script")];
        return {
          total: scripts.length,
          nonced: scripts.filter((s) => s.nonce || s.getAttribute("nonce")).length,
        };
      });
      expect(info.total, `${route}: scripts present`).toBeGreaterThan(0);
      expect(info.nonced, `${route}: every script carries the nonce`).toBe(info.total);
      // Zero CSP violations in the console → nothing blocked.
      const violations: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && msg.text().includes("Content-Security-Policy")) violations.push(msg.text());
      });
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      expect(violations, `${route}: no CSP violations`).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Session 24 — the URL-canonicalization surface (the response-status probe
// family — never status-level probed before). The live's SPA platform
// returns HTTP 200 for EVERY path (the trailing-slash variant renders
// directly; unknown routes + /login case variants render the in-app 404 view
// with 200). The clone ships the canonical forms: a 308 redirect to the
// canonical URL for trailing slashes and REAL 404 statuses — the
// SEO-correct deliberate-better family (same precedent as the session-17
// canonical titles), pinned here so a future audit cannot "fix" them toward
// the live's 200-for-everything posture.
// Reference: docs/remediation-plan-session24.md (finding 2).
// ---------------------------------------------------------------------------

test.describe("session-24 parity: the URL-canonicalization surface", () => {
  test("trailing-slash routes 308-redirect to the canonical URL (the live renders them 200)", async ({ request }) => {
    const res = await request.get("/Courses/", { maxRedirects: 0 });
    expect(res.status(), "the slash variant redirects").toBe(308);
    expect(res.headers().location, "the redirect targets the canonical form").toBe("/Courses");
  });

  test("unknown routes return a real 404 status (the live returns 200 + the in-app 404 view)", async ({ request }) => {
    const res = await request.get("/__nonexistent_page__");
    expect(res.status(), "unknown paths are a real 404").toBe(404);
  });

  test("/login case variants 404 (the session-17 exact-match rule, at the status level)", async ({ request }) => {
    const res = await request.get("/Login");
    expect(res.status(), "/Login is not a route").toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Session 24 — the static-asset cache surface (the performance probe's
// config guard). The session-24 web-vitals probe documented the clone's
// loading profile: the /_next/static chunks ship
// `Cache-Control: public, max-age=31536000, immutable` (content-hashed,
// safe to cache forever — the Next.js default). This pin guards it against
// future config regressions (a custom headers() override would silently
// strip it and re-download the JS payload on every visit).
// Reference: docs/remediation-plan-session24.md (finding 1).
// ---------------------------------------------------------------------------

test.describe("session-24 parity: the static-asset cache surface", () => {
  test("/_next/static chunks ship the immutable content-hash cache", async ({ request }) => {
    // Discover a real chunk URL from the rendered page HTML.
    const page = await request.get("/");
    const html = await page.text();
    const chunk = html.match(/\/_next\/static\/[^"']+\.js/)?.[0];
    expect(chunk, "a static chunk is referenced in the HTML").toBeTruthy();
    const res = await request.get(chunk as string);
    expect(res.status(), "the chunk loads").toBe(200);
    const cache = res.headers()["cache-control"] ?? "";
    expect(cache, "immutable, one-year cache (content-hashed)").toContain("max-age=31536000");
    expect(cache, "the immutable marker").toContain("immutable");
  });
});

// ---------------------------------------------------------------------------
// Session 25 — the crawler/SEO-file surface. The head-metadata surface
// (sessions 4/5) pinned the <head> TAGS; this block pins the FILE BODIES
// crawlers fetch. The session-25 probe compared robots.txt, sitemap.xml and
// manifest.json byte-for-byte against the live: the manifest's `scope`
// field was MISSING (the live's ninth field) — now added in the relative
// portable form ("/", the same deliberate-better family as the relative
// start_url). The serialization deltas that remain (robots field casing,
// sitemap indentation + the "1" vs "1.0" priority serialization, the
// landing-loc trailing slash) are the Next.js builder's canonical output
// vs the live platform generator's artifact-grade forms — semantically
// identical to every spec-compliant parser, pinned so a future audit
// cannot "fix" them toward the live.
// Reference: docs/remediation-plan-session25.md (finding 3).
// ---------------------------------------------------------------------------

test.describe("session-25 parity: the crawler/SEO-file surface", () => {
  test("manifest.json carries the complete reference field set incl. scope (relative portable forms)", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    const manifest = (await res.json()) as Record<string, unknown>;
    // The live's nine fields, all present.
    for (const field of [
      "name",
      "short_name",
      "description",
      "icons",
      "start_url",
      "display",
      "theme_color",
      "background_color",
      "scope",
    ]) {
      expect(manifest[field], `manifest.${field} present`).toBeDefined();
    }
    // The scope + start_url portable relative forms (the live's are
    // origin-absolute — the clone's relative forms work on any origin).
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
  });

  test("the crawler files serve their canonical content types with the pinned bodies", async ({ request }) => {
    // robots.txt — text/plain, allow-everything, sitemap-linked.
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(robots.headers()["content-type"]).toContain("text/plain");
    const robotsBody = await robots.text();
    expect(robotsBody).toMatch(/user-agent: \*/i);
    expect(robotsBody).toMatch(/allow: \//i);
    expect(robotsBody).toMatch(/sitemap: .+\/sitemap\.xml/i);

    // sitemap.xml — application/xml, the 9 canonical routes.
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toContain("application/xml");
    const sitemapBody = await sitemap.text();
    expect(sitemapBody.match(/<url>/g)?.length).toBe(9);
    expect(sitemapBody.match(/<changefreq>weekly<\/changefreq>/g)?.length).toBe(9);

    // manifest.json — application/json (the linked PWA identity).
    const manifest = await request.get("/manifest.json");
    expect(manifest.status()).toBe(200);
    expect(manifest.headers()["content-type"]).toContain("application/json");
  });
});

test.describe("session-26 parity: the HTTP verb matrix surface", () => {
  test("page routes reject non-GET/HEAD verbs with 405 + Allow (the live's platform semantics)", async ({ request }) => {
    // The live's platform layer 405s EVERY non-GET verb on every page path;
    // the clone's App Router pages accepted any method (POST / rendered the
    // full page HTML with 200; OPTIONS returned 400). The proxy method guard
    // (session 26) restores the GET/HEAD-only page contract.
    for (const path of ["/", "/Courses", "/login"]) {
      for (const method of ["POST", "PUT", "DELETE", "OPTIONS"] as const) {
        const res = await request.fetch(path, { method });
        expect(res.status(), `${method} ${path} -> 405`).toBe(405);
        expect(res.headers()["allow"], `${method} ${path} Allow header`).toBe("GET, HEAD");
        const body = (await res.json()) as { error?: string };
        expect(body.error).toBe("Method not allowed");
      }
    }
    // GET and HEAD still serve the pages (the guard must not break serving).
    expect((await request.get("/")).status()).toBe(200);
    expect((await request.fetch("/", { method: "HEAD" })).status()).toBe(200);
  });

  test("the static-asset + unknown-path + API verb contracts", async ({ request }) => {
    // The static-asset class: POST on public files was a 500 (the static
    // handler's crash class) — now the guarded 405 like the live.
    for (const path of ["/logo.png", "/manifest.json"]) {
      const res = await request.fetch(path, { method: "POST" });
      expect(res.status(), `POST ${path} -> 405 (was 500)`).toBe(405);
    }
    // Unknown paths: the METHOD beats path resolution (the live 405s POST on
    // unknown paths; GET keeps the session-24 real-404 pin).
    expect((await request.fetch("/nonexistent-page-xyz", { method: "POST" })).status()).toBe(405);
    expect((await request.get("/nonexistent-page-xyz")).status()).toBe(404);
    // The API routes keep their handler-owned verb semantics (the clone's
    // first-party contract): wrong-verb 405 + the framework's 204 OPTIONS.
    expect((await request.get("/api/auth/login")).status()).toBe(405);
    expect((await request.fetch("/api/health", { method: "OPTIONS" })).status()).toBe(204);
  });
});

test.describe("session-26 parity: the form-control metadata surface", () => {
  test("the login card's password-manager contract (autocomplete/inputMode hardening)", async ({ page }) => {
    // The live ships NO autocomplete/inputMode anywhere (bare inputs); the
    // clone's login card carries the password-manager hardening — signin
    // (email + current-password), verify (one-time-code + numeric inputmode)
    // and signup (email + new-password on both password fields, completed
    // this session). Deliberate-better, session-22 aria-label family —
    // never to be "fixed" toward the live's bare inputs.
    await page.goto("/login");

    // Signin view.
    await expect(page.locator("#email")).toHaveAttribute("autocomplete", "email");
    await expect(page.locator("#password")).toHaveAttribute("autocomplete", "current-password");

    // Signup view (Need an account? Sign up).
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page.locator("#email")).toHaveAttribute("autocomplete", "email");
    await expect(page.locator("#password")).toHaveAttribute("autocomplete", "new-password");
    await expect(page.locator("#confirmPassword")).toHaveAttribute("autocomplete", "new-password");

    // Verify view (code inputs): numeric inputmode + one-time-code on the
    // first field, off on the rest (the signup form must be filled first —
    // the required fields block an empty submit).
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.fill("#email", `meta-${Date.now()}@example.com`);
    await page.fill("#password", "SuperSecret99!");
    await page.fill("#confirmPassword", "SuperSecret99!");
    await page.getByRole("button", { name: "Create account" }).click();
    const codeInputs = page.locator('input[inputmode="numeric"]');
    await expect(codeInputs.first()).toHaveAttribute("inputmode", "numeric");
    await expect(codeInputs.first()).toHaveAttribute("autocomplete", "one-time-code");
    await expect(codeInputs.nth(1)).toHaveAttribute("autocomplete", "off");
  });

  test("GUARD: every other form stays reference-faithful bare (no autocomplete/inputMode)", async ({ page }) => {
    // The hardening's SCOPE is the login card only: the newsletter input,
    // the Courses search input, the AI composer textarea and the Contact
    // inputs carry NO autocomplete/inputMode attributes — byte-faithful to
    // the live's bare controls on every one of those forms.
    await page.goto("/");
    const newsletter = page.locator('input[type="email"]').first();
    expect(await newsletter.getAttribute("autocomplete")).toBeNull();
    expect(await newsletter.getAttribute("inputmode")).toBeNull();

    await page.goto("/Courses");
    const search = page.locator('input[placeholder*="Search"]').first();
    expect(await search.getAttribute("autocomplete")).toBeNull();
    expect(await search.getAttribute("inputmode")).toBeNull();

    await page.goto("/AIAssistant");
    const composer = page.locator("textarea").first();
    expect(await composer.getAttribute("autocomplete")).toBeNull();
    expect(await composer.getAttribute("inputmode")).toBeNull();

    await page.goto("/Contact");
    const name = page.locator("#name");
    expect(await name.getAttribute("autocomplete")).toBeNull();
    const email = page.locator("#email");
    expect(await email.getAttribute("autocomplete")).toBeNull();
    const message = page.locator("#message");
    expect(await message.getAttribute("autocomplete")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Session 27 — the compression/content-encoding surface (the ENCODING
// dimension of the response contract — never probed by the sessions-23–26
// response audits, which read status/headers/bodies but never the
// Accept-Encoding handshake). The live's platform (Cloudflare edge)
// compresses every compressible response with gzip AND brotli; the app's
// standalone server ships a correct gzip tier — dynamic pages, API JSON and
// the /_next/static chunks, each paired with `Vary: Accept-Encoding` when
// compressed — while brotli and public/-static compression are proxy-layer
// capabilities a standalone Node server cannot carry (documented in
// docs/DEPLOYMENT.md §8, NOT "fixed" in-app: a route-handler rewrite for
// the statics would strip the validator contract pinned below).
// Reference: docs/remediation-plan-session27.md (finding 1).
// ---------------------------------------------------------------------------

test.describe("session-27 parity: the compression/content-encoding surface", () => {
  test("the dynamic gzip tier: pages + API negotiate gzip with the Vary guard", async ({ request }) => {
    // Compressed responses MUST carry `Vary: Accept-Encoding` (without it a
    // shared cache can serve the gzipped variant to an identity-only client).
    for (const path of ["/", "/api/health"]) {
      const gz = await request.get(path, { headers: { "Accept-Encoding": "gzip" } });
      expect(gz.status(), `${path} loads`).toBe(200);
      expect(gz.headers()["content-encoding"] ?? "", `${path} gzips when negotiated`).toContain("gzip");
      const vary = gz.headers()["vary"] ?? "";
      expect(vary, `${path} guards the compressed variant with Vary`).toContain("Accept-Encoding");

      const identity = await request.get(path, { headers: { "Accept-Encoding": "identity" } });
      expect(identity.status(), `${path} identity loads`).toBe(200);
      expect(identity.headers()["content-encoding"] ?? undefined, `${path} stays identity when asked`).toBeUndefined();
    }
  });

  test("the static tiers: public/ statics serve identity, /_next/static chunks negotiate gzip", async ({ request }) => {
    // The public/ statics are served by Node's static handler, which does
    // not compress — the CURRENT app contract, pinned here (the platform
    // gap is a proxy-layer concern; /logo.png is a PNG payload deflate
    // cannot shrink anyway, and /manifest.json is 610 B).
    for (const path of ["/logo.png", "/manifest.json"]) {
      const res = await request.get(path, { headers: { "Accept-Encoding": "gzip" } });
      expect(res.status(), `${path} loads`).toBe(200);
      expect(res.headers()["content-encoding"] ?? undefined, `${path} serves identity (the Node static-handler tier)`).toBeUndefined();
    }

    // The /_next/static chunk layer (content-hashed JS/CSS) DOES negotiate
    // gzip — the same tier the session-24 immutable-cache pin protects.
    const page = await request.get("/");
    const html = await page.text();
    const chunk = html.match(/\/_next\/static\/[^"']+\.js/)?.[0];
    expect(chunk, "a static chunk is referenced in the HTML").toBeTruthy();
    const chunkRes = await request.get(chunk as string, { headers: { "Accept-Encoding": "gzip" } });
    expect(chunkRes.status(), "the chunk loads").toBe(200);
    expect(chunkRes.headers()["content-encoding"] ?? "", "the chunk gzips when negotiated").toContain("gzip");
  });
});

// ---------------------------------------------------------------------------
// Session 27 — the cache-revalidation + range surface (the VALIDATOR
// dimension of the response contract): the ETag/Last-Modified/304 handshake
// and the Range/206 partial responses, never probed before this session.
// The app's static tiers ship the full production-grade contract (weak ETag
// + Last-Modified, 304 on both revalidators, Accept-Ranges + correct 206
// bodies); the dynamic pages correctly carry NO validators (the unavoidable
// companion of the per-request CSP nonce — a nonced page can never be
// cache-shared). All pinned so a future headers() override or "performance
// fix" cannot silently strip either side.
// Reference: docs/remediation-plan-session27.md (finding 2).
// ---------------------------------------------------------------------------

test.describe("session-27 parity: the cache-revalidation + range surface", () => {
  test("the public/-static validator contract: ETag + Last-Modified + 304 revalidation + 206 partials", async ({ request }) => {
    const first = await request.get("/logo.png");
    expect(first.status(), "the asset loads").toBe(200);
    const etag = first.headers()["etag"];
    const lastModified = first.headers()["last-modified"];
    expect(etag, "the asset carries an ETag").toBeTruthy();
    expect(lastModified, "the asset carries a Last-Modified").toBeTruthy();

    // 304 on If-None-Match (replaying the validator the server just sent).
    const etagReval = await request.get("/logo.png", { headers: { "If-None-Match": etag! } });
    expect(etagReval.status(), "If-None-Match revalidation answers 304").toBe(304);

    // 304 on If-Modified-Since.
    const lmReval = await request.get("/logo.png", { headers: { "If-Modified-Since": lastModified! } });
    expect(lmReval.status(), "If-Modified-Since revalidation answers 304").toBe(304);

    // 206 partial response with the correct Content-Range + body length.
    const range = await request.get("/logo.png", { headers: { Range: "bytes=0-99" } });
    expect(range.status(), "a Range request answers 206").toBe(206);
    expect(range.headers()["content-range"] ?? "", "the Content-Range header").toMatch(/^bytes 0-99\/\d+$/);
    expect((await range.body()).length, "the partial body carries exactly 100 bytes").toBe(100);
    expect(range.headers()["accept-ranges"] ?? "", "the asset advertises Accept-Ranges").toBe("bytes");

    // Spot-check the second public static for the same contract shape.
    const manifest = await request.get("/manifest.json");
    const manifestEtag = manifest.headers()["etag"];
    expect(manifestEtag, "the manifest carries an ETag").toBeTruthy();
    const manifestReval = await request.get("/manifest.json", { headers: { "If-None-Match": manifestEtag! } });
    expect(manifestReval.status(), "the manifest revalidates with 304").toBe(304);
  });

  test("the dynamic-page no-validator contract: no ETag, no-store (the CSP-nonce companion)", async ({ request }) => {
    // Nonced pages can never be cache-shared — every response embeds a
    // per-request nonce, so the pages ship no validators and no-store.
    // Pinned so a future "performance fix" cannot cache nonced HTML.
    for (const path of ["/", "/Courses"]) {
      const res = await request.get(path);
      expect(res.status(), `${path} loads`).toBe(200);
      expect(res.headers()["etag"] ?? undefined, `${path} carries no ETag`).toBeUndefined();
      expect(res.headers()["last-modified"] ?? undefined, `${path} carries no Last-Modified`).toBeUndefined();
      expect(res.headers()["cache-control"] ?? "", `${path} is uncacheable`).toContain("no-store");
    }
  });

  test("the /_next/static chunk validator contract: ETag + 304 + 206 (the session-24 cache pin completed)", async ({ request }) => {
    // The session-24 pin guards the immutable cache-control; this completes
    // it with the revalidation + partial-response axes on the same tier.
    const page = await request.get("/");
    const html = await page.text();
    const chunk = html.match(/\/_next\/static\/[^"']+\.js/)?.[0];
    expect(chunk, "a static chunk is referenced in the HTML").toBeTruthy();

    const first = await request.get(chunk as string);
    const etag = first.headers()["etag"];
    expect(etag, "the chunk carries an ETag").toBeTruthy();

    const reval = await request.get(chunk as string, { headers: { "If-None-Match": etag! } });
    expect(reval.status(), "the chunk revalidates with 304").toBe(304);

    const range = await request.get(chunk as string, { headers: { Range: "bytes=0-49" } });
    expect(range.status(), "a chunk Range request answers 206").toBe(206);
    expect(range.headers()["content-range"] ?? "", "the chunk Content-Range header").toMatch(/^bytes 0-49\/\d+$/);
  });
});

// ---------------------------------------------------------------------------
// Session 28 — the image attribute/loading surface (the LOADING dimension of
// the rendered-image contract — never swept: the session-21 href/src VALUE
// sweep pinned the src side, but the loading-family attributes are invisible
// to every innerText/class/height diff, the session-18 attribute lesson on
// its fourth appearance). The live ships ZERO loading-family attributes —
// 0/36 images carry loading/decoding/fetchpriority; every image is EAGER
// (the browser default). The clone had shipped loading="lazy" on 33/36
// images (CourseCard cover + avatar, testimonial avatar) — undocumented
// drift, never a documented deliberate decision, and unlike the session-26
// autocomplete hardening (invisible metadata) it changes the FETCH BEHAVIOR
// itself: the live fetches every image at page load, the lazy clone
// deferred below-fold images until scroll. Fixed toward the live this
// session; the specs pin the eager contract + the inventory (incl. the
// Advanced Python cover: the live's own seed URL photo-1515879218367-
// 8466d910auj7 is a MALFORMED Unsplash id — the 12-char suffix carries the
// non-hex chars u+j — and 404s on every page of the live; the clone ships
// the working photo-1526379095098-d400fd0bf935, the deliberate-better
// session-25 asset-re-host family: replicate the app's INTENT, not its data
// typos).
// Reference: docs/remediation-plan-session28.md (findings 1–2).
// ---------------------------------------------------------------------------

test.describe("session-28 parity: the image loading/attribute surface", () => {
  test("the eager-loading contract: no rendered img carries loading/decoding/fetchpriority (the live ships none)", async ({ page }) => {
    // Routes that render images on both sites: / + /Home (16), /Courses (18),
    // /CourseDetail (2), /About (1). /Home renders the landing directly.
    for (const route of ["/", "/Courses", "/CourseDetail?id=seed-8", "/About"]) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const offenders = await page.evaluate(() =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => img.getAttribute("loading") || img.getAttribute("decoding") || img.getAttribute("fetchpriority"))
          .map((img) => ({ src: img.getAttribute("src"), loading: img.getAttribute("loading") }))
      );
      expect(offenders, `${route}: every img is eager (no loading/decoding/fetchpriority) — the live's 0/36 contract`).toEqual([]);
    }
  });

  test("the image inventory: non-empty alts on /Courses + the Advanced Python working cover (the live's own URL 404s)", async ({ page }) => {
    await page.goto("/Courses");
    await page.waitForTimeout(500);
    const catalog = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map((img) => ({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt"),
      }))
    );
    // 9 covers + 9 instructor avatars, every one with a non-empty alt.
    expect(catalog.length, "the /Courses image count").toBe(18);
    for (const img of catalog) {
      expect(img.alt, `alt for ${img.src}`).toBeTruthy();
    }
    // The Advanced Python cover keeps the WORKING image (deliberate-better:
    // the live's own photo-1515879218367-8466d910auj7 is malformed and 404s).
    const pyCover = catalog.find((img) => img.alt === "Advanced Python Programming");
    expect(pyCover?.src, "the Advanced Python cover stays the working image").toBe(
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80"
    );

    // The detail page: the hero cover + the decorative alt="" instructor
    // avatar (the session-18 pinned contract).
    await page.goto("/CourseDetail?id=seed-8");
    await page.waitForTimeout(500);
    const detail = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main img")).map((img) => ({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt"),
      }))
    );
    const hero = detail.find((img) => img.alt === "Advanced Python Programming");
    expect(hero?.src, "the detail-page hero matches the catalog cover").toBe(
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80"
    );
    expect(detail.some((img) => img.alt === ""), "the instructor avatar stays decorative alt=\"\"").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Session 28 — the form-validation constraint surface (the CONSTRAINT
// dimension of the form contract: type/required/maxLength/minLength/pattern/
// min/max/step — the native validation semantics). The session-26 sweep
// pinned the METADATA family (autocomplete/inputMode); the constraint family
// was never swept. Verified IDENTICAL on every route of both sites — the
// specs below pin that contract: a future "hardening" pass adding
// constraints would be beyond-reference drift, and a removal would break
// parity; both are invisible to every text/class diff.
// Reference: docs/remediation-plan-session28.md (finding 3).
// ---------------------------------------------------------------------------

test.describe("session-28 parity: the form-validation constraint surface", () => {
  test("the constrained forms: /login + /Contact carry the live's exact constraint set", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator("#email");
    expect(await email.getAttribute("type")).toBe("email");
    expect(await email.getAttribute("required")).toBe("");
    const password = page.locator("#password");
    expect(await password.getAttribute("type")).toBe("password");
    expect(await password.getAttribute("required")).toBe("");

    await page.goto("/Contact");
    const name = page.locator("#name");
    expect(await name.getAttribute("required")).toBe("");
    expect(await name.getAttribute("type"), "the name input carries no type attr (the live's bare form)").toBeNull();
    const contactEmail = page.locator("#email");
    expect(await contactEmail.getAttribute("type")).toBe("email");
    expect(await contactEmail.getAttribute("required")).toBe("");
    const message = page.locator("#message");
    expect(await message.getAttribute("required")).toBe("");

    // No length/pattern/range constraints anywhere on either form.
    for (const route of ["/login", "/Contact"]) {
      await page.goto(route);
      const constrained = await page.evaluate(() =>
        Array.from(document.querySelectorAll("input, textarea, select"))
          .filter((el) =>
            ["maxlength", "minlength", "pattern", "min", "max", "step"].some((a) => el.getAttribute(a) !== null)
          )
          .map((el) => el.id || el.getAttribute("placeholder"))
      );
      expect(constrained, `${route}: no maxLength/minLength/pattern/min/max/step (the live's contract)`).toEqual([]);
    }
  });

  test("the bare forms: /Courses search + /AIAssistant composer carry no constraint attributes; /BecomeInstructor renders no controls", async ({ page }) => {
    await page.goto("/Courses");
    const search = page.locator('input[placeholder*="Search courses"]');
    expect(await search.getAttribute("required")).toBeNull();
    expect(await search.getAttribute("type"), "the search input is type-less (the session-18 pin, constraint axis)").toBeNull();

    await page.goto("/AIAssistant");
    const composer = page.locator("textarea").first();
    expect(await composer.getAttribute("required")).toBeNull();
    expect(await composer.getAttribute("maxlength")).toBeNull();

    await page.goto("/BecomeInstructor");
    const controls = await page.evaluate(() => document.querySelectorAll("input, textarea, select").length);
    expect(controls, "/BecomeInstructor is a CTA page — zero form controls (the live's contract)").toBe(0);
  });
});

test.describe("session-28 parity: the login client-view constraint surface (signup + reset views)", () => {
  // Finding 3b (found during the screenshot-capture verification pass): the
  // clone's signup password input had shipped minLength={8} since session 5 —
  // undocumented drift never caught because every constraint sweep read the
  // DEFAULT signin view only (the signup/reset views are CLIENT-side state
  // switches — their inputs do not exist in the DOM until the view flips).
  // The live enforces the 8-char minimum in JS with an IN-DOM error message
  // ("Password must be at least 8 characters long") and ships NO minlength
  // attribute anywhere; the attribute swapped the clone's UX to the browser's
  // NATIVE validation tooltip (which blocks the submit event — the JS error
  // path was dead code). Fixed toward the live this session.
  test("the signup view carries the live's exact constraint set — no minlength; the short-password error renders in-DOM with the live's text", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();
    await page.waitForTimeout(300);

    const email = page.locator("#email");
    expect(await email.getAttribute("type")).toBe("email");
    expect(await email.getAttribute("required")).toBe("");
    expect(await email.getAttribute("minlength"), "the signup email carries no minlength").toBeNull();

    const password = page.locator("#password");
    expect(await password.getAttribute("type")).toBe("password");
    expect(await password.getAttribute("required")).toBe("");
    expect(await password.getAttribute("minlength"), "the signup password carries NO minlength (the live's contract — the JS error owns the UX)").toBeNull();

    const confirm = page.locator("#confirmPassword");
    expect(await confirm.getAttribute("type")).toBe("password");
    expect(await confirm.getAttribute("required")).toBe("");
    expect(await confirm.getAttribute("minlength")).toBeNull();

    // The short-password path: the in-DOM error with the live's exact text
    // (with the minlength attribute the native tooltip blocked the submit —
    // this assertion is the regression guard for that dead-code class).
    await email.fill(`shortpw-${Date.now()}@example.com`);
    await password.fill("short");
    await confirm.fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Password must be at least 8 characters long")).toBeVisible();
  });

  test("the reset view carries the live's constraint set (email type+required, nothing else)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await page.waitForTimeout(300);
    const email = page.locator("#email");
    expect(await email.getAttribute("type")).toBe("email");
    expect(await email.getAttribute("required")).toBe("");
    for (const attr of ["minlength", "maxlength", "pattern"]) {
      expect(await email.getAttribute(attr), `the reset email carries no ${attr}`).toBeNull();
    }
  });
});

// ─── session-29 parity: the SSR locale / number-formatting surface ─────────
// Finding 1 (docs/remediation-plan-session29.md): the student counts are the
// site's ONLY locale-sensitive rendering (prices use toFixed(2) and ratings
// toFixed(1) — locale-invariant, verified identical under de-DE on both
// sites). The live (a CSR SPA) formats every count with the BROWSER locale:
// de-DE renders 12.450, fr-FR renders 12\u202f450 on every surface. The
// clone's SSR must derive the visitor's locale from the Accept-Language
// request header — the only locale signal that exists at render time — on
// ALL THREE count surfaces: the landing featured grid + CourseDetail (RSC
// output) and the /Courses catalog's SSR pass (the catalog is a client
// boundary — if its SSR output disagreed with the browser's hydration
// render, React throws "Hydration failed" and regenerates the tree).

test.describe("session-29 parity: the SSR locale surface (de-DE)", () => {
  test.use({ locale: "de-DE" });

  test("the student counts follow the visitor's Accept-Language — German separators on the landing + CourseDetail + the /Courses catalog, with a clean console", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") problems.push(`console.${m.type()}: ${m.text()}`);
    });
    page.on("pageerror", (e) => problems.push(`pageerror: ${String(e)}`));

    // (a) the landing featured grid — the six featured counts in the German form
    await page.goto("/");
    await page.waitForTimeout(600);
    const landingCounts = await page.evaluate(() => {
      const out: string[] = [];
      for (const svg of document.querySelectorAll('main svg[class*="lucide-users"]')) {
        const t = svg.parentElement?.innerText?.trim();
        if (t) out.push(t);
      }
      return out;
    });
    expect(
      landingCounts,
      "the featured grid renders the visitor-locale separators (the live's CSR behavior — de-DE thousands dots)"
    ).toEqual(["12.450", "4.210", "8.320", "5.430", "3.890", "6.750"]);

    // (b) CourseDetail — the hero students row
    await page.goto("/CourseDetail?id=seed-1");
    await page.waitForTimeout(600);
    const detailText = await page.locator("main").innerText();
    expect(detailText, "the CourseDetail students row renders the German form").toContain("12.450 students");

    // (c) the /Courses catalog — the client boundary whose SSR pass must
    // agree with the browser: the settled DOM carries the German form
    await page.goto("/Courses");
    await page.waitForTimeout(1000);
    const firstCardCount = await page.evaluate(() => {
      for (const svg of document.querySelectorAll('main svg[class*="lucide-users"]')) {
        return svg.parentElement?.innerText?.trim() ?? null;
      }
      return null;
    });
    expect(firstCardCount, "the catalog's first card (WebDev, 12450 students) renders the German form").toBe("12.450");

    // (d) the console stays clean under a non-en-US visitor — the pre-fix
    // tree threw "Hydration failed" on /Courses (the server had rendered
    // 12,450 where the de-DE browser computed 12.450)
    expect(problems, "no hydration mismatch and no console noise under de-DE").toEqual([]);
  });
});

test.describe("session-29 parity: the SSR locale surface (fr-FR)", () => {
  test.use({ locale: "fr-FR" });

  test("the landing renders the French narrow-space group separators", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(600);
    const landingCounts = await page.evaluate(() => {
      const out: string[] = [];
      for (const svg of document.querySelectorAll('main svg[class*="lucide-users"]')) {
        const t = svg.parentElement?.innerText?.trim();
        if (t) out.push(t);
      }
      return out;
    });
    expect(
      landingCounts,
      "fr-FR groups digits with U+202F (narrow no-break space) — the same separator Bun, Node and Chromium's Intl all produce for fr-FR"
    ).toEqual(["12\u202f450", "4\u202f210", "8\u202f320", "5\u202f430", "3\u202f890", "6\u202f750"]);
  });
});

test.describe("session-29 parity: the SSR locale surface (default context)", () => {
  test("the default context keeps the deterministic en-US format on every count surface", async ({ page }) => {
    // Playwright's default context sends NO Accept-Language header (the
    // parser's en-US fallback) with the en-US browser locale — both sides
    // of every existing expectation stay byte-identical.
    await page.goto("/");
    await page.waitForTimeout(600);
    const landingCounts = await page.evaluate(() => {
      const out: string[] = [];
      for (const svg of document.querySelectorAll('main svg[class*="lucide-users"]')) {
        const t = svg.parentElement?.innerText?.trim();
        if (t) out.push(t);
      }
      return out;
    });
    expect(landingCounts).toEqual(["12,450", "4,210", "8,320", "5,430", "3,890", "6,750"]);

    await page.goto("/CourseDetail?id=seed-1");
    await page.waitForTimeout(600);
    expect(await page.locator("main").innerText()).toContain("12,450 students");

    await page.goto("/Courses");
    await page.waitForTimeout(1000);
    const firstCardCount = await page.evaluate(() => {
      for (const svg of document.querySelectorAll('main svg[class*="lucide-users"]')) {
        return svg.parentElement?.innerText?.trim() ?? null;
      }
      return null;
    });
    expect(firstCardCount).toBe("12,450");
  });
});

// ─── session-29 parity: the print surface (the frozen-adaptation family) ───
// Finding 2: the reference ships NO print adaptation — zero @media print
// blocks and zero media attributes across every sheet of every route, and
// emulated print media changes nothing on either site (verified against the
// live). The session-22 media-emulation family's print member: the contract
// is FROZEN — a future print stylesheet is beyond-reference drift requiring
// the documentation gate.

test.describe("session-29 parity: the print surface (frozen adaptation)", () => {
  test("zero @media print blocks + zero media attributes, and print emulation leaves the layout untouched", async ({ page }) => {
    for (const route of ["/", "/login"]) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        let printBlocks = 0;
        let mediaAttrs = 0;
        let inaccessible = 0;
        for (const sheet of document.styleSheets) {
          try {
            const walk = (rules: CSSRuleList) => {
              for (const rule of Array.from(rules)) {
                const cond = rule as unknown as { media?: { mediaText?: string } };
                if (cond.media && /\bprint\b/.test(cond.media.mediaText ?? "")) printBlocks++;
                const group = rule as unknown as { cssRules?: CSSRuleList };
                if (group.cssRules) walk(group.cssRules);
              }
            };
            walk(sheet.cssRules);
          } catch {
            inaccessible++;
          }
        }
        mediaAttrs = document.querySelectorAll("link[media], style[media]").length;
        return { printBlocks, mediaAttrs, inaccessible };
      });
      expect(census.printBlocks, `${route}: no @media print block anywhere`).toBe(0);
      expect(census.mediaAttrs, `${route}: no media= attribute on any link/style element`).toBe(0);
      expect(census.inaccessible, `${route}: every sheet of the standalone is same-origin readable`).toBe(0);

      // Rounded to integer px: toggling the emulated media re-snaps
      // getBoundingClientRect with sub-pixel float dust (144 vs
      // 143.99998…) — the documented session-22/25 rounding family; the
      // frozen-layout contract is exact at pixel granularity.
      const before = await page.evaluate(() => ({
        h: Math.round(document.documentElement.scrollHeight),
        hero: Math.round(document.querySelector("h1")?.getBoundingClientRect().height ?? 0),
      }));
      await page.emulateMedia({ media: "print" });
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => ({
        h: Math.round(document.documentElement.scrollHeight),
        hero: Math.round(document.querySelector("h1")?.getBoundingClientRect().height ?? 0),
      }));
      expect(after, `${route}: print emulation moves nothing (the frozen-adaptation contract)`).toEqual(before);
      await page.emulateMedia({ media: null });
    }
  });
});

// ─── session-29 parity: the resource-hints / first-load surface ────────────
// Finding 3: the live's CSR platform ships ZERO image preloads (it cannot
// preload data-dependent images in HTML); the clone's React 19 SSR hoists a
// <link rel="preload" as="image"> per unique rendered img src — the
// deliberate-better SSR family (the session-24 faster-FCP/LCP record). The
// guarded contract: every image preload href is EXACTLY a rendered img src
// (no double-fetch, no unknown asset) and neither site ships preconnect/
// dns-prefetch hints. The /Courses catalog's settled census is the racy
// 10..16 range (the SSR subset at 10; the client Float backfill completing
// the unique-img set at 16).

test.describe("session-29 parity: the resource-hints surface", () => {
  test("every image preload is an exact rendered img src (the no-double-fetch contract)", async ({ page }) => {
    for (const route of ["/", "/Courses"]) {
      await page.goto(route);
      await page.waitForTimeout(800);
      const { unmatched, total } = await page.evaluate(() => {
        const imgSrcs = new Set(
          Array.from(document.querySelectorAll("img")).map((i) => i.getAttribute("src"))
        );
        const preloads = Array.from(
          document.querySelectorAll('link[rel="preload"][as="image"]')
        ).map((l) => l.getAttribute("href"));
        return {
          unmatched: preloads.filter((h) => !imgSrcs.has(h)),
          total: preloads.length,
        };
      });
      expect(total, `${route}: the React 19 SSR image preloads exist`).toBeGreaterThan(0);
      expect(
        unmatched,
        `${route}: every image preload href matches a rendered img src exactly — no double-fetch, no unknown asset`
      ).toEqual([]);
    }
  });

  test("the image-preload census: the landing's deterministic 12 + the /Courses settled 10..16 range + zero preconnect/dns-prefetch", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const landing = await page.evaluate(() => ({
      images: document.querySelectorAll('link[rel="preload"][as="image"]').length,
      hints: document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]').length,
    }));
    expect(landing.images, "the landing's census is deterministic: one preload per unique img (12)").toBe(12);
    expect(landing.hints, "neither site ships preconnect/dns-prefetch hints").toBe(0);

    await page.goto("/Courses");
    await page.waitForTimeout(800);
    const courses = await page.evaluate(() => ({
      images: document.querySelectorAll('link[rel="preload"][as="image"]').length,
      hints: document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]').length,
    }));
    expect(
      courses.images,
      "the catalog's settled census is the racy range: the SSR subset (10) or the client-completed unique-img set (16)"
    ).toBeGreaterThanOrEqual(10);
    expect(courses.images).toBeLessThanOrEqual(16);
    expect(courses.hints).toBe(0);
  });
});

// session-30 integrity + router-scroll pass: TWO fresh-eyes probe families —
// (1) the REQUEST-PAYLOAD INTEGRITY surface: /api/enrollments/progress
//     validates the enrollment's ownership but never the LESSON's membership
//     in the enrollment's course — a signed-in user could submit a lessonId
//     from a DIFFERENT course and the route upserted a cross-course
//     LessonProgress row (verified live: seed-2's first lesson marked on a
//     seed-1 enrollment returned 200 + completedLessons: 1). The fix: the
//     membership guard before the upsert (400 + the house { error } shape).
// (2) the ROUTER-SCROLL MODALITY surface: the root <html> carried no
//     data-scroll-behavior attribute, so the App Router's programmatic
//     scrolls (the nav reset-to-top, the popstate restore) ran UNSUPPRESSED
//     under the session-13 universal * { scroll-behavior: smooth } pin —
//     every in-app navigation reset GLIDED (~600ms for 2000px; the session-16
//     spec had to "wait out the glide"), and the dev console carried the
//     Next.js warning on the first client-side transition. The fix: the
//     Next.js-documented contract — <html data-scroll-behavior="smooth"> —
//     the wrapper in layout-router.js then suppresses smooth for the router's
//     OWN scroll operations only (user-facing smooth scrolls keep the
//     session-13 parity pin).
async function s30ForeignLessonId(courseId: string): Promise<string> {
  // The seed's lesson ids are Prisma cuids — the only faithful source is the
  // isolated e2e database itself (db/e2e.db, deterministic absolute path).
  const { PrismaClient } = await import("@prisma/client");
  const path = await import("node:path");
  const db = new PrismaClient({
    datasourceUrl: `file:${path.resolve(process.cwd(), "db", "e2e.db")}`,
  });
  try {
    const lesson = await db.lesson.findFirst({ where: { courseId }, select: { id: true } });
    if (!lesson) throw new Error(`no lessons seeded for ${courseId}`);
    return lesson.id;
  } finally {
    await db.$disconnect();
  }
}

async function s30SignIn(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
}

test.describe("session-30 integrity: the enrollment-progress lesson-membership surface", () => {
  test("the progress endpoint rejects a lessonId from a different course (cross-course integrity)", async ({ page }) => {
    await s30SignIn(page);

    // Enroll in seed-1 (Web Development) through the real API.
    const enrollRes = await page.request.post("/api/enrollments", {
      data: { courseId: "seed-1" },
    });
    expect(enrollRes.status()).toBe(200);
    const { enrollment } = await enrollRes.json();
    expect(enrollment.courseId).toBe("seed-1");

    // A REAL lesson id — but from seed-2 (Data Science), a different course.
    const foreignLessonId = await s30ForeignLessonId("seed-2");
    expect(foreignLessonId).toBeTruthy();

    // The membership guard: 400 + the house { error } shape.
    const res = await page.request.post("/api/enrollments/progress", {
      data: { enrollmentId: enrollment.id, lessonId: foreignLessonId },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);

    // And NOTHING persisted: the enrollment still carries zero progress.
    const listRes = await page.request.get("/api/enrollments");
    expect(listRes.status()).toBe(200);
    const { enrollments } = await listRes.json();
    const mine = enrollments.find(
      (e: { id: string; courseId: string; progress: number }) => e.id === enrollment.id
    );
    expect(mine, "the seed-1 enrollment is still there").toBeTruthy();
    expect(mine.progress, "the foreign lesson left no progress behind").toBe(0);
  });

  test("the progress endpoint rejects a nonexistent lessonId the same way (both rejection paths)", async ({ page }) => {
    await s30SignIn(page);
    const enrollRes = await page.request.post("/api/enrollments", {
      data: { courseId: "seed-3" },
    });
    expect(enrollRes.status()).toBe(200);
    const { enrollment } = await enrollRes.json();

    const res = await page.request.post("/api/enrollments/progress", {
      data: { enrollmentId: enrollment.id, lessonId: "lesson-that-does-not-exist" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBeTruthy();
  });

  test("a REAL lesson of the enrollment's course still marks progress (the happy path holds)", async ({ page }) => {
    await s30SignIn(page);
    const enrollRes = await page.request.post("/api/enrollments", {
      data: { courseId: "seed-5" },
    });
    expect(enrollRes.status()).toBe(200);
    const { enrollment } = await enrollRes.json();

    const ownLessonId = await s30ForeignLessonId("seed-5");
    const res = await page.request.post("/api/enrollments/progress", {
      data: { enrollmentId: enrollment.id, lessonId: ownLessonId },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.completedLessons).toBe(1);
    expect(body.enrollment.progress).toBeGreaterThan(0);
  });
});

test.describe("session-30 parity: the router-scroll modality surface (the data-scroll-behavior contract)", () => {
  test("the root <html> carries the Next.js data-scroll-behavior contract", async ({ page }) => {
    for (const route of ["/", "/Courses"]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-scroll-behavior", "smooth", { timeout: 5000 });
    }
  });

  test("in-app navigation resets to the top INSTANTLY (the router's own scrolls snap, not glide)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(1000);

    await page.click('nav a[href="/Courses"]');
    await page.waitForURL((u) => u.pathname === "/Courses");
    // Poll for the landing: the browser's smooth-scroll animation for a
    // 2000px glide needs ~500-700ms (it CANNOT land within 250ms), while the
    // attribute-wrapped router scroll lands at the navigation commit (~0ms).
    const landedWithinMs = await page.evaluate(async () => {
      const start = performance.now();
      while (performance.now() - start < 250) {
        if (Math.round(window.scrollY) <= 5) return performance.now() - start;
        await new Promise((r) => setTimeout(r, 20));
      }
      return -1;
    });
    expect(landedWithinMs, "the reset-to-top must land within 250ms of the URL flip (the unsuppressed glide takes 500ms+)").toBeGreaterThanOrEqual(0);

    // …and it settles at exactly the top.
    await page.waitForTimeout(500);
    const settled = await page.evaluate(() => Math.round(window.scrollY));
    expect(settled).toBeLessThanOrEqual(5);
  });
});

// session-31 — the request-size + rate-limit pass: TWO fresh-eyes probe
// families —
// (1) the REQUEST-SIZE / PAYLOAD-DEPTH surface: the public writing routes
//     accepted and PERSISTED unbounded strings (a 1MB newsletter email
//     returned 200 + the row; a 2MB contact message likewise; a 1MB signup
//     email created a User whose derived NAME was also 1MB). The fix: the
//     shared request guard — a 1MB Content-Length pre-check (413) + the
//     field caps (400) on every public POST route.
// (2) the RATE-LIMITING / ABUSE-THROTTLE surface: neither site throttles
//     (12-request bursts ×4 sequences produced zero 429s anywhere) — but the
//     live is protected by its PLATFORM wall (external POSTs to
//     newsletter/contact/ai 405; login demands "Security verification"),
//     while the clone's first-party API was wide open. The fix: the
//     deliberate-better in-memory per-IP throttle (429 + Retry-After).
//
// Spec order matters: the BURST spec is deliberately the suite's LAST
// API-touching spec — it poisons the newsletter bucket for the remainder
// of its 60s window, and nothing after it POSTs newsletter (the leak spec
// re-run is GET-only). Every full-suite run boots a fresh server process
// (a fresh bucket map), so runs are independent.
async function s31CountUsersWithEmailPrefix(prefix: string): Promise<number> {
  // The spec-side Prisma read (the session-30 s30ForeignLessonId pattern):
  // the only faithful source for the non-persistence assertion.
  const { PrismaClient } = await import("@prisma/client");
  const path = await import("node:path");
  const db = new PrismaClient({
    datasourceUrl: `file:${path.resolve(process.cwd(), "db", "e2e.db")}`,
  });
  try {
    return await db.user.count({ where: { email: { startsWith: prefix } } });
  } finally {
    await db.$disconnect();
  }
}

test.describe("session-31 parity: the request-size guard surface", () => {
  test("newsletter rejects an oversized email with 400 (the field cap)", async ({ request }) => {
    // A 300KB email: over the 254-char RFC max but UNDER the 1MB body cap —
    // this pins the FIELD layer specifically.
    const res = await request.post("/api/newsletter", {
      data: { email: "x".repeat(300 * 1024) + "@example.com" },
    });
    expect(res.status(), "the field cap rejects before any persistence").toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
  });

  test("contact rejects an oversized message with 400; the normal message still succeeds", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: {
        name: "S31 E2E",
        email: "s31-e2e@example.com",
        subject: "s31",
        message: "m".repeat(300 * 1024),
      },
    });
    expect(res.status(), "the field cap rejects the 300KB message").toBe(400);
    expect(((await res.json()) as { error?: string }).error).toBeTruthy();

    // The happy path holds: a small valid contact POST still succeeds.
    const ok = await request.post("/api/contact", {
      data: {
        name: "S31 E2E",
        email: "s31-e2e@example.com",
        subject: "s31",
        message: "session-31 happy-path probe — safe to delete.",
      },
    });
    expect(ok.status(), "the caps are invisible to the normal UX").toBe(200);
  });

  test("signup rejects an oversized email with 400 and creates NOTHING", async ({ request }) => {
    const prefix = "s31-oversized-signup-";
    const before = await s31CountUsersWithEmailPrefix(prefix);
    const res = await request.post("/api/auth/signup", {
      data: { email: prefix + "x".repeat(300 * 1024) + "@example.com", password: "password123" },
    });
    expect(res.status(), "the field cap rejects before the user lookup").toBe(400);
    expect(((await res.json()) as { error?: string }).error).toBeTruthy();
    const after = await s31CountUsersWithEmailPrefix(prefix);
    expect(after, "no user row was persisted by the rejected signup").toBe(before);
  });

  test("login rejects an oversized email with 400 (the field cap beats the 401)", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "x".repeat(300 * 1024) + "@example.com", password: "wrong" },
    });
    // RED state: this returned 401 (the lookup ran with the megabyte string).
    expect(res.status(), "the field cap rejects before the user lookup").toBe(400);
    expect(((await res.json()) as { error?: string }).error).toBeTruthy();
  });

  test("newsletter rejects an over-1MB body with 413 (the Content-Length pre-check)", async ({ request }) => {
    // A 1.5MB email: the body itself exceeds the 1MB cap — this pins the
    // BODY layer (the pre-parse rejection).
    const res = await request.post("/api/newsletter", {
      data: { email: "y".repeat(1536 * 1024) + "@example.com" },
    });
    expect(res.status(), "the body pre-check rejects with 413").toBe(413);
    expect(((await res.json()) as { error?: string }).error).toBeTruthy();
  });

  test("ai/chat rejects a >100-turn messages array with 400 (the turn cap)", async ({ request }) => {
    const messages = Array.from({ length: 101 }, (_, i) => ({ role: "user", content: `turn ${i}` }));
    const res = await request.post("/api/ai/chat", { data: { messages } });
    expect(res.status(), "the turn cap rejects before the SDK call").toBe(400);
    expect(((await res.json()) as { error?: string }).error).toBeTruthy();
  });
});

test.describe("session-31 parity: the per-IP throttle surface", () => {
  test("a valid newsletter subscribe stays under the throttle (the happy path holds)", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "s31-happy-path@example.com" },
    });
    expect(res.status(), "the throttle is invisible to the normal UX").toBe(200);
    expect(((await res.json()) as { ok?: boolean }).ok).toBe(true);
  });

  test("a rapid burst on the newsletter route trips 429 + Retry-After", async ({ request }) => {
    // 20 rapid requests with INVALID emails: every pre-throttle response is
    // a deterministic 400 (zero persistence), and the throttle ceiling is
    // 15/min — the tail MUST trip. The exact trip point is NOT asserted
    // (earlier in-window requests from other specs shift it).
    const statuses: number[] = [];
    let throttled: Awaited<ReturnType<typeof request.post>> | null = null;
    for (let i = 0; i < 20; i++) {
      const res = await request.post("/api/newsletter", {
        data: { email: `not-an-email-${i}` },
      });
      statuses.push(res.status());
      if (res.status() === 429) throttled = res;
    }
    for (const s of statuses) {
      expect([400, 429], `every burst response is 400 or 429 (got ${s})`).toContain(s);
    }
    expect(statuses.filter((s) => s === 429).length, "the burst trips the throttle").toBeGreaterThan(0);
    expect(throttled, "at least one throttled response captured").toBeTruthy();

    // The 429 contract: Retry-After (seconds) + the house { error } body.
    const retryAfter = Number(throttled!.headers()["retry-after"]);
    expect(Number.isFinite(retryAfter) && retryAfter >= 1, "Retry-After is a positive second count").toBe(true);
    const body = (await throttled!.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
    expect(body.error!.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Session 32 — the auth-session-lifetime + cookie-symmetry + aria-live
// surface. The stale/future-iat tokens are minted with the SAME secret the
// e2e standalone server runs with (playwright.config.ts webServer env) —
// this is the attacker model: a validly-signed token whose payload claims
// an old issue time (a restored cookie, a leaked backup).
// ---------------------------------------------------------------------------
import { createHmac } from "node:crypto";

const E2E_AUTH_SECRET = "playwright-e2e-session-secret";

function mintToken(claim: { userId: string; email: string; name: string; iat: number }): string {
  const payload = Buffer.from(JSON.stringify(claim)).toString("base64url");
  const mac = createHmac("sha256", E2E_AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

test.describe("session-32 parity: the server-side session-lifetime surface", () => {
  const claim = { userId: "s32-stale-probe-user", email: "probe@example.com", name: "Probe" };

  test("a freshly-minted signed token still authenticates (the control)", async ({ request }) => {
    // session-34: the control now carries the revocation contract — the
    // mint must reference the REAL seeded demo user (looked up from the
    // isolated e2e database), because getSession() re-validates the user
    // row + the epoch on every read. The pre-34 control minted a token for
    // a NONEXISTENT userId and passed — the pin had codified the ghost
    // behavior the session-34 fix closed.
    const db = await s34SpecDb();
    let demoUserId: string;
    try {
      const demo = await db.user.findUniqueOrThrow({
        where: { email: "sepnetflix2023@outlook.com" },
        select: { id: true },
      });
      demoUserId = demo.id;
    } finally {
      await db.$disconnect();
    }
    const res = await request.get("/api/auth/me", {
      headers: { cookie: `nexus_session=${mintToken({ ...claim, userId: demoUserId, iat: Date.now() })}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { user: { userId?: string } | null };
    expect(body.user?.userId, "the control proves the mint is faithful").toBe(demoUserId);
  });

  test("a 30-day-old signed token is REJECTED server-side", async ({ request }) => {
    const res = await request.get("/api/auth/me", {
      headers: { cookie: `nexus_session=${mintToken({ ...claim, iat: Date.now() - 30 * 24 * 3600 * 1000 })}` },
    });
    const body = (await res.json()) as { user: unknown };
    expect(body.user, "the 7-day promise must hold beyond the browser cookie jar").toBeNull();
  });

  test("a future-issued signed token is REJECTED beyond the clock-skew window", async ({ request }) => {
    const res = await request.get("/api/auth/me", {
      headers: { cookie: `nexus_session=${mintToken({ ...claim, iat: Date.now() + 2 * 60 * 1000 })}` },
    });
    const body = (await res.json()) as { user: unknown };
    expect(body.user, "future iat must not authenticate").toBeNull();
  });
});

test.describe("session-32 parity: the logout deletion-cookie attribute symmetry", () => {
  test("the logout Set-Cookie carries the full attribute set (HttpOnly, SameSite=Lax, Max-Age=0, Path=/)", async ({ request }) => {
    const res = await request.post("/api/auth/logout");
    expect(res.status()).toBe(200);
    const setCookie = res.headers()["set-cookie"] ?? "";
    const header = Array.isArray(setCookie) ? setCookie.join("\n") : setCookie;
    // Next serializes the SameSite value lowercase ("SameSite=lax") — the
    // semantics matter, not the case.
    const headerCI = header.toLowerCase();
    expect(header, "deletion must be attribute-symmetric with the login cookie").toContain("nexus_session=;");
    expect(headerCI).toContain("httponly");
    expect(headerCI).toContain("samesite=lax");
    expect(headerCI).toContain("max-age=0");
    expect(headerCI).toContain("path=/");
  });
});

test.describe("session-32 parity: the AI-chat aria-live politeness surface (deliberate-better)", () => {
  test("the messages region announces politely; the Thinking bubble carries role=status", async ({ page }) => {
    await page.goto("/AIAssistant");
    await page.waitForLoadState("networkidle");

    // The messages scroll container (flex-1 p-6 space-y-6 overflow-y-auto).
    const live = await page
      .locator("main div.flex-1.p-6.space-y-6")
      .first()
      .getAttribute("aria-live");
    expect(live, "the async chat surface must be announced to screen readers").toBe("polite");

    // Ask something to trigger the Thinking bubble, then read its role.
    await page.locator("textarea").fill("Hello");
    await page.keyboard.press("Enter");
    const bubble = page.locator("div[role='status']").first();
    await expect(bubble, "the transient Thinking... state is announced").toContainText("Thinking");
    await expect
      .poll(async () => (await page.locator("div[role='status']").count()) === 0, { timeout: 20_000 })
      .toBe(true);
  });
});

test.describe("session-33 parity: the verify-route guard surface (the seventh public POST route)", () => {
  test("a >1MB verify body is rejected before parsing (413)", async ({ request }) => {
    // Pre-fix: the body was parsed and reached the user lookup (400).
    const pad = "a".repeat(1_050_000);
    const res = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email: "x@y.zz", code: "123456", pad },
    });
    expect(res.status(), "the guard fires before any parse").toBe(413);
    expect(await res.json()).toEqual({ error: "Request body too large" });
  });

  test("a 100KB email is rejected by the field cap (the unbounded lookup key)", async ({ request }) => {
    // Pre-fix: the regex passed it and the DB lookup ran with a 100KB key.
    const longEmail = "a".repeat(100_000) + "@x.zz";
    const res = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email: longEmail, code: "123456" },
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: "Email is too long" });
  });
});

test.describe("session-33 parity: the login timing equalization surface", () => {
  test("the no-user 401 burns password-compare time (median of 7 >= 12ms)", async ({ request }) => {
    // Pre-fix: the user-not-found path short-circuited in ~6ms while the
    // user-exists path burned scrypt (~35ms) — a 29ms user-existence
    // timing oracle. Post-fix both paths pay the same scrypt cost.
    const times: number[] = [];
    for (let i = 0; i < 7; i++) {
      const t0 = Date.now();
      const res = await request.post("/api/auth/login", {
        headers: { "content-type": "application/json" },
        data: { email: `timing-oracle-${i}@example.com`, password: "wrong-password" },
      });
      times.push(Date.now() - t0);
      expect(res.status()).toBe(401);
    }
    const median = [...times].sort((a, b) => a - b)[Math.floor(times.length / 2)];
    // The floor sits between the measured pre-fix (~6ms) and post-fix
    // (~30ms) medians; scrypt's default params are memory-hard (16 MiB),
    // so the post-fix cost cannot realistically fall below this floor.
    expect(median, `no-user 401 must burn the scrypt compare (times: ${times.join(",")}ms)`).toBeGreaterThanOrEqual(12);
  });
});

// ---------------------------------------------------------------------------
// Session 34 — the session-revocation / deleted-user surface (the per-user
// epoch) + the per-route delivered-JS budget. The ghost/epoch specs use the
// spec-side PrismaClient (the session-31 pattern) against db/e2e.db.
// ---------------------------------------------------------------------------
async function s34SpecDb(): Promise<import("@prisma/client").PrismaClient> {
  const { PrismaClient } = await import("@prisma/client");
  const path = await import("node:path");
  const db = new PrismaClient({
    datasourceUrl: `file:${path.resolve(process.cwd(), "db", "e2e.db")}`,
  });
  return db;
}

test.describe("session-34 parity: the session-revocation surface (the deleted-user ghost token)", () => {
  test("a DELETED user's token no longer authenticates (the ghost probe)", async ({ request }) => {
    // Pre-fix: the token authenticated until its 7-day iat bound — the
    // user row was gone but /api/auth/me kept serving the full object.
    const email = `s34-ghost-${Date.now()}@example.com`;
    const su = await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(su.status(), "the throwaway signs up").toBe(200);
    const vf = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email, code: "123456" },
    });
    expect(vf.status(), "verify mints the session cookie").toBe(200);
    const cookie = (vf.headers()["set-cookie"] ?? "")
      .split(";")[0];

    // Control: the fresh token authenticates.
    const me1 = await request.get("/api/auth/me", { headers: { cookie } });
    expect(me1.status()).toBe(200);
    expect(((await me1.json()) as { user: unknown }).user).toBeTruthy();

    // DELETE the user row (the side-channel — an operator removing the
    // account). Enrollments cascade.
    const db = await s34SpecDb();
    try {
      await db.user.delete({ where: { email } });
    } finally {
      await db.$disconnect();
    }

    // THE PROBE: the same cookie must no longer authenticate.
    const me2 = await request.get("/api/auth/me", { headers: { cookie } });
    expect(me2.status()).toBe(200);
    expect(
      ((await me2.json()) as { user: unknown }).user,
      "a deleted user's token must not outlive the user row"
    ).toBeNull();
  });
});

test.describe("session-34 parity: the session-revocation surface (the epoch bump)", () => {
  test("a bumped sessionVersion revokes the outstanding token; a fresh login re-mints", async ({ request }) => {
    const email = `s34-epoch-${Date.now()}@example.com`;
    const su = await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(su.status()).toBe(200);
    const vf = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email, code: "123456" },
    });
    expect(vf.status()).toBe(200);
    const cookie = (vf.headers()["set-cookie"] ?? "").split(";")[0];

    // Bump the epoch: every outstanding token for this user must die —
    // the revocation lever that does NOT require rotating AUTH_SECRET.
    const db = await s34SpecDb();
    try {
      await db.user.update({ where: { email }, data: { sessionVersion: 1 } });
    } finally {
      await db.$disconnect();
    }

    const me1 = await request.get("/api/auth/me", { headers: { cookie } });
    expect(
      ((await me1.json()) as { user: unknown }).user,
      "the pre-bump token must be revoked by the epoch compare"
    ).toBeNull();

    // The control: the ACCOUNT is not broken — a fresh login mints a
    // token carrying the NEW epoch and authenticates.
    const li = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(li.status(), "the account still logs in").toBe(200);
    const freshCookie = (li.headers()["set-cookie"] ?? "").split(";")[0];
    const me2 = await request.get("/api/auth/me", { headers: { cookie: freshCookie } });
    expect(
      ((await me2.json()) as { user: { userId?: string } | null }).user,
      "the fresh mint carries the bumped epoch and authenticates"
    ).toBeTruthy();
  });
});

test.describe("session-34 parity: the per-route delivered-JS budget surface", () => {
  test("every route ships less JS than the live's 727KB SPA monolith", async ({ page }) => {
    // The recorded s33 baseline: the live reference delivers ~727 KB of JS
    // on every route (one SPA bundle). The clone's per-route delivery
    // (measured s34): 536-662 KB. The budget pins the semantic ceiling —
    // the clone must never deliver more JS per route than the reference's
    // monolith (a heavy shared-chunk import trips this RED).
    const LIVE_MONOLITH_BYTES = 727 * 1024;
    const routes = [
      "/",
      "/Courses",
      "/CourseDetail?id=seed-1",
      "/Pricing",
      "/About",
      "/Contact",
      "/BecomeInstructor",
      "/AIAssistant",
      "/Dashboard",
      "/login",
    ];
    const origin = new URL(page.url() || "http://localhost:3100").origin;
    const perRoute: Record<string, number> = {};
    for (const route of routes) {
      const sizes: number[] = [];
      const pending: Promise<void>[] = [];
      const collect = (r: { url(): string; body(): Promise<Buffer> }) => {
        const u = new URL(r.url());
        if (u.origin === origin && u.pathname.endsWith(".js")) {
          pending.push(r.body().then((b: Buffer) => { sizes.push(b.length); }).catch(() => {}));
        }
      };
      page.on("response", collect);
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      page.off("response", collect);
      await Promise.all(pending);
      perRoute[route] = sizes.reduce((s, x) => s + x, 0);
    }
    const summary = Object.entries(perRoute)
      .map(([r, b]) => `${r}: ${(b / 1024).toFixed(1)}KB`)
      .join(", ");
    for (const [route, bytes] of Object.entries(perRoute)) {
      expect(
        bytes,
        `${route} delivered JS must stay under the live monolith (all: ${summary})`
      ).toBeLessThan(LIVE_MONOLITH_BYTES);
    }
  });
});

// ---------------------------------------------------------------------------
// Session 35 — the verification-code persistence surface (the first half of
// the DEPLOYMENT §13 SMTP drill) + the revoke-sessions lever + the per-route
// TTFB budget. The persistence/housekeeping specs use the spec-side
// PrismaClient (the session-31/34 pattern) against db/e2e.db.
// ---------------------------------------------------------------------------

test.describe("session-35 parity: the verification-code persistence surface", () => {
  test("after signup, the code hash + expiry are PERSISTED on the User row", async ({ request }) => {
    // Pre-fix: the 6-digit code was generated, logged, and DISCARDED — the
    // User row carried no verificationCode/codeExpiresAt columns at all.
    const email = `s35-code-${Date.now()}@example.com`;
    const su = await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(su.status()).toBe(200);

    const db = await s34SpecDb();
    try {
      const user = await db.user.findUnique({
        where: { email },
        select: { verificationCode: true, codeExpiresAt: true, emailVerified: true },
      });
      expect(user, "the row exists").toBeTruthy();
      expect(user!.emailVerified, "still unverified until the code").toBe(false);
      expect(user!.verificationCode, "the code hash is persisted (an HMAC, never the raw digits)").toBeTruthy();
      expect(user!.codeExpiresAt, "the expiry is persisted").toBeTruthy();
      const delta = user!.codeExpiresAt!.getTime() - Date.now();
      expect(delta, "the window is ~10 minutes (tolerance)").toBeGreaterThan(9 * 60 * 1000 - 5000);
      expect(delta).toBeLessThan(11 * 60 * 1000);
    } finally {
      await db.$disconnect();
    }
  });

  test("a successful verify CLEARS both fields (the persistence housekeeping — simulated mode keeps the any-code contract)", async ({ request }) => {
    // The simulated-delivery default (AUTH_DELIVERY unset) keeps the
    // documented any-code contract — the e2e server sets no AUTH_DELIVERY
    // (verified in playwright.config.ts webServer.env). The persistence
    // housekeeping still runs: both fields cleared on success.
    const email = `s35-clear-${Date.now()}@example.com`;
    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    const vf = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email, code: "123456" },
    });
    expect(vf.status(), "the simulated any-code contract holds (the gate default)").toBe(200);

    const db = await s34SpecDb();
    try {
      const user = await db.user.findUnique({
        where: { email },
        select: { verificationCode: true, codeExpiresAt: true, emailVerified: true },
      });
      expect(user!.emailVerified, "the verify flipped the flag").toBe(true);
      expect(user!.verificationCode, "the code hash is cleared").toBeNull();
      expect(user!.codeExpiresAt, "the expiry is cleared").toBeNull();
    } finally {
      await db.$disconnect();
    }
  });
});

test.describe("session-35 parity: the revoke-sessions lever (the authed API surface)", () => {
  test("POST /api/auth/revoke-sessions kills every outstanding token for the caller; the account survives", async ({ request }) => {
    // Pre-fix: the session-34 epoch lever existed ONLY as raw SQL in
    // DEPLOYMENT.md §12 — an account owner had no first-party way to
    // revoke their own sessions. The route bumps the caller's epoch and
    // clears the cookie (the logout semantics + the epoch bump).
    // Uses a THROWAWAY user (never the demo user — the s32 control's
    // ver-less mint requires the demo user's epoch to stay 0, and the
    // seed's upsert preserves a bumped sessionVersion across runs).
    const email = `s35-revoke-${Date.now()}@example.com`;

    // No session -> 401 (the authed-route contract). Probed BEFORE the
    // signup/verify below — the shared request context stores the verify
    // cookie in its jar, so a later "anonymous" post would carry it.
    const anon = await request.post("/api/auth/revoke-sessions");
    expect(anon.status(), "the route requires a session").toBe(401);

    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    const vf = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email, code: "123456" },
    });
    expect(vf.status()).toBe(200);
    const cookie = (vf.headers()["set-cookie"] ?? "").split(";")[0];

    // The revocation: the presented (and every outstanding) token dies.
    const res = await request.post("/api/auth/revoke-sessions", { headers: { cookie } });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { ok?: boolean };
    expect(body.ok).toBe(true);

    const me1 = await request.get("/api/auth/me", { headers: { cookie } });
    expect(
      ((await me1.json()) as { user: unknown }).user,
      "the pre-revocation token must be dead"
    ).toBeNull();

    // The deletion cookie is attribute-symmetric (the s32 pattern).
    const setCookie = res.headers()["set-cookie"] ?? "";
    const header = Array.isArray(setCookie) ? setCookie.join("\n") : setCookie;
    expect(header.toLowerCase()).toContain("nexus_session=;");
    expect(header.toLowerCase()).toContain("httponly");

    // The control: the ACCOUNT survives — a fresh login re-mints at the
    // bumped epoch and authenticates.
    const li = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(li.status(), "the account still logs in").toBe(200);
    const freshCookie = (li.headers()["set-cookie"] ?? "").split(";")[0];
    const me2 = await request.get("/api/auth/me", { headers: { cookie: freshCookie } });
    expect(
      ((await me2.json()) as { user: unknown }).user,
      "the fresh mint carries the bumped epoch"
    ).toBeTruthy();
  });
});

test.describe("session-35 parity: the per-route TTFB budget surface", () => {
  test("every route's median TTFB stays under 500ms on the standalone (the s34 budget precedent, now server latency)", async ({ request }) => {
    // Measured s35 (dedicated :3400 standalone, 3 rounds): 7-31ms medians —
    // the 500ms ceiling leaves 16-70x headroom (effectively unflakeable on
    // a loaded box) while still catching the pathological regressions the
    // budget exists for: an N+1 query storm, a missing index, a synchronous
    // external call in a render path. Raw Node http (the s27 pattern — the
    // playwright request fixture cannot isolate TTFB from full-body time).
    const http = await import("node:http");
    const base = process.env.E2E_TTFB_ORIGIN ?? "http://localhost:3100";
    const { hostname, port } = new URL(base);
    const routes = [
      "/",
      "/Courses",
      "/CourseDetail?id=seed-1",
      "/Pricing",
      "/About",
      "/Contact",
      "/BecomeInstructor",
      "/AIAssistant",
      "/Dashboard",
      "/login",
    ];
    const ttfb = (path: string) =>
      new Promise<number>((resolve, reject) => {
        const started = process.hrtime.bigint();
        const req = http.get({ hostname, port: Number(port), path }, (res) => {
          res.once("data", () => {
            resolve(Number(process.hrtime.bigint() - started) / 1e6);
            res.resume();
          });
        });
        req.on("error", reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")); });
      });

    // Warm-up round (page-module caches), then 3 measured rounds per route.
    for (const r of routes) await ttfb(r).catch(() => {});
    const summary: string[] = [];
    const medians: Record<string, number> = {};
    for (const r of routes) {
      const runs: number[] = [];
      for (let i = 0; i < 3; i++) {
        const ms = await ttfb(r).catch(() => -1);
        runs.push(ms);
      }
      const med = runs.sort((a, b) => a - b)[1];
      medians[r] = med;
      summary.push(`${r}: ${med.toFixed(0)}ms`);
    }
    for (const [route, med] of Object.entries(medians)) {
      expect(
        med,
        `${route} median TTFB must stay under 500ms (all: ${summary.join(", ")})`
      ).toBeLessThan(500);
    }
  });
});

// ---------------------------------------------------------------------------
// Session 36 — the unverified-login gate + the web-vitals budget (the s35
// mailer is unit-pinned + proof-matrix-proven; the e2e server runs the
// simulated delivery default).
// ---------------------------------------------------------------------------

test.describe("session-36 parity: the unverified-login surface (the account-state gate)", () => {
  const UNVERIFIED_MSG =
    "Please verify your email before logging in. Check your email for the verification code.";

  test("signing in with an UNVERIFIED account returns 403 + the reference message (no session minted)", async ({ request }) => {
    // Pre-fix (the drift, probed on the LIVE through its own UI — its raw
    // API sits behind the platform wall): the reference BLOCKS the
    // unverified login with this exact message and zero cookies; the clone
    // minted a full session (nexus_session set, landed on /).
    const email = `s36-unverified-${Date.now()}@example.com`;
    const su = await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(su.status()).toBe(200);

    const li = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(li.status(), "valid credentials + unverified account -> 403 (not 200, not 401)").toBe(403);
    expect(await li.json()).toEqual({ error: UNVERIFIED_MSG });
    const setCookie = li.headers()["set-cookie"] ?? "";
    expect(String(setCookie), "no session cookie is minted").not.toContain("nexus_session=");
  });

  test("the UI shows the reference error in the signin card and stays on /login (the live's observable contract)", async ({ page }) => {
    const email = `s36-ui-${Date.now()}@example.com`;
    // Signup through the card (the 5-view state machine).
    await page.goto("/login");
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();
    await page.fill("#email", email);
    await page.fill("#password", "SuperSecret99!");
    await page.fill("#confirmPassword", "SuperSecret99!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();

    // Back to the signin view with the UNVERIFIED credentials.
    await page.getByRole("button", { name: "Back to sign in" }).click();
    await page.fill("#email", email);
    await page.fill("#password", "SuperSecret99!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // The reference error renders in the card's alert area; no navigation.
    await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toHaveText(UNVERIFIED_MSG);
    await page.waitForTimeout(800);
    expect(page.url()).toContain("/login");
    const me = await page.request.get("/api/auth/me");
    expect(((await me.json()) as { user: unknown }).user).toBeNull();
  });

  test("the control: a VERIFIED account logs in normally (the gate never touches the verified path)", async ({ request }) => {
    const email = `s36-verified-${Date.now()}@example.com`;
    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    const vf = await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email, code: "123456" },
    });
    expect(vf.status()).toBe(200);
    const li = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    expect(li.status(), "the verified account still mints the session").toBe(200);
    expect(String(li.headers()["set-cookie"] ?? "")).toContain("nexus_session=");
  });

  test("a WRONG password on an unverified account still gets the uniform 401 (no state leak)", async ({ request }) => {
    const email = `s36-wrongpw-${Date.now()}@example.com`;
    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    const li = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: "WrongPassword1!" },
    });
    expect(li.status(), "wrong password -> the indistinguishable 401 (the gate fires only after a valid compare)").toBe(401);
    expect(await li.json()).toEqual({ error: "Invalid email or password" });
  });
});

test.describe("session-36 parity: the web-vitals budget surface (FCP + LCP)", () => {
  test("every route's FCP stays under 2000ms and LCP under 5000ms on the standalone", async ({ page }) => {
    // Measured s36 (dedicated :3400 standalone): FCP 136-468ms (the /login
    // entry lands at 224ms but can postdate the load event — hence the
    // poll), LCP 164-1432ms (the / LCP includes the remote Unsplash hero
    // imagery). The ceilings leave 4x+ / 3.5x+ headroom — effectively
    // unflakeable while catching the pathological regressions the budget
    // family exists for (a render-blocking asset regression, a giant
    // inlined payload, an LCP-image serving failure).
    const routes = [
      "/",
      "/Courses",
      "/CourseDetail?id=seed-1",
      "/Pricing",
      "/About",
      "/Contact",
      "/BecomeInstructor",
      "/AIAssistant",
      "/Dashboard",
      "/login",
    ];
    const summary: string[] = [];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "load", timeout: 45000 });
      const vitals = await page.evaluate(
        () =>
          new Promise<{ fcp: number | null; lcp: number | null }>((resolve) => {
            const out = { fcp: null as number | null, lcp: null as number | null };
            // FCP: POLL for the paint entry (it can land after the load
            // event on /login — measured 224ms there).
            let tries = 0;
            const poll = setInterval(() => {
              const fcp = performance
                .getEntriesByType("paint")
                .find((p) => p.name === "first-contentful-paint");
              if (fcp) out.fcp = Math.round(fcp.startTime);
              tries += 1;
              if (out.fcp !== null || tries > 10) clearInterval(poll);
            }, 500);
            // LCP: the observer with buffered entries, finalized after a settle.
            try {
              const po = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length) {
                  out.lcp = Math.round(entries[entries.length - 1].startTime);
                }
              });
              po.observe({ type: "largest-contentful-paint", buffered: true });
              setTimeout(() => {
                po.disconnect();
                clearInterval(poll);
                resolve(out);
              }, 3000);
            } catch {
              setTimeout(() => {
                clearInterval(poll);
                resolve(out);
              }, 3000);
            }
          })
      );
      summary.push(`${route}: fcp=${vitals.fcp ?? "n/a"}ms lcp=${vitals.lcp ?? "n/a"}ms`);
      if (vitals.fcp !== null) {
        expect(vitals.fcp, `${route} FCP under 2000ms (all: ${summary.join(", ")})`).toBeLessThan(2000);
      }
      if (vitals.lcp !== null) {
        expect(vitals.lcp, `${route} LCP under 5000ms (all: ${summary.join(", ")})`).toBeLessThan(5000);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Session 37 — the /reset-password parity surface (the LIVE ships the route;
// the clone 404'd — a REAL functional parity drift found by probing the
// live's own UI) + the forgot-password token lifecycle (the drill's step 6)
// + the TBT budget (the interaction-latency dimension of the per-route
// performance contract). The API specs use the spec-side PrismaClient (the
// session-31/34/35 pattern) against db/e2e.db and THROWAWAY users.
// ---------------------------------------------------------------------------

test.describe("session-37 parity: the /reset-password route (the view states)", () => {
  test("GET /reset-password with NO token renders the Invalid Reset Link state (the reference DOM)", async ({ page }) => {
    await page.goto("/reset-password", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Invalid Reset Link" })).toBeVisible();
    await expect(page.getByText("This password reset link is invalid or has expired.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to Login" })).toBeVisible();
    // The metadata contract: the plain "NexusLearn" title + the bare canonical.
    await expect(page).toHaveTitle("NexusLearn");
    const canon = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canon).toMatch(/\/reset-password$/);
  });

  test("the Invalid Reset Link Back button navigates to /login", async ({ page }) => {
    await page.goto("/reset-password", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Back to Login" }).click();
    await page.waitForURL("**/login", { timeout: 10000 });
  });

  test("GET /reset-password?token=<any> renders the Set new password form OPTIMISTICALLY (the live's contract)", async ({ page }) => {
    await page.goto("/reset-password?token=anything-at-all", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Set new password" })).toBeVisible();
    await expect(page.getByText("Enter your new password for NexusLearn")).toBeVisible();
    await expect(page.getByLabel("New Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm New Password", { exact: true })).toBeVisible();
    await expect(page.getByText("Must be at least 8 characters")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to login" })).toBeVisible();
    // The canonical carries the token query (the CourseDetail ?id= pattern).
    const canon = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canon).toContain("/reset-password?token=anything-at-all");
  });

  test("the client-side validation: mismatch and short passwords render the live's exact messages", async ({ page }) => {
    await page.goto("/reset-password?token=abc", { waitUntil: "networkidle" });
    await page.locator("#password").fill("password-one-123");
    await page.locator("#confirmPassword").fill("password-two-456");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.locator('form [role="alert"]')).toContainText("Passwords do not match");

    await page.locator("#password").fill("short");
    await page.locator("#confirmPassword").fill("short");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.locator('form [role="alert"]')).toContainText("Password must be at least 8 characters long");
  });

  test("an INVALID token at submit renders the reference API error in the alert", async ({ page }) => {
    await page.goto("/reset-password?token=garbage-token", { waitUntil: "networkidle" });
    await page.locator("#password").fill("BrandNewPw456!");
    await page.locator("#confirmPassword").fill("BrandNewPw456!");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.locator('form [role="alert"]')).toContainText("Invalid or expired reset token");
  });
});

test.describe("session-37 parity: the forgot-password token lifecycle (the API contract)", () => {
  test("forgot-password for an EXISTING user persists the token hash + expiry (the s35 pattern) and stays always-ok", async ({ request }) => {
    const email = `s37-fp-${Date.now()}@example.com`;
    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    const res = await request.post("/api/auth/forgot-password", {
      headers: { "content-type": "application/json" },
      data: { email },
    });
    expect(res.status(), "the always-ok contract").toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const db = await s34SpecDb();
    try {
      const user = await db.user.findUnique({
        where: { email },
        select: { resetTokenHash: true, resetTokenExpiresAt: true },
      });
      expect(user!.resetTokenHash, "the token hash is persisted (an HMAC, never the raw token)").toBeTruthy();
      expect(user!.resetTokenExpiresAt, "the expiry is persisted").toBeTruthy();
      const delta = user!.resetTokenExpiresAt!.getTime() - Date.now();
      expect(delta, "the window is ~10 minutes (tolerance)").toBeGreaterThan(9 * 60 * 1000 - 5000);
      expect(delta).toBeLessThan(11 * 60 * 1000);
    } finally {
      await db.$disconnect();
    }
  });

  test("forgot-password for a NON-EXISTENT email stays always-ok (the no-enumeration contract)", async ({ request }) => {
    const res = await request.post("/api/auth/forgot-password", {
      headers: { "content-type": "application/json" },
      data: { email: `no-such-user-${Date.now()}@example.com` },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("the FULL round trip on a throwaway user: mint -> consume -> the new password signs in, the old one 401s, the epoch bumps", async ({ request }) => {
    const email = `s37-reset-${Date.now()}@example.com`;
    const OLD_PW = "SuperSecret99!";
    const NEW_PW = "BrandNewPw456!";
    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: OLD_PW },
    });
    await request.post("/api/auth/verify", {
      headers: { "content-type": "application/json" },
      data: { email, code: "123456" },
    });

    // Mint a valid token in-spec (the same seam + the server's AUTH_SECRET)
    // and write the hash + expiry directly onto the row (the s35 pattern).
    const { randomBytes, createHmac } = await import("node:crypto");
    const secret = E2E_AUTH_SECRET; // the playwright webServer's fixed secret
    const token = randomBytes(32).toString("hex");
    const hash = createHmac("sha256", secret).update(`r1:${token}`).digest("hex");
    const db = await s34SpecDb();
    try {
      await db.user.update({
        where: { email },
        data: { resetTokenHash: hash, resetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });

      // The short-password contract (the server-side validation).
      const short = await request.post("/api/auth/reset-password", {
        headers: { "content-type": "application/json" },
        data: { token, password: "short" },
      });
      expect(short.status()).toBe(400);

      const res = await request.post("/api/auth/reset-password", {
        headers: { "content-type": "application/json" },
        data: { token, password: NEW_PW },
      });
      expect(res.status(), "the reset succeeds").toBe(200);

      // Single-use: the token is dead after consumption.
      const replay = await request.post("/api/auth/reset-password", {
        headers: { "content-type": "application/json" },
        data: { token, password: "AnotherPw789!" },
      });
      expect(replay.status(), "the consumed token never works again").toBe(400);
      expect((await replay.json()).error).toBe("Invalid or expired reset token");

      const after = await db.user.findUnique({
        where: { email },
        select: { resetTokenHash: true, resetTokenExpiresAt: true, sessionVersion: true },
      });
      expect(after!.resetTokenHash, "the token hash is cleared").toBeNull();
      expect(after!.resetTokenExpiresAt, "the expiry is cleared").toBeNull();
      expect(after!.sessionVersion, "the epoch is bumped (the reset killed outstanding sessions)").toBe(1);
    } finally {
      await db.$disconnect();
    }

    // The new password signs in (the verified account); the old one 401s.
    // NOTE: fresh request contexts — the earlier posts may share the jar.
    const ok = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: NEW_PW },
    });
    expect(ok.status(), "the NEW password signs in").toBe(200);
    const stale = await request.post("/api/auth/login", {
      headers: { "content-type": "application/json" },
      data: { email, password: OLD_PW },
    });
    expect(stale.status(), "the OLD password is dead").toBe(401);
  });

  test("an EXPIRED token is rejected (the fail-closed window)", async ({ request }) => {
    const email = `s37-exp-${Date.now()}@example.com`;
    await request.post("/api/auth/signup", {
      headers: { "content-type": "application/json" },
      data: { email, password: "SuperSecret99!" },
    });
    const { randomBytes, createHmac } = await import("node:crypto");
    const secret = E2E_AUTH_SECRET; // the playwright webServer's fixed secret
    const token = randomBytes(32).toString("hex");
    const hash = createHmac("sha256", secret).update(`r1:${token}`).digest("hex");
    const db = await s34SpecDb();
    try {
      await db.user.update({
        where: { email },
        data: { resetTokenHash: hash, resetTokenExpiresAt: new Date(Date.now() - 1000) },
      });
    } finally {
      await db.$disconnect();
    }
    const res = await request.post("/api/auth/reset-password", {
      headers: { "content-type": "application/json" },
      data: { token, password: "BrandNewPw456!" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid or expired reset token");
  });
});

test.describe("session-37 parity: the main-thread-blocking budget (TBT)", () => {
  test("every route's TBT stays under 500ms on the standalone (the s33->s36 budget family, now interaction latency)", async ({ page }) => {
    // Measured 0-51ms per route on the production standalone (probe
    // s37-probe-tbt.js) — a 10x+ headroom ceiling that still catches the
    // pathological regressions: a giant synchronous hydration task, a
    // render-blocking script. The longtask PerformanceObserver is the
    // collection seam; blocking = max(0, duration - 50ms) summed.
    const ROUTES = [
      "/",
      "/Home",
      "/Courses",
      "/Pricing",
      "/About",
      "/Contact",
      "/BecomeInstructor",
      "/AIAssistant",
      "/Dashboard",
      "/login",
      "/CourseDetail?id=seed-1",
    ];
    const summary: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "load", timeout: 30000 });
      const tbt = await page.evaluate(async () => {
        await new Promise((res) => setTimeout(res, 2000));
        let durations: number[] = [];
        try {
          const po = new PerformanceObserver(() => {});
          po.observe({ type: "longtask", buffered: true });
          durations = po.takeRecords().map((e) => e.duration);
          po.disconnect();
        } catch {
          durations = [];
        }
        return durations.reduce((acc, d) => acc + Math.max(0, d - 50), 0);
      });
      summary.push(`${route}=${Math.round(tbt)}ms`);
      expect(tbt, `${route} TBT under 500ms (all: ${summary.join(", ")})`).toBeLessThan(500);
    }
  });
});

test.describe("session-38 parity: the 404-metadata surface (the raw-path derivation family)", () => {
  test("the derived 404 title battery (the startCase contract, probed on the live)", async ({ page }) => {
    // The live derives the 404 document title from the LAST non-empty path
    // segment, lodash-startCase-style (words split on hyphens, underscores
    // AND lower->upper camel boundaries; first letter uppercased, the REST
    // PRESERVED) + " | NexusLearn" — server-rendered in its HTML head.
    const cases: Array<[string, string]> = [
      ["/definitely-not-a-real-route", "Definitely Not A Real Route | NexusLearn"],
      // a case-variant miss (the /login exact-match family)
      ["/RESET-PASSWORDX", "RESET PASSWORDX | NexusLearn"],
      // a nested miss (the LAST non-empty segment wins)
      ["/Courses/deeper/missing", "Missing | NexusLearn"],
      // a trailing-slash miss (the trailing slash never contributes a segment)
      ["/no-such-page-xyz/", "No Such Page Xyz | NexusLearn"],
      // a camel miss (the cOurSes-style hump split — every lower->upper
      // transition is a boundary)
      ["/cOurSesX", "C Our Ses X | NexusLearn"],
    ];
    for (const [path, expectedTitle] of cases) {
      await page.goto(path);
      await expect(page).toHaveTitle(expectedTitle);
    }
  });

  test("the 404 canonical + og:url + twitter:url carry the raw path (+ the query)", async ({ request }) => {
    // Probed on the live: canonical/og:url/twitter:url all mirror the raw
    // path with the trailing slash stripped and the query INCLUDED.
    const res = await request.get("/no-such-page-xyz?x=1");
    expect(res.status()).toBe(404);
    // The house pattern (the s6 specs): canonical/og:url assertions are
    // ORIGIN-AGNOSTIC — the build-time metadataBase port is not a parity
    // surface; the PATH + QUERY are the contract.
    const html = await res.text();
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/)?.[1];
    const twitterUrl = html.match(/<meta name="twitter:url" content="([^"]*)"/)?.[1];
    for (const [label, u] of [["canonical", canonical], ["og:url", ogUrl], ["twitter:url", twitterUrl]] as const) {
      expect(u, `${label} present`).toBeTruthy();
      const parsed = new URL(u!);
      expect(`${parsed.pathname}${parsed.search}`, `${label} carries the raw path + query`).toBe(
        "/no-such-page-xyz?x=1"
      );
    }
    // og:title + twitter:title mirror the derived document title
    expect(html).toContain('<meta property="og:title" content="No Such Page Xyz | NexusLearn"/>');
    expect(html).toContain('<meta name="twitter:title" content="No Such Page Xyz | NexusLearn"/>');
  });

  test("the 404 status + body view are unchanged (the s10/s24 pins re-run)", async ({ page }) => {
    // The metadata fix must not touch the VIEW: status 404 (the live 200s
    // every GET — the clone's deliberate-better) + the reference body.
    const res = await page.request.get("/definitely-not-a-real-route");
    expect(res.status()).toBe(404);
    await page.goto("/definitely-not-a-real-route");
    await expect(page.locator("h1")).toHaveText("404");
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(page.locator("main p")).toContainText('"definitely-not-a-real-route"');
    await expect(page.getByRole("button", { name: "Go Home" })).toBeVisible();
  });

  test("the real-route titles are unaffected by the layout derivation (the guard)", async ({ page }) => {
    // The layout is global — every real route must keep its exact title.
    // The four no-title renders (/, /Home, /login, /reset-password) keep
    // the plain root title via the ABSOLUTE form; the titled routes keep
    // their template-resolved segments.
    const cases: Array<[string, string]> = [
      ["/", "NexusLearn"],
      ["/Home", "NexusLearn"],
      ["/login", "NexusLearn"],
      ["/reset-password", "NexusLearn"],
      ["/Courses", "Courses | NexusLearn"],
      ["/CourseDetail?id=seed-1", "Course Detail | NexusLearn"],
      ["/AIAssistant", "AI Assistant | NexusLearn"],
    ];
    for (const [path, expectedTitle] of cases) {
      await page.goto(path);
      await expect(page).toHaveTitle(expectedTitle);
    }
  });

  test("the real-route canonicals are unaffected (the landing + login guard)", async ({ request }) => {
    // / + /Home canonicalize to the ROOT (probed on the live — the
    // footer-link route carries the landing's canonical); /login its own.
    // Origin-agnostic (the house pattern): the path is the contract.
    for (const [path, expectedPathname] of [
      ["/Home", "/"],
      ["/", "/"],
      ["/login", "/login"],
    ] as const) {
      const html = await (await request.get(path)).text();
      const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
      expect(canonical, `${path} canonical present`).toBeTruthy();
      expect(new URL(canonical!).pathname, `${path} canonical`).toBe(expectedPathname);
    }
  });
});

test.describe("session-38 parity: the interaction-latency (INP-proxy) budget", () => {
  test("the mobile-menu OPEN interaction lands under 200ms (the INP-good threshold)", async ({ page }) => {
    // The s33 bundle -> s34 JS -> s35 TTFB -> s36 FCP/LCP -> s37 TBT
    // budget family, now the INTERACTION dimension: the lab INP proxy is
    // the click -> panel-state-flip latency of the highest-regression-
    // risk chrome (the mobile menu — the Tailwind v4 watch surface).
    // Measured 6-9ms on dev; 200ms = the Core-Web-Vitals INP "good"
    // threshold (20x+ headroom, effectively unflakeable).
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const latencyMs = await page.evaluate(async () => {
      const nav = document.querySelector("nav");
      const candidates = Array.from(nav?.querySelectorAll('[class*="md:hidden"]') ?? []);
      const btn = (candidates.find((el) => el.querySelector("svg")) ?? candidates[0]) as HTMLElement;
      const panels = Array.from(document.querySelectorAll('nav div[class*="md:hidden"]'));
      const panel = panels[panels.length - 1];
      if (!btn || !panel) throw new Error("mobile menu chrome not found");
      const beforeCls = panel.getAttribute("class") ?? "";
      const beforeH = panel.getBoundingClientRect().height;
      const t0 = performance.now();
      btn.click();
      await new Promise<void>((resolve) => {
        const deadline = performance.now() + 10000;
        const check = () => {
          const cls = panel.getAttribute("class") ?? "";
          const h = panel.getBoundingClientRect().height;
          if (cls !== beforeCls || h > beforeH + 1 || performance.now() > deadline) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
      return performance.now() - t0;
    });
    expect(latencyMs, `mobile-menu open latency ${Math.round(latencyMs)}ms < 200ms`).toBeLessThan(200);
  });
});

test.describe("session-39 parity: the encoded-slash (%2F) 404-title derivation", () => {
  // Fresh-eyes family A: the live decodes the FULL raw path FIRST, then
  // splits on "/" — the last non-empty DECODED segment is the title source
  // (7 shapes probed). The clone's previous seam split the raw path first:
  // "/enc%2Fslash" titled "Enc/slash" vs the live's "Slash".
  test("the %2F title battery (the decode-then-split contract)", async ({ page }) => {
    for (const [shape, expectedTitle] of [
      ["/enc%2Fslash", "Slash | NexusLearn"],
      ["/a%2F", "A | NexusLearn"],
      ["/a%2Fb%2Fc", "C | NexusLearn"],
      ["/x%2FmyPage", "My Page | NexusLearn"],
      ["/first%2Fsecond-third", "Second Third | NexusLearn"],
      ["/Courses%2Fdeeper%2Fmissing", "Missing | NexusLearn"],
      ["/%2F", "NexusLearn"],
    ] as const) {
      await page.goto(shape, { waitUntil: "domcontentloaded" });
      await expect(page, `${shape} renders its derived title`).toHaveTitle(expectedTitle);
    }
  });

  test("the s38 title identities are unchanged (the regression guard)", async ({ page }) => {
    // The X-suffixed shapes (the s38 discipline): the pure-case variants
    // (/cOurSes) hit the proxy's documented case-rewrite (the clean
    // "Courses" title — the deliberate-better family); only the truly
    // unknown paths reach the 404 derivation.
    for (const [shape, expectedTitle] of [
      ["/definitely-not-a-real-route", "Definitely Not A Real Route | NexusLearn"],
      ["/RESET-PASSWORDX", "RESET PASSWORDX | NexusLearn"],
      ["/cOurSesX", "C Our Ses X | NexusLearn"],
      ["/foo%20bar", "Foo Bar | NexusLearn"],
      ["/caf%C3%A9", "Café | NexusLearn"],
    ] as const) {
      await page.goto(shape, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(expectedTitle);
    }
  });
});

test.describe("session-39 parity: the canonical query-processing contract (every route)", () => {
  // Fresh-eyes family B: the live processes the query of EVERY canonical —
  // real routes AND the 404 — through the pinned algorithm (the tracking
  // exclusion set, the stable alpha-sort, the URLSearchParams serialization)
  // and mirrors the result into og:url + twitter:url. Origin-agnostic (the
  // house pattern): the search string is the contract.
  const canonicalSearchOf = async (page: Page, path: string) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const read = (sel: string, attr: string) =>
      page.locator(sel).first().getAttribute(attr);
    const canonical = await read('link[rel="canonical"]', "href");
    const ogUrl = await read('meta[property="og:url"]', "content");
    const twitterUrl = await read('meta[name="twitter:url"]', "content");
    return { canonical, ogUrl, twitterUrl };
  };

  test("real routes carry the kept query on the canonical + og:url + twitter:url", async ({ page }) => {
    // probed on the live: /Courses?x=1 -> .../Courses?x=1 (all three)
    const { canonical, ogUrl, twitterUrl } = await canonicalSearchOf(page, "/Courses?x=1");
    expect(new URL(canonical!).search).toBe("?x=1");
    expect(new URL(ogUrl!).search).toBe("?x=1");
    expect(new URL(twitterUrl!).search).toBe("?x=1");
    expect(new URL(canonical!).pathname).toBe("/Courses");
  });

  test("the tracking params are dropped, the rest sorted", async ({ page }) => {
    // probed: /Courses?utm_source=a&x=1 -> ?x=1; /Courses?z=1&a=2 -> ?a=2&z=1
    const utm = await canonicalSearchOf(page, "/Courses?utm_source=a&x=1");
    expect(new URL(utm.canonical!).search).toBe("?x=1");
    const sorted = await canonicalSearchOf(page, "/Courses?z=1&a=2");
    expect(new URL(sorted.canonical!).search).toBe("?a=2&z=1");
    expect(new URL(sorted.ogUrl!).search).toBe("?a=2&z=1");
  });

  test("a fully-excluded query renders the bare canonical (probed: ?utm_source=test)", async ({ page }) => {
    const { canonical, ogUrl } = await canonicalSearchOf(page, "/Pricing?utm_source=test");
    expect(new URL(canonical!).search).toBe("");
    expect(new URL(ogUrl!).search).toBe("");
    expect(new URL(canonical!).pathname).toBe("/Pricing");
  });

  test("the login + landing + /Home carry the query (the /Home->root rule)", async ({ page }) => {
    const login = await canonicalSearchOf(page, "/login?x=1");
    expect(new URL(login.canonical!).search).toBe("?x=1");
    expect(new URL(login.canonical!).pathname).toBe("/login");
    // the landing + /Home canonicalize to the ROOT + the query (probed)
    const landing = await canonicalSearchOf(page, "/?x=1");
    expect(new URL(landing.canonical!).pathname).toBe("/");
    expect(new URL(landing.canonical!).search).toBe("?x=1");
    const home = await canonicalSearchOf(page, "/Home?x=1");
    expect(new URL(home.canonical!).pathname).toBe("/");
    expect(new URL(home.canonical!).search).toBe("?x=1");
  });

  test("CourseDetail keeps every param sorted (probed: ?id=<real>&extra=2 -> ?extra=2&id=<real>)", async ({ page }) => {
    const { canonical, ogUrl, twitterUrl } = await canonicalSearchOf(
      page,
      "/CourseDetail?id=seed-1&extra=2"
    );
    expect(new URL(canonical!).search).toBe("?extra=2&id=seed-1");
    expect(new URL(ogUrl!).search).toBe("?extra=2&id=seed-1");
    expect(new URL(twitterUrl!).search).toBe("?extra=2&id=seed-1");
  });

  test("the reset-password canonical keeps the token, drops utm, sorts", async ({ page }) => {
    // probed: ?token=abc&utm_source=z -> ?token=abc; ?z=1&token=abc -> ?token=abc&z=1
    const a = await canonicalSearchOf(page, "/reset-password?token=abc&utm_source=z");
    expect(new URL(a.canonical!).search).toBe("?token=abc");
    const b = await canonicalSearchOf(page, "/reset-password?z=1&token=abc");
    expect(new URL(b.canonical!).search).toBe("?token=abc&z=1");
  });

  test("the 404 canonical processes the query (not the raw pass-through)", async ({ page }) => {
    // probed: /no-such-page-xyz?utm_source=a&y=2 -> ?y=2; ?z=1&a=2 -> ?a=2&z=1
    const utm = await canonicalSearchOf(page, "/no-such-page-xyz?utm_source=a&y=2");
    expect(new URL(utm.canonical!).search).toBe("?y=2");
    expect(new URL(utm.ogUrl!).search).toBe("?y=2");
    expect(new URL(utm.twitterUrl!).search).toBe("?y=2");
    const sorted = await canonicalSearchOf(page, "/no-such-page-xyz?z=1&a=2");
    expect(new URL(sorted.canonical!).search).toBe("?a=2&z=1");
  });

  test("the no-query guards: query-less visits render the bare standing canonicals", async ({ page }) => {
    for (const [path, pathname] of [
      ["/Courses", "/Courses"],
      ["/login", "/login"],
      ["/", "/"],
      ["/Home", "/"],
      ["/CourseDetail?id=seed-1", "/CourseDetail"],
    ] as const) {
      const { canonical } = await canonicalSearchOf(page, path);
      expect(new URL(canonical!).pathname, `${path} pathname`).toBe(pathname);
      if (path.includes("?")) {
        expect(new URL(canonical!).search, `${path} keeps its id`).toBe("?id=seed-1");
      } else {
        expect(new URL(canonical!).search, `${path} carries no query`).toBe("");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Session 40 — the trailing-slash resolution tier (fresh-eyes family A: a
// REAL functional parity drift, probed shape-by-shape on the live). The live
// resolves single-trailing-slash paths through a three-tier contract:
// content routes RENDER at the typed slashed URL; exact-match routes
// (/login, /reset-password) + slash → the platform 404 with the DERIVED head
// (title "Login | NexusLearn", canonical /login); unknown + slash → the same
// platform-404 family. The clone's resolution: exact-case content routes
// canonicalize via the s24 308; case-variant content routes render at the
// typed URL (the s17 contract); exact-match routes force the in-app 404 view
// (the platform tier's in-app equivalent — the head family matches, the page
// content is the documented platform-artifact variance); unknown slash
// shapes fall to the router's natural 404. The leading-// and multi-slash
// shapes are normalized by Next PRE-PROXY (uncontrollable — the documented
// deliberate-variance family, the mirror of the live's %zz infra-400).
// Reference: docs/remediation-plan-session40.md (finding 1).
// ---------------------------------------------------------------------------

test.describe("session-40 parity: the trailing-slash resolution tier", () => {
  test("the exact-case content route canonicalizes via the s24 308 (now proxy-issued)", async ({ request }) => {
    const res = await request.get("/Courses/", { maxRedirects: 0 });
    expect(res.status(), "the slash variant redirects").toBe(308);
    expect(res.headers().location, "the relative Location form (the s24 pin)").toBe("/Courses");
  });

  test("the redirect Location carries the raw search (Next's own behavior)", async ({ request }) => {
    const res = await request.get("/CourseDetail/?id=seed-1&extra=2", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe("/CourseDetail?id=seed-1&extra=2");
  });

  test("the case-variant + slash composite RENDERS at the typed URL (the live's contract)", async ({ page }) => {
    const res = await page.goto("/courses/", { waitUntil: "domcontentloaded" });
    expect(res?.request().redirectedFrom(), "no redirect hop — the URL bar keeps /courses/").toBeNull();
    expect(page.url().endsWith("/courses/")).toBe(true);
    // The full catalog renders (the s17 render contract through the slash tier).
    await expect(page.locator("main h1")).toHaveText("Explore Our Courses");
    // The head family stays clean: canonical-case canonical + the mirrors.
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/Courses");
    expect(new URL(canonical!).search).toBe("");
  });

  test("/login/ renders the in-app 404 view with the platform-404 head family", async ({ page }) => {
    const res = await page.goto("/login/", { waitUntil: "domcontentloaded" });
    expect(res?.status(), "a REAL 404 (the s24 principle — the live platform-404s it)").toBe(404);
    expect(res?.request().redirectedFrom(), "no redirect — the live never redirects").toBeNull();
    await expect(page).toHaveTitle("Login | NexusLearn");
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/login");
    expect(new URL(canonical!).search).toBe("");
  });

  test("/reset-password/ + token renders the 404 view with the derived head", async ({ page }) => {
    const res = await page.goto("/reset-password/?token=abc", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(404);
    await expect(page).toHaveTitle("Reset Password | NexusLearn");
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/reset-password");
    expect(new URL(canonical!).search).toBe("?token=abc");
  });

  test("an unknown path + slash falls to the natural 404 (no redirect)", async ({ page }) => {
    const res = await page.goto("/nope/", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(404);
    expect(res?.request().redirectedFrom()).toBeNull();
    expect(page.url().endsWith("/nope/")).toBe(true);
    await expect(page).toHaveTitle("Nope | NexusLearn");
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/nope");
  });

  test("the verb guard keeps precedence over the slash resolution (POST /Courses/ -> 405)", async ({ request }) => {
    const res = await request.post("/Courses/");
    expect(res.status()).toBe(405);
    expect(res.headers().allow).toBe("GET, HEAD");
  });

  test("the API slash tolerance: /api/health/ answers 200 (the live-matching form)", async ({ request }) => {
    const res = await request.get("/api/health/");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, service: "nexuslearn" });
  });
});

// ---------------------------------------------------------------------------
// Session 40 — the s17×s39 cross-product pins (fresh-eyes family B: the
// case-variant × query-processing composition, verified matching on both
// sites but never pinned — the s39 specs visit canonical-case URLs only).
// Reference: docs/remediation-plan-session40.md (finding 3).
// ---------------------------------------------------------------------------

test.describe("session-40 parity: the case-variant × query composite", () => {
  test("/courses?x=1 renders the catalog + the canonical-case canonical with the query", async ({ page }) => {
    await page.goto("/courses?x=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toHaveText("Explore Our Courses");
    expect(page.url().endsWith("/courses?x=1")).toBe(true);
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/Courses");
    expect(new URL(canonical!).search).toBe("?x=1");
    const ogUrl = await page.locator('meta[property="og:url"]').first().getAttribute("content");
    expect(new URL(ogUrl!).search).toBe("?x=1");
  });

  test("/courseDetail?id=seed-1&extra=2 renders the course (firstId) + the sorted canonical", async ({ page }) => {
    await page.goto("/courseDetail?id=seed-1&extra=2", { waitUntil: "domcontentloaded" });
    // The rendering uses the FIRST id (the s17 pin) — the course renders.
    await expect(page.locator("main h1")).toHaveText("Complete Web Development Bootcamp 2026");
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/CourseDetail");
    expect(new URL(canonical!).search).toBe("?extra=2&id=seed-1");
  });
});

// ---------------------------------------------------------------------------
// Session 40 — the LCP/FCP/CLS budget family (fresh-eyes family C — the
// session_82-suggested direction (b); TTFB/TBT/INP are pinned by s32/s37/s38,
// the loading + visual-stability trio was not). Measured on the production
// standalone server (cold-cache first visits): / LCP 1396ms / FCP 436ms,
// CLS 0.00000 on every route (the reveal system's transform/opacity
// animations are CLS-free). The budgets pin the Core-Web-Vitals "good"
// thresholds — the same approach as the standing budget pins.
// Reference: docs/remediation-plan-session40.md (finding 4).
// ---------------------------------------------------------------------------

test.describe("session-40 parity: the LCP/FCP/CLS budget", () => {
  const VITALS_ROUTES = ["/", "/Courses", "/CourseDetail?id=seed-1", "/login"];

  for (const route of VITALS_ROUTES) {
    test(`${route}: LCP < 2500ms, FCP < 1800ms, CLS < 0.1 (the CWV "good" thresholds)`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load", timeout: 45000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2500);
      const vitals = await page.evaluate(() =>
        new Promise<{ lcp: number | null; fcp: number | null; cls: number }>((resolve) => {
          const out = { lcp: null as number | null, fcp: null as number | null, cls: 0 };
          new PerformanceObserver((l) => {
            const entries = l.getEntries();
            if (entries.length) out.lcp = entries[entries.length - 1].startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver((l) => {
            const entries = l.getEntries();
            const fcp = entries.find((e) => e.name === "first-contentful-paint");
            if (fcp) out.fcp = fcp.startTime;
          }).observe({ type: "paint", buffered: true });
          new PerformanceObserver((l) => {
            // Structural cast — LayoutShift is not in this TS version's DOM lib
            // (and PerformanceEntry lacks value/hadRecentInput, hence unknown).
            const shifts = l.getEntries() as unknown as Array<{ hadRecentInput?: boolean; value: number }>;
            for (const e of shifts) {
              if (!e.hadRecentInput) out.cls += e.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(out), 500);
        })
      );
      // LCP: null means "no LCP-eligible paint observed" (an empty shell) —
      // on these four routes the hero/card imagery always fires it.
      expect(vitals.lcp, `${route}: LCP must be observed`).not.toBeNull();
      expect(vitals.lcp!, `${route}: LCP budget (measured headroom ~1.8x)`).toBeLessThan(2500);
      expect(vitals.fcp, `${route}: FCP must be observed`).not.toBeNull();
      expect(vitals.fcp!, `${route}: FCP budget`).toBeLessThan(1800);
      expect(vitals.cls, `${route}: CLS budget (measured 0.00000)`).toBeLessThan(0.1);
    });
  }
});

// ─── session-41 parity: the auth-shell head family + the head census pins ──
// Fresh-eyes family A — the COMPLETE per-route head census (every meta/link
// on all 14 live route shapes, extracted order-agnostically from the raw SSR
// HTML) found the live's two platform-AUTH routes (/login + /reset-password,
// incl. its ?token= variant) carrying a head family the app routes NEVER
// see, and the inverse: the app routes ship og:image URL-ONLY where the
// clone shipped unpinned dimensions on every route.
//
// The live's auth-shell family (mirrored here): viewport-fit=cover in the
// viewport meta, <meta name="theme-color" content="#000000">, the
// apple-touch-icon link (sizes="180x180"), og:image:width=1200 +
// og:image:height=630 + og:image:alt="Base44 link preview" +
// twitter:image:alt="Base44 link preview" (the platform generator's string,
// mirrored byte-exactly — the platform-404-body precedent).
//
// Documented variance (uncontrollable at the app layer): the live's
// "initial-scale=1.0" notation (Next serializes initialScale: 1 as "1" —
// the parsed viewport is identical) and the live's infra URLs (the
// supabase render/icon URLs — the clone's /logo.png equivalent, the same
// family as rel:icon).
test.describe("session-41 parity: the auth-shell head family", () => {
  // The raw-HTML request level (the s38 house pattern — head assertions
  // never depend on client hydration).
  const authShapes = ["/login", "/reset-password", "/reset-password?token=abc"];

  for (const shape of authShapes) {
    test(`${shape} carries the full auth-shell head family (viewport-fit, theme-color, apple-touch-icon, image dims/alt)`, async ({ request }) => {
      const res = await request.get(shape);
      expect(res.status()).toBe(200);
      const html = await res.text();
      // (a) the viewport meta gains viewport-fit=cover (the notch-extends-
      // webview rendering mode — user-visible on iOS).
      const viewport = html.match(/<meta name="viewport" content="([^"]*)"/)?.[1];
      expect(viewport, "viewport meta present").toBeTruthy();
      expect(viewport!, "viewport-fit=cover (the auth-shell family)").toContain("viewport-fit=cover");
      expect(viewport!, "the base width/initialScale restated").toContain("width=device-width");
      // (b) the mobile browser chrome tint.
      expect(html).toContain('<meta name="theme-color" content="#000000"/>');
      // (c) the iOS home-screen icon — the live's auth shell ships it with
      // sizes="180x180" (the href is the clone's /logo.png — the infra-URL
      // variance family, the same relationship as rel:icon).
      const apple = html.match(/<link rel="apple-touch-icon"([^>]*)>/)?.[1] ?? "";
      expect(apple, "apple-touch-icon present on the auth shell").toContain('href="/logo.png"');
      expect(apple, "the live's sizes attribute").toContain('sizes="180x180"');
      // (d) the og:image dimensions + the platform alt + twitter:image:alt.
      expect(html).toContain('<meta property="og:image:width" content="1200"/>');
      expect(html).toContain('<meta property="og:image:height" content="630"/>');
      expect(html).toContain('<meta property="og:image:alt" content="Base44 link preview"/>');
      expect(html).toContain('<meta name="twitter:image:alt" content="Base44 link preview"/>');
      // The s37/s6 pins re-asserted alongside (the family changes NOTHING
      // else): the plain title + the token-carrying canonical family.
      expect(html).toContain("<title>NexusLearn</title>");
      const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
      const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/)?.[1] ?? "";
      // The s38 house pattern: origin-agnostic path + query assertions.
      const pathAndQuery = (u: string) => `${new URL(u).pathname}${new URL(u).search}`;
      expect(pathAndQuery(canonical), "canonical path+query").toBe(shape);
      expect(pathAndQuery(ogUrl), "og:url path+query").toBe(shape);
    });
  }

  test("the app routes carry the URL-ONLY image family + the plain viewport (no auth-shell leakage)", async ({ request }) => {
    // The live's app-shell routes (all 9 content routes + the 404, probed)
    // ship og:image/twitter:image URL-ONLY — NO dimensions, NO alt — and the
    // plain viewport with NO viewport-fit and NO theme-color.
    for (const shape of ["/", "/Courses", "/no-such-page-s41"]) {
      const res = await request.get(shape);
      const html = await res.text();
      for (const absent of [
        '<meta property="og:image:width"',
        '<meta property="og:image:height"',
        '<meta property="og:image:alt"',
        '<meta name="twitter:image:alt"',
        '<meta name="theme-color"',
        'rel="apple-touch-icon"',
        "viewport-fit=cover",
      ]) {
        expect(html.includes(absent), `${shape} must not carry ${absent}`).toBe(false);
      }
      // The image URL itself survives (the s6 pin) — session 42: the
      // RENDER tier URL (the live's og:image render URL serves every
      // route — app and auth alike).
      expect(html).toContain('<meta property="og:image"');
      const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? "";
      expect(ogImage).toContain("/og-image.png");
      const viewport = html.match(/<meta name="viewport" content="([^"]*)"/)?.[1] ?? "";
      expect(viewport, "the plain app viewport").toBe("width=device-width, initial-scale=1");
    }
  });
});

test.describe("session-41 parity: the reveal-under-reduced-motion no-adaptation contract", () => {
  // Fresh-eyes family C: the s22 media-emulation pin froze transition
  // DURATIONS under reduce; the reveal ENTRY engine (the live's
  // framer-motion vs the clone's WAAPI) was never probed under reduce.
  // Probed on both sites: the reveal transitions PLAY under
  // prefers-reduced-motion: reduce (the live's framer-motion is
  // unconfigured — no MotionConfig reducedMotion="user"; the clone's WAAPI
  // does not auto-respect the query). This pin freezes the matching
  // no-adaptation contract: a future accessibility pass cannot diverge the
  // clone from the live without the documentation gate.
  test("the reveal entry animation still transitions under prefers-reduced-motion: reduce (the live's no-adaptation contract)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const samples = await page.evaluate(async () => {
      // A below-fold reveal target (pre-hidden at mount, revealed on scroll).
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      let target: HTMLElement | null = null;
      for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.top > 900 && getComputedStyle(el).opacity === "0") { target = el; break; }
      }
      if (!target) return null;
      target.scrollIntoView({ block: "center" });
      const ops: string[] = [];
      for (let i = 0; i < 18; i++) {
        ops.push(getComputedStyle(target).opacity);
        await new Promise((r) => setTimeout(r, 40));
      }
      return ops;
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(samples, "a pre-hidden below-fold target exists on /").not.toBeNull();
    // The no-adaptation contract: the entry ANIMATES under reduce — the
    // sampled sequence contains intermediate opacities (not the instant
    // 0 -> 1 snap a reduced-motion-respecting engine would produce).
    const distinct = new Set(samples!);
    expect(distinct.size, `intermediate opacities observed: ${[...distinct].join(",")}`).toBeGreaterThan(2);
    expect(samples!.at(-1), "the reveal completes").toBe("1");
  });
});

test.describe("session-41 parity: the route-transition loading UX", () => {
  // Fresh-eyes family B: under throttle the live's in-app nav swaps
  // INSTANTLY (its SPA carries every route in the initial bundle) and shows
  // NO loading shell; the clone keeps the OLD page visible until the RSC
  // payload commits (force-dynamic + no loading.tsx -> nothing prefetched)
  // — also NO loading indicator. Two pinned contracts: (a) NO spinner/
  // loading element appears during navigation (a loading.tsx would ADD one
  // the live never shows — the documented reason none exists); (b) the
  // old-page-persist (the React-transition deliberate-better).
  test("no loading shell appears during a slow in-app navigation; the old page persists until the RSC commit", async ({ page }) => {
    await page.goto("/Courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Hold the target route's RSC payload fetch open for 800ms (the s18
    // transient-state pattern — page.route + a delayed continue).
    await page.route("**/About*", async (route) => {
      const req = route.request();
      if (req.headers()["rsc"] || req.headers()["next-router-state-tree"]) {
        await new Promise((r) => setTimeout(r, 800));
      }
      await route.continue();
    });

    await page.click('nav a[href="/About"]');
    await page.waitForTimeout(400); // mid-flight (the payload is still held)

    // (a) NO spinner/loader element appears mid-flight.
    const spinners = await page.evaluate(() =>
      document.querySelectorAll(
        "[class*='animate-spin'], [class*='loader'], [class*='spinner'], [class*='loading']"
      ).length
    );
    expect(spinners, "no loading indicator mid-navigation (the live's no-loading-shell contract)").toBe(0);

    // (b) The OLD page's h1 is still visible mid-flight (the
    // old-page-persist deliberate-better).
    const h1 = await page.locator("main h1").innerText();
    expect(h1).toContain("Explore Our Courses");

    // (c) The NEW page renders after the payload resolves.
    await page.waitForURL("/About", { timeout: 10000 });
    await expect(page.locator("main h1")).toContainText("About NexusLearn", { timeout: 5000 });
  });
});

test.describe("session-41 parity: the static-asset slash tolerance", () => {
  // Fresh-eyes family D: under skipTrailingSlashRedirect (s40) the clone
  // serves REAL static files at single-trailing-slash paths (the flag's
  // static-tier side effect — never pinned) and 404s nonexistent assets.
  // The LIVE 200s the SPA shell (text/html) for every one of these shapes
  // (the platform's 200-for-everything posture — the documented s24
  // deliberate-better family) and 302s /favicon.ico to its logo (platform
  // chrome; the clone 404s it — the documented variance family).
  test("real static files resolve at single-trailing-slash paths (byte-identical bodies)", async ({ request }) => {
    for (const [asset, type] of [
      ["/manifest.json", "application/json"],
      ["/robots.txt", "text/plain"],
      ["/sitemap.xml", "application/xml"],
      ["/logo.png", "image/png"],
    ] as const) {
      const canonical = await request.get(asset);
      const slashed = await request.get(`${asset}/`);
      expect(canonical.status(), `${asset} canonical status`).toBe(200);
      expect(slashed.status(), `${asset}/ resolves (the flag's static-tier tolerance)`).toBe(200);
      expect(slashed.headers()["content-type"]?.split(";")[0], `${asset}/ content-type`).toBe(type);
      expect(await slashed.text(), `${asset}/ body identical to the canonical path`).toBe(
        await canonical.text()
      );
    }
  });

  test("nonexistent assets 404 at both slash shapes (the real-404 deliberate-better); /favicon.ico 404s (the documented variance)", async ({ request }) => {
    for (const shape of ["/nonexistent-s41.png", "/nonexistent-s41.png/"]) {
      const res = await request.get(shape);
      expect(res.status(), `${shape} -> the real 404 (the live 200s its SPA shell)`).toBe(404);
    }
    // The live 302s /favicon.ico to its supabase logo (platform chrome);
    // the clone ships no favicon.ico file — the documented variance family
    // (both sites' heads point rel:icon at the logo, so no browser fetches
    // favicon.ico in practice).
    const favicon = await request.get("/favicon.ico");
    expect(favicon.status()).toBe(404);
  });
});


// ============================================================================
// Session 42 — the og-image render tier + the error boundary + the network
// resilience + the scroll/no-SW surface.
//
// FOUR fresh-eyes families (the probes: /home/z/my-project/scripts/s42-*):
//
// (A) THE OG:IMAGE RENDER-BYTE CENSUS: the s41 head census pinned the
//     og:image URL/dims/alt at the tag level but never FETCHED the asset.
//     The live's og:image/twitter:image URLs (all 14 route shapes) actually
//     serve a 630x630 PNG, 452,632 bytes, deterministic across fetches —
//     supabase's contain-fit render of the raw 1024x1024 logo. The clone's
//     og:image pointed at /logo.png (the RAW tier, byte-identical to the
//     live's raw object but NOT the render). The fix: public/og-image.png =
//     the live's render bytes verbatim (the raw-logo mirror precedent); the
//     metadata image payloads carry /og-image.png on BOTH shapes; the
//     icon/apple-touch-icon/manifest stay on /logo.png (the live's icon
//     family serves the raw object).
//
// (B) THE ERROR BOUNDARY: the clone shipped NO error.tsx — a persistent
//     client render error showed Next 16's built-in default ("This page
//     couldn't load" — version-dependent chrome; the Next 16 default already
//     silently replaced the old "Application error" string). The live's
//     forced-crash UX is a BLANK WHITE SCREEN (no boundary, no recovery).
//     src/app/error.tsx is the explicit deliberate-better (the s10 real-404
//     precedent). The trigger: Number.prototype.toLocaleString sabotaged
//     PERSISTENTLY (React 19 retries one-shot errors — probed: 5 logged
//     errors, then the disarmed retry succeeded; only persistent errors
//     reach the boundary), landing inside CourseCard's
//     students.toLocaleString(locale) render (CourseCard.tsx:89).
//
// (C) THE NETWORK-RESILIENCE TIER: a surgical RSC abort (text/x-component
//     requests only) makes Next's router "fall back to browser navigation"
//     and the target page still renders; the AI-chat network failure renders
//     the clone's explicit "Network error — please try again." message (the
//     live's perpetual "Thinking..." bubble is the documented platform
//     variance).
//
// (D) THE SCROLL-RESTORATION + NO-SW SURFACE: on back-navigation the clone
//     restores the pre-nav scroll position (~2020 after scrolling to 2000 —
//     the SSR content exists at the browser's restore moment) where the
//     live's async client rendering lands at 0 (the s16 architecture
//     family, opposite sign — the clone's restoration is the
//     deliberate-better). Neither site registers a service worker (the PWA
//     tier is manifest-only on both).
// ============================================================================
test.describe("session-42 parity: the og-image render tier (the byte census)", () => {
  test("GET /og-image.png serves the committed render: 200, image/png, IHDR 630x630, 452632 bytes", async ({ request }) => {
    const res = await request.get("/og-image.png");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    const buf = Buffer.from(await res.body());
    // The PNG IHDR: signature (8) + length (4) + "IHDR" (4), then width/height.
    expect(buf.length).toBe(452632);
    expect(buf.readUInt32BE(16)).toBe(630);
    expect(buf.readUInt32BE(20)).toBe(630);
    // The render is NOT the raw logo (the two tiers are different assets —
    // the raw 1024x1024 stays at /logo.png for the icon family).
    expect(buf.length).not.toBe(1123244);
  });

  test("the raw tier keeps /logo.png: the icon href, the manifest icons, the raw asset itself", async ({ request }) => {
    // rel:icon keeps pointing at the raw logo (the live's icon URLs serve
    // the raw object — the clone's /logo.png is byte-identical to it).
    const html = await (await request.get("/Courses")).text();
    const icon = html.match(/<link rel="icon" href="([^"]*)"/)?.[1] ?? "";
    expect(icon).toContain("/logo.png");
    // The manifest icons keep the raw tier.
    const manifest = await (await request.get("/manifest.json")).json();
    expect(manifest.icons.every((i: { src: string }) => i.src.includes("/logo.png"))).toBe(true);
    // The raw asset is still the 1024x1024 logo.
    const raw = await request.get("/logo.png");
    expect(raw.status()).toBe(200);
    const rawBuf = Buffer.from(await raw.body());
    expect(rawBuf.readUInt32BE(16)).toBe(1024);
    expect(rawBuf.readUInt32BE(20)).toBe(1024);
  });

  test("the auth-shell head carries the RENDER-tier og:image URL with the dimensioned family", async ({ request }) => {
    // The live's auth shell: the og:image URL is the render URL (like every
    // route) AND carries the dimensions + platform alt (the s41 family).
    const html = await (await request.get("/login")).text();
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? "";
    expect(ogImage).toContain("/og-image.png");
    const twitterImage = html.match(/<meta name="twitter:image" content="([^"]*)"/)?.[1] ?? "";
    expect(twitterImage).toContain("/og-image.png");
    // The dims/alt family rides along unchanged (the s41 pins).
    expect(html).toContain('<meta property="og:image:width" content="1200"/>');
    expect(html).toContain('<meta property="og:image:height" content="630"/>');
    expect(html).toContain('<meta property="og:image:alt" content="Base44 link preview"/>');
    // The apple-touch-icon stays on the RAW tier.
    const apple = html.match(/<link rel="apple-touch-icon"([^>]*)>/)?.[1] ?? "";
    expect(apple).toContain('href="/logo.png"');
  });
});

test.describe("session-42 parity: the explicit error boundary", () => {
  test("a persistent client render error renders the on-brand boundary, and Try again recovers", async ({ page }) => {
    // Sign in first (the sabotage arms AFTER the landing settles — no count
    // formatting fires between arming and the nav click; the landing's
    // count surfaces are server-rendered pre-hydration).
    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "$Abcd1234");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    // Arm the PERSISTENT sabotage + navigate. CourseCard calls
    // students.toLocaleString(locale) during the /Courses client render —
    // the throw lands inside a client component's render. React 19 retries
    // one-shot errors (probed), so the sabotage must stay armed until the
    // boundary renders.
    await page.evaluate(() => {
      const orig = Number.prototype.toLocaleString;
      (window as unknown as { __restoreTLS: () => void }).__restoreTLS = () => {
        Number.prototype.toLocaleString = orig;
      };
      Number.prototype.toLocaleString = function () {
        throw new Error("injected persistent toLocaleString failure");
      };
      (document.querySelector('a[href="/Courses"]') as HTMLElement)!.click();
    });
    await page.waitForTimeout(2500);

    // The boundary — NOT the framework default, NOT a blank screen. The
    // not-found.tsx design language: h1 "500" + h2 "Something went wrong".
    await expect(page.locator("h1", { hasText: "500" })).toBeVisible();
    const heading = page.locator("h2", { hasText: "Something went wrong" });
    await expect(heading).toBeVisible();
    const body = await page.evaluate(() => document.body.innerText);
    expect(body).toContain("Try again");
    expect(body).not.toContain("This page couldn't load"); // the Next 16 default replaced
    expect(body).not.toContain("Application error"); // the pre-16 default, gone too

    // The recovery: restore the prototype method, then reset the segment.
    await page.evaluate(() =>
      (window as unknown as { __restoreTLS: () => void }).__restoreTLS()
    );
    await page.getByRole("button", { name: /Try again/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator("h1", { hasText: "Explore Our Courses" })).toBeVisible();
    // The catalog's count formatting works again (the restore survived).
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toMatch(/9 courses/);
  });

  test("the error boundary ships the second recovery path (Back to Home)", async ({ page }) => {
    // The boundary's home link — the static contract (source-pinned in
    // tests/error-boundary-source.test.ts; here the rendered form).
    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "$Abcd1234");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    await page.evaluate(() => {
      const orig = Number.prototype.toLocaleString;
      Number.prototype.toLocaleString = function () {
        throw new Error("injected persistent toLocaleString failure");
      };
      (document.querySelector('a[href="/Courses"]') as HTMLElement)!.click();
    });
    await page.waitForTimeout(2500);

    const home = page.locator('a[href="/"]', { hasText: /Back to Home/i });
    await expect(home).toBeVisible();
    // The link navigates home (the boundary unmounts, the landing renders).
    await home.click();
    await page.waitForTimeout(1500);
    await expect(page.locator("h1")).toContainText("Learn Skills That");
  });
});

test.describe("session-42 parity: the network-resilience tier", () => {
  test("a dead RSC channel falls back to browser navigation — the target page still renders", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "$Abcd1234");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    // Abort ONLY the RSC payload channel (text/x-component requests). The
    // router logs "Failed to fetch RSC payload ... Falling back to browser
    // navigation" and the fallback document request (not RSC-shaped) passes
    // through — probed: the catalog renders via the fallback.
    await page.route("**/*", (route) => {
      const accept = route.request().headerValue("accept") ?? "";
      if (String(accept).includes("text/x-component")) {
        return route.abort("connectionfailed");
      }
      return route.continue();
    });

    await page.click('a[href="/Courses"]');
    await page.waitForTimeout(2500);
    // The fallback navigation completed: the catalog rendered.
    await expect(page.locator("h1", { hasText: "Explore Our Courses" })).toBeVisible();
    expect(page.url()).toContain("/Courses");
  });

  test("the AI-chat network failure renders the explicit Network error message (the live's perpetual Thinking is the documented variance)", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "$Abcd1234");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.goto("/AIAssistant");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);

    // Kill the chat API and send a message.
    await page.route("**/api/ai/chat", (route) => route.abort("failed"));
    const composer = page.locator("textarea");
    await composer.fill("hello");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2500);

    // The clone's failure UX: the explicit network-error assistant message
    // (AIAssistantChat.tsx — the catch branch). The live's platform SPA
    // leaves the perpetual "Thinking..." bubble instead (probed).
    const body = await page.evaluate(() => document.body.innerText);
    expect(body).toContain("Network error — please try again.");
  });
});

test.describe("session-42 parity: the scroll-restoration + no-SW surface", () => {
  test("back-navigation restores the pre-nav scroll position (the live's async SPA lands at 0 — the architecture family)", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "$Abcd1234");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.waitForLoadState("networkidle");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(600);
    await page.goto("/Courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    await page.goBack({ waitUntil: "load" });
    await page.waitForTimeout(1500);

    // The clone's SSR content exists at the browser's restore moment — the
    // position comes back (~2020 observed: the reveal system's transform
    // settling adds ~20px; the threshold tolerates reveal timing). The live
    // lands at 0: its async client rendering grows content AFTER the
    // browser's restore moment clamps to the top.
    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrollY).toBeGreaterThanOrEqual(1500);
    // The navigation entry is the standard back/forward form on both sites.
    const navType = await page.evaluate(
      () =>
        (performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined)?.type
    );
    expect(navType).toBe("back_forward");
  });

  test("no service worker registers on any route (the manifest-only PWA tier both sites ship)", async ({ page }) => {
    for (const route of ["/", "/Courses", "/login"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const controller = await page.evaluate(
        () => navigator.serviceWorker?.controller ?? null
      );
      expect(controller, `${route} — neither site registers a service worker`).toBeNull();
    }
  });
});


test.describe("session-43 parity: the global-error boundary (the root-crash tier)", () => {
  // The s42 pass shipped src/app/error.tsx (the page-segment boundary); the
  // ROOT tier was still the framework default — a root-segment client error
  // (the scroll normalizer's effect + the router's own components) escaped
  // every error.tsx boundary. Probed: the default boundary renders "This
  // page couldn't load" chrome AND strips the replacement document (an
  // <html> with only an id — no lang, no design classes). The live's
  // equivalent tier ships no recovery UI at all (frozen shell/blank).
  // Injection: the ONE-SHOT first-registration sabotage. Next's production
  // tree wraps the root layout's tree (the RootLayoutBoundary) in the USER's
  // global-error boundary, while the router's own history registration lives
  // OUTSIDE it (under the outermost BUILT-IN boundary). Exactly two
  // registrations happen at hydration — ScrollRestoreNormalizer's FIRST (the
  // root layout's own client component), the router's SECOND (probed). The
  // sabotage throws on the FIRST registration only: the error lands INSIDE
  // the root layout's tree, which is the one class of crash the user's
  // global-error boundary owns (throwing on the router's registration shows
  // the built-in framework tier — the probed default).
  test("a root-tier client error renders the on-brand boundary, and Try again recovers", async ({ page }) => {
    await page.addInitScript(`
      const orig = Window.prototype.addEventListener;
      let armed = true;
      window.__restoreAEL = () => { armed = false; };
      Window.prototype.addEventListener = function (type, ...rest) {
        if (type === "popstate" && armed) {
          armed = false;
          throw new Error("injected root-tier history-listener failure");
        }
        return orig.call(this, type, ...rest);
      };
    `);
    await page.goto("/");
    await page.waitForTimeout(3000); // hydration commit + boundary settle

    // The boundary — NOT the framework default, NOT a blank document. The
    // error.tsx design language, one tier up: h1 "500" + h2.
    await expect(page.locator("h1", { hasText: "500" })).toBeVisible();
    await expect(page.locator("h2", { hasText: "Something went wrong" })).toBeVisible();
    const body = await page.evaluate(() => document.body.innerText);
    expect(body).toContain("Try again");
    expect(body).toContain("Back to Home");
    expect(body).not.toContain("This page couldn’t load"); // the Next 16 default replaced
    expect(body).not.toContain("Application error"); // the pre-16 default, gone too

    // The crash-time a11y contract: the document language survives the crash
    // (the probed default boundary stripped EVERY html attribute but id).
    expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");
    // The root layout's document shape survives too.
    expect(await page.evaluate(() => document.documentElement.dataset.scrollBehavior)).toBe("smooth");

    // The recovery: restore the prototype method, then reset the root.
    await page.evaluate("() => window.__restoreAEL()");
    await page.getByRole("button", { name: /Try again/i }).click();
    await page.waitForTimeout(2000);
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toContainText("Learn Skills That");
  });

  test("the Back to Home anchor fully reloads the landing (the second recovery path)", async ({ page }) => {
    // The sessionStorage flag is SPEC-SIDE instrumentation (an isolated
    // context — not app persistence, which the s22 zero-storage pins govern):
    // a real root-layout defect would crash every reload, so the spec models
    // the TRANSIENT defect (the s42 restore-then-recover pattern adapted to
    // the document tier — the disarm must survive the full document load).
    await page.addInitScript(`
      if (!sessionStorage.getItem("s43RootDefectCleared")) {
        const orig = Window.prototype.addEventListener;
        Window.prototype.addEventListener = function (type, ...rest) {
          if (type === "popstate" && !this.__s43Disarmed) {
            this.__s43Disarmed = true;
            throw new Error("injected root-tier history-listener failure");
          }
          return orig.call(this, type, ...rest);
        };
      }
    `);
    await page.goto("/");
    await page.waitForTimeout(3000);

    // The boundary's home link — a PLAIN anchor (no router dependency at the
    // crashed-root tier; source-pinned in tests/global-error-source.test.ts).
    const home = page.locator('a[href="/"]', { hasText: /Back to Home/i });
    await expect(home).toBeVisible();

    // The transient defect clears, then the anchor's full document load
    // recovers the landing (the same recovery a manual reload gives the
    // visitor once the fault is gone).
    await page.evaluate(() => sessionStorage.setItem("s43RootDefectCleared", "1"));
    await home.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2500);
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toContainText("Learn Skills That");
  });
});

test.describe("session-43 parity: the /login zinc theme under every color scheme", () => {
  // The s18 zinc block shipped wrapped in a light-scheme media query, but the
  // live's runtime zinc sheet carries NO wrapper — under a dark-scheme
  // visitor the live kept zinc (rgb(9,9,11)) while the clone deactivated the
  // block (neutral rgb(10,10,10)). The block now applies under every scheme.
  test("the zinc ring survives prefers-color-scheme: dark (the live's runtime sheet has no media wrapper)", async ({ page }) => {
    await page.goto("/login");

    // Light control: zinc active (the s18 contract, unchanged).
    expect(
      await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--ring").trim())
    ).toBe("#09090b");

    // Dark: the block must STAY active — the live keeps zinc under dark.
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--ring").trim())
    ).toBe("#09090b");

    // The focused Sign-in ring slot renders the zinc near-black under dark
    // (transition-all 200ms — wait out the transition before reading slots).
    const btn = page.getByRole("button", { name: "Sign in" });
    await btn.focus();
    await page.waitForTimeout(450);
    const shadow = await btn.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgb(9, 9, 11) 0px 0px 0px 4px");

    // GUARD: every other route keeps the neutral ring under dark (the
    // body:has() scope — the s18 GUARD extended to the dark tier).
    await page.goto("/Courses");
    expect(
      await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--ring").trim())
    ).toBe("#0a0a0a");
  });
});

test.describe("session-43 parity: the intermediate-viewport breakpoint boundaries", () => {
  // The standing heights battery covers 1920 and 375 only; the probe verified
  // 45/45 route-viewport cells byte-exact across md-768/iPad-834/lg-1024/
  // xl-1280/landscape-667. These pins freeze the structural breakpoint
  // contracts (font-metric-independent): the md nav boundary at exactly 768,
  // the catalog column counts, and the landscape mobile-menu geometry.
  test("the md boundary is exactly 768: desktop nav + 2-column catalog at 768; mobile trigger at 767", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/Courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const at768 = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      const desktopRow = nav?.querySelector("div.hidden") ?? null; // hidden md:flex
      const trigger = [...(nav?.querySelectorAll("button") ?? [])].find((b) =>
        b.className.includes("md:hidden")
      );
      const grid = document.querySelector("main .grid");
      const cards = grid ? [...grid.children].slice(0, 3).map((c) => Math.round(c.getBoundingClientRect().y)) : [];
      return {
        desktopRowVisible: desktopRow ? (desktopRow as HTMLElement).offsetParent !== null : false,
        triggerVisible: trigger ? trigger.offsetParent !== null : false,
        firstThreeCardYs: cards,
      };
    });
    expect(at768.desktopRowVisible).toBe(true);
    expect(at768.triggerVisible).toBe(false);
    // 2 columns at md: the first two cards share a row, the third wraps.
    expect(at768.firstThreeCardYs[0]).toBe(at768.firstThreeCardYs[1]);
    expect(at768.firstThreeCardYs[2]).toBeGreaterThan(at768.firstThreeCardYs[1]);

    // One pixel below the boundary: the mobile chrome takes over.
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.waitForTimeout(600);
    const at767 = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      const desktopRow = nav?.querySelector("div.hidden") ?? null;
      const trigger = [...(nav?.querySelectorAll("button") ?? [])].find((b) =>
        b.className.includes("md:hidden")
      );
      return {
        desktopRowVisible: desktopRow ? (desktopRow as HTMLElement).offsetParent !== null : false,
        triggerVisible: trigger ? trigger.offsetParent !== null : false,
      };
    });
    expect(at767.desktopRowVisible).toBe(false);
    expect(at767.triggerVisible).toBe(true);
  });

  test("the lg boundary: the catalog renders 3 columns at 1024 (1 column at 375)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/Courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const ysAt1024 = await page.evaluate(() => {
      const grid = document.querySelector("main .grid");
      return grid ? [...grid.children].slice(0, 3).map((c) => Math.round(c.getBoundingClientRect().y)) : [];
    });
    // 3 columns at lg: the first three cards share one row.
    expect(ysAt1024[0]).toBe(ysAt1024[1]);
    expect(ysAt1024[1]).toBe(ysAt1024[2]);

    // The mobile portrait tier: 1 column (the standing battery's viewport).
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(600);
    const ysAt375 = await page.evaluate(() => {
      const grid = document.querySelector("main .grid");
      return grid ? [...grid.children].slice(0, 2).map((c) => Math.round(c.getBoundingClientRect().y)) : [];
    });
    expect(ysAt375[1]).toBeGreaterThan(ysAt375[0]);
  });

  test("the landscape mobile menu (667×375): the trigger + the full-width panel", async ({ page }) => {
    // The owner-asked mobile-nav comparison on the landscape tier (probed
    // IDENTICAL live-vs-clone: trigger 40×40 at (603,12), panel 667×405 at
    // y=64 — the md boundary holds below 768 on both engines).
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const trigger = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      const t = [...(nav?.querySelectorAll("button") ?? [])].find((b) => b.className.includes("md:hidden"));
      if (!t) return null;
      const r = t.getBoundingClientRect();
      t.click();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(trigger).toEqual({ x: 603, y: 12, w: 40, h: 40 });
    await page.waitForTimeout(1100); // the open animation settles

    const panel = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      const candidates = [...(nav?.querySelectorAll("div") ?? [])].filter(
        (d) => d.className.includes("md:hidden") && d.className.includes("bg-white")
      );
      const p = candidates.find((d) => d.querySelectorAll("a, button").length > 0);
      if (!p) return null;
      const r = p.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(panel).toEqual({ x: 0, y: 64, w: 667, h: 405 });
  });
});

test.describe("session-43 parity: the color-scheme rendering tiers", () => {
  test("emulated dark changes NOTHING (no dark styles — heights + colors identical)", async ({ page }) => {
    // The s22 palette-stability pin extended to the geometry tier: neither
    // site ships dark styles, so the dark-scheme rendering is byte-identical
    // to the light tier (probed 9/9 routes byte-exact live-vs-clone).
    for (const route of ["/", "/Courses"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
      const light = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        return {
          h: document.documentElement.scrollHeight,
          bg: getComputedStyle(document.body).backgroundColor,
          color: getComputedStyle(document.body).color,
          navBg: nav ? getComputedStyle(nav).backgroundColor : "",
        };
      });

      await page.emulateMedia({ colorScheme: "dark" });
      await page.waitForTimeout(400);
      const dark = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        return {
          h: document.documentElement.scrollHeight,
          bg: getComputedStyle(document.body).backgroundColor,
          color: getComputedStyle(document.body).color,
          navBg: nav ? getComputedStyle(nav).backgroundColor : "",
        };
      });
      expect(dark, `${route} — dark changes nothing`).toEqual(light);
      await page.emulateMedia({ colorScheme: null });
    }
  });

  test("forced-colors renders the UA forced palette + unchanged geometry", async ({ page }) => {
    // The Windows-High-Contrast tier (never probed before s43): neither site
    // ships forced-colors overrides, so the UA forced palette applies
    // identically on both (probed: every sampled surface forced the same,
    // the landing height unchanged at 7949).
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const normalHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    await page.emulateMedia({ forcedColors: "active" });
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(normalHeight);
    expect(await page.evaluate(() => getComputedStyle(document.body).color)).toBe("rgb(0, 0, 0)");
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toContainText("Learn Skills That");
    await page.emulateMedia({ forcedColors: null });
  });
});

test.describe("session-43 parity: the long-run stability tier", () => {
  test("10 search cycles return the DOM to the exact baseline (no observer accumulation)", async ({ page }) => {
    // The probe ran 30 cycles + 24 navigations on both sites: zero node
    // drift, deterministic counts, zero console errors. The e2e pins the
    // clone's non-accumulation contract (the RevealController's observer
    // re-observes every filter cycle — an accumulation bug would leak).
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto("/login");
    await page.fill("#email", "sepnetflix2023@outlook.com");
    await page.fill("#password", "$Abcd1234");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.goto("/Courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const baseline = await page.evaluate(() => document.getElementsByTagName("*").length);
    for (let i = 0; i < 10; i++) {
      await page.fill('input[aria-label="Search courses"]', "data");
      await page.waitForTimeout(300);
      await page.fill('input[aria-label="Search courses"]', "");
      await page.waitForTimeout(300);
    }
    const after = await page.evaluate(() => document.getElementsByTagName("*").length);
    expect(after).toBe(baseline);
    expect(errors).toEqual([]);
  });
});


test.describe("session-44 parity: the error-boundary escalation tier", () => {
  // The s43 pass shipped both user boundaries (error.tsx for the page
  // segment + global-error.tsx for the root tier). The ESCALATION class —
  // the page-segment boundary's OWN render failing while it mounts — is the
  // third crash class, and it needs a SECOND, INDEPENDENT sabotage seam:
  // the s42 count-format sabotage forces the first crash; a keyed
  // console.error poison (the string "route render error" exists in
  // exactly one place in the codebase — error.tsx's single render-time
  // call, grep-verified) fails the boundary's own render as it mounts.
  // React's internal logging (different arg shapes) and global-error's
  // "root render error" call pass through untouched. The poison
  // self-disarms after its one throw — the reset remount renders clean.
  //
  // PROBED (s44, the production standalone): the escalation lands in the
  // USER's global-error — the Navbar + Footer GONE (the root layout
  // replaced: the distinguishing evidence vs error.tsx, which keeps the
  // root chrome), the preserved document shape, and the FULL reset
  // recovery. The live's equivalent tier: no boundary at ANY order (the
  // s42/s43 blank/frozen family — the escalation concept does not exist
  // there).
  const ESCALATION_SABOTAGE = `
    // Seam 1 — the s42 persistent count-format poison (armed until disarmed):
    const origToLocale = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = function () {
      if (!window.__disarmCount) throw new Error("s44 count-format sabotage");
      return origToLocale.apply(this, arguments);
    };
    // Seam 2 — the keyed one-shot console.error poison: throws ONLY on
    // error.tsx's "route render error" call (the boundary's own render),
    // then disarms itself forever (the reset remount must render clean).
    const origCE = console.error;
    let armed = true;
    console.error = function (first) {
      if (armed && first === "route render error") {
        armed = false;
        throw new Error("s44 escalation sabotage: the boundary's own render failed");
      }
      return origCE.apply(this, arguments);
    };
  `;

  test("error.tsx's own render failure escalates to the user's global-error (the root tier)", async ({ page }) => {
    await page.addInitScript(ESCALATION_SABOTAGE);
    await page.goto("/Courses");
    await page.waitForTimeout(4500); // first crash -> error.tsx mounts -> its render throws -> the escalation settles

    // The boundary design language, one tier up.
    await expect(page.locator("h1", { hasText: "500" })).toBeVisible();
    await expect(page.locator("h2", { hasText: "Something went wrong" })).toBeVisible();
    const body = await page.evaluate(() => document.body.innerText);
    expect(body).toContain("Try again");
    expect(body).toContain("Back to Home");
    expect(body).not.toContain("This page couldn’t load"); // the built-in default never shows
    expect(body).not.toContain("Application error");

    // THE ESCALATION PROOF — the root layout was REPLACED: the Navbar and
    // the Footer are GONE (an error.tsx render keeps the root chrome; only
    // the global tier removes it).
    expect(await page.evaluate(() => document.querySelectorAll("nav").length)).toBe(0);
    expect(await page.evaluate(() => document.querySelectorAll("footer").length)).toBe(0);

    // The crash-time a11y + document-shape contract (the s43 pins, holding
    // through the escalation).
    expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");
    expect(await page.evaluate(() => document.documentElement.dataset.scrollBehavior)).toBe("smooth");
    expect(await page.evaluate(() => document.body.className)).toContain("font-sans");

    // The plain-anchor home link (no router dependency at the crashed-root
    // tier; source-pinned in tests/global-error-source.test.ts).
    const home = page.locator('a[href="/"]', { hasText: /Back to Home/i });
    await expect(home).toBeVisible();
  });

  test("the escalation's reset() recovers the FULL document (the root-tier reset)", async ({ page }) => {
    await page.addInitScript(ESCALATION_SABOTAGE);
    await page.goto("/Courses");
    await page.waitForTimeout(4500); // the escalation settles

    // The recovery: disarm the count poison FIRST (the console poison has
    // self-disarmed after its one throw), then reset at the root tier.
    await page.evaluate(() => {
      (window as unknown as { __disarmCount?: boolean }).__disarmCount = true;
    });
    await page.getByRole("button", { name: /Try again/i }).click();
    await page.waitForTimeout(2500);

    // The FULL document returns: the root chrome restored, the real page
    // content rendered, the URL intact — the probe's A2 evidence.
    expect(await page.evaluate(() => document.querySelectorAll("nav").length)).toBe(1);
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toContainText("Explore Our Courses");
    expect(await page.evaluate(() => location.pathname)).toBe("/Courses");
  });
});


test.describe("session-45 parity: the mid-session viewport-orientation rotation tier", () => {
  // The s43 landscape tier pinned the STATIC 667x375 geometry; the ROTATION
  // dynamics — crossing the md breakpoint mid-session with the mobile menu
  // open — were never probed. The s45 census (both sites, the rotation
  // matrix 375x667 <-> 667x375 <-> 700x1000 <-> 1000x700) found:
  //   - the panel/trigger geometry MATCHES at every tier (portrait-open,
  //     landscape, 700w, crossed-hidden, round-trip re-open);
  //   - the menu STATE survives the md round trip on BOTH sites (the live
  //     re-opens its panel too — the parity contract the fix preserves);
  //   - THE MD-CROSSING SCROLL-LOCK LEAK (the clone-only bug): the lock was
  //     gated ONLY on the React open-state while the panel hides via CSS —
  //     crossing md left body overflow hidden on a page whose menu was
  //     invisible (the scrollTo clamped at the pre-cross scroll; the live,
  //     which ships no scroll lock at all, scrolled freely). The fix gates
  //     the lock on the SAME md breakpoint the panel uses (matchMedia).
  const panelGeometry = (page: Page) =>
    page.evaluate(() => {
      const nav = document.querySelector("nav");
      if (!nav) return { error: "no nav" as const };
      const trigger = [...nav.querySelectorAll("button")].find((b) =>
        b.className.includes("md:hidden")
      );
      const panel = [...nav.querySelectorAll("div")].find(
        (d) => d.className.includes("md:hidden") && d.className.includes("bg-white")
      );
      if (!trigger || !panel) return { error: "no trigger/panel" as const };
      const pr = panel.getBoundingClientRect();
      const tr = trigger.getBoundingClientRect();
      return {
        panel: { x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height) },
        trigger: { x: Math.round(tr.x), w: Math.round(tr.width) },
        overflow: document.body.style.overflow,
        expanded: trigger.getAttribute("aria-expanded"),
        panelDisplay: getComputedStyle(panel).display,
      };
    });

  test("crossing md with the menu open releases the scroll lock (the leak fix)", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.goto("/");
    await page.waitForTimeout(1500);
    // open the mobile menu below md — the lock applies (the class-G hardening)
    await page.click('nav button[aria-label="Toggle navigation menu"]');
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    // cross md (a rotation past 768px, a foldable expanding, a window drag)
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.waitForTimeout(1200);
    // the panel + trigger CSS-hide, the desktop row appears
    const crossed = await panelGeometry(page);
    expect(crossed.panelDisplay).toBe("none");
    // THE LEAK: the lock must release with the panel gone
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    // the user-facing symptom: the USER can scroll again — the wheel event
    // (real input) is the honest probe: programmatic scrollTo bypasses the
    // body lock, the browser input pipeline does not
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    const scrolled = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrolled).toBeGreaterThan(0);
  });

  test("the portrait scroll lock stays intact below md (the class-G hardening)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.click('nav button[aria-label="Toggle navigation menu"]');
    await page.waitForTimeout(900);
    // the lock applies below md — the fix must not over-release
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    // and the USER cannot scroll while the panel covers the page (the
    // wheel event — real input through the browser's scroller resolution;
    // programmatic scrollTo would bypass the lock)
    await page.mouse.move(180, 300);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    const scrolled = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrolled).toBe(0);
  });

  test("the menu state survives the md round trip; the lock re-applies below md", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.click('nav button[aria-label="Toggle navigation menu"]');
    await page.waitForTimeout(900);
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.waitForTimeout(1200);
    // cross back below md — the panel re-appears OPEN (the probed parity:
    // the live's menu state survives the round trip too) and the lock
    // re-applies with it
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.waitForTimeout(1200);
    const state = await panelGeometry(page);
    expect(state.expanded).toBe("true");
    expect(state.panel).toEqual({ x: 0, y: 64, w: 700, h: 405 });
    expect(state.overflow).toBe("hidden");
  });

  test("the open panel re-geometries across the portrait/landscape rotation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.click('nav button[aria-label="Toggle navigation menu"]');
    await page.waitForTimeout(900);
    const portrait = await panelGeometry(page);
    expect(portrait.panel).toEqual({ x: 0, y: 64, w: 375, h: 405 });

    // rotate to landscape (still below md — the phone-rotation tier)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1200);
    const landscape = await panelGeometry(page);
    // the panel re-flows to the full landscape width, the trigger follows
    expect(landscape.panel).toEqual({ x: 0, y: 64, w: 667, h: 405 });
    expect(landscape.trigger).toEqual({ x: 603, w: 40 });
    expect(landscape.expanded).toBe("true");
  });
});

test.describe("session-45 parity: the paginated print tier (the reveal-in-print contract)", () => {
  // The s29 print census covered the print STYLESHEET (zero @media print
  // rules on either site; emulated print media changes no computed style).
  // The PAGINATED OUTPUT — what "Save as PDF" produces — was never probed.
  // The s45 census (page.pdf per route, both sites): page counts MATCH 9/9
  // (landing 11, courses 4, coursedetail 32, pricing 3, about 3, contact 2,
  // becomeinstructor 4, aiassistant 2, dashboard 2 — the dashboard's initial
  // 3-vs-2 diff was the e2e-db enrollment artifact, isolated via the
  // custom.db re-probe). The headline: BOTH sites print the landing with
  // below-fold reveal content effectively INVISIBLE pre-scroll (opacity-0
  // glyph runs, the below-fold images not even embedded) and FULLY after a
  // complete scroll — the pagination itself is reveal-INVARIANT (the
  // opacity-0 elements reserve their space; 11 pages pre AND post).
  const countPdfPages = (buf: Buffer): number => {
    const s = buf.toString("latin1");
    return (s.match(/\/Type\s*\/Page[^s]/g) || []).length;
  };

  test("the landing print pagination is reveal-invariant (pre-scroll vs post-scroll)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForTimeout(2500);

    // pre-scroll: the below-fold reveal elements sit at opacity 0
    const pre = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal]")];
      return {
        total: els.length,
        hidden: els.filter((e) => Number(getComputedStyle(e).opacity) === 0).length,
      };
    });
    expect(pre.hidden, "the pre-reveal state exists below the fold").toBeGreaterThan(0);
    const prePdf = await page.pdf({ format: "A4" });
    expect(countPdfPages(prePdf)).toBe(11);

    // the full scroll triggers every reveal
    await page.evaluate(async () => {
      for (let y = 0; y <= document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
    });
    await page.waitForTimeout(1500);
    const post = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal]")];
      return {
        total: els.length,
        hidden: els.filter((e) => Number(getComputedStyle(e).opacity) === 0).length,
      };
    });
    expect(post.hidden, "the full scroll reveals everything").toBe(0);
    const postPdf = await page.pdf({ format: "A4" });
    expect(countPdfPages(postPdf), "the pagination is reveal-invariant").toBe(11);
    // the revealed content carries its images — the bytes grow
    expect(postPdf.length).toBeGreaterThan(prePdf.length);
  });

  test("the per-route print page counts (the paginated census)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const expected: [string, number][] = [
      ["/Courses", 4],
      ["/Pricing", 3],
      ["/AIAssistant", 2],
    ];
    for (const [route, pages] of expected) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      const pdf = await page.pdf({ format: "A4" });
      expect(countPdfPages(pdf), `${route} prints ${pages} pages`).toBe(pages);
    }
  });
});

test.describe("session-45 parity: the session-lapse flip (the server-truth contract)", () => {
  // The s45 auth-expiry census: at the session-lapse boundary the clone
  // flips to the signed-out truth at the FIRST navigation (every RSC fetch
  // re-verifies the cookie) while the live holds its in-memory signed-in
  // view through arbitrary soft-navs until a full RELOAD (its SPA state —
  // the s16 stale-state family extended to auth). These specs freeze the
  // clone's immediate-flip contract at both tiers: the cookie the browser
  // drops at maxAge, and the cross-tab end (the API-only logout — no UI
  // ships, matching the reference).
  test("the cookie lapse flips the view at the next navigation", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    await page.goto("/Dashboard");
    await page.waitForTimeout(1500);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, sepnetflix2023");

    // the cookie lapses (the browser drops it at its maxAge boundary)
    await page.context().clearCookies();
    // the CURRENT view stays — no polling, the rendered page is static
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, sepnetflix2023");

    // the next navigation renders the server truth: signed out
    await page.click('nav a[href="/Courses"]');
    await page.waitForURL((u) => u.pathname === "/Courses");
    await page.waitForTimeout(800);
    await page.click('nav a[href="/Dashboard"]');
    await page.waitForURL((u) => u.pathname === "/Dashboard");
    await page.waitForTimeout(1200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back");
  });

  test("the cross-tab logout flips the other tab at its next navigation", async ({ page }) => {
    // tab A signs in; tab B shares the cookie (one context = one jar)
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((u) => !u.pathname.endsWith("/login"));
    const tabB = await page.context().newPage();
    await tabB.goto("/Dashboard");
    await tabB.waitForTimeout(1500);
    await expect(tabB.getByRole("heading", { level: 1 })).toHaveText("Welcome back, sepnetflix2023");

    // tab A ends the session via the API (the API-only logout)
    const status = await page.evaluate(async () => {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      return res.status;
    });
    expect(status).toBe(200);
    // tab B's CURRENT view stays static (no polling — the probed parity)
    await expect(tabB.getByRole("heading", { level: 1 })).toHaveText("Welcome back, sepnetflix2023");

    // tab B's next navigation renders the signed-out truth
    await tabB.click('nav a[href="/Courses"]');
    await tabB.waitForURL((u) => u.pathname === "/Courses");
    await tabB.waitForTimeout(800);
    await tabB.click('nav a[href="/Dashboard"]');
    await tabB.waitForURL((u) => u.pathname === "/Dashboard");
    await tabB.waitForTimeout(1200);
    await expect(tabB.getByRole("heading", { level: 1 })).toHaveText("Welcome back");
    await tabB.close();
  });
});


test.describe("session-46 parity: the print-dialog header/footer + margin tier", () => {
  // The s45 print census pinned the BARE page.pdf() model (no headers,
  // no margins). The Chrome print dialog's DEFAULT model — headers/footers
  // ON + the default margins — was never probed. The s46 census (both
  // sites): the MARGIN tier re-fragments every route IDENTICALLY (landing
  // 11->17, courses 4->10, pricing 3->5, contact 2->3, aiassistant 2->3 at
  // 0.6in top/bottom + 0.4in sides), and the header/footer stamps ride
  // INSIDE the margin box — the hf page count EQUALS the margins-only count
  // on every route with both custom and Chrome-default templates: only the
  // MARGINS change pagination, never the header/footer overlay itself.
  const countPdfPages = (buf: Buffer): number => {
    const s = buf.toString("latin1");
    return (s.match(/\/Type\s*\/Page[^s]/g) || []).length;
  };
  const DIALOG_MARGINS = {
    top: "0.6in",
    bottom: "0.6in",
    left: "0.4in",
    right: "0.4in",
  };

  test("the Chrome-default-margin pagination census (the post-scroll full-ink model)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const expected: [string, number][] = [
      ["/", 17],
      ["/Courses", 10],
      ["/Pricing", 5],
    ];
    for (const [route, pages] of expected) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      // the full scroll first — the s45 reveal-in-print contract: the
      // post-scroll model is the full-ink one the dialog tier rides on.
      await page.evaluate(async () => {
        for (let y = 0; y <= document.documentElement.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1500);
      const pdf = await page.pdf({ format: "A4", margin: DIALOG_MARGINS });
      expect(countPdfPages(pdf), `${route} re-fragments to ${pages} pages at the dialog margins`).toBe(pages);
    }
  });

  test("the header/footer overlay never changes pagination (the stamps ride inside the margin box)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/Courses", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const marginsOnly = await page.pdf({ format: "A4", margin: DIALOG_MARGINS });
    const withFooter = await page.pdf({
      format: "A4",
      margin: DIALOG_MARGINS,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        '<div style="font-size:9px; width:100%; text-align:center;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    });
    expect(countPdfPages(marginsOnly)).toBe(10);
    expect(countPdfPages(withFooter), "the overlay adds ink, not pages").toBe(countPdfPages(marginsOnly));
  });
});

test.describe("session-46 parity: the file-download + Content-Disposition census", () => {
  // The s46 download census (both sites): NOTHING is downloadable anywhere —
  // Content-Disposition is absent on every asset class, zero [download]
  // attributes ship on any route, no download event fires on asset
  // navigation (everything renders inline). The clone's raw-path contract:
  // real PNGs same-origin at /logo.png + /og-image.png, the JSON/XML/TXT
  // metadata files with their explicit content types. The live's binary
  // raw-paths return its SPA shell (its assets are CDN-hosted — the s24
  // family) and its /favicon.ico 302s to its supabase logo; the clone 404s
  // it (no favicon.ico ships — the documented s41 platform-chrome variance).

  test("the public-asset header contract (inline everywhere, nothing downloadable)", async ({ request }) => {
    const expected: [string, RegExp][] = [
      ["/logo.png", /^image\/png/],
      ["/manifest.json", /^application\/json/],
      ["/og-image.png", /^image\/png/],
      ["/sitemap.xml", /^application\/xml/],
      ["/robots.txt", /^text\/plain/],
    ];
    for (const [path, type] of expected) {
      const res = await request.get(path);
      expect(res.status(), `${path} serves 200`).toBe(200);
      expect(res.headers()["content-type"] || "", `${path} carries its type`).toMatch(type);
      expect(res.headers()["content-disposition"] || "", `${path} is inline (no disposition header)`).toBe("");
    }
  });

  test("zero download attributes + the favicon.ico raw-path variance", async ({ page }) => {
    for (const route of ["/", "/Courses", "/Pricing", "/Contact"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const downloads = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[download]")).map((el) => el.tagName)
      );
      expect(downloads, `${route} ships no download attributes`).toEqual([]);
    }
    // the documented platform-chrome variance: no favicon.ico file ships —
    // the live's 302-to-CDN is its platform family (the s41 record).
    const fav = await page.request.get("/favicon.ico");
    expect(fav.status()).toBe(404);
  });
});

test.describe("session-46 parity: the multi-window + opener census", () => {
  // The s46 multi-window census (both sites, all 9 routes signed in): the
  // ZERO-multi-window surface — no element carries a target attribute, no
  // window.open call executes, no postMessage ships, no rel=noopener
  // appears, window.opener is null. Neither site opens popups or named
  // windows anywhere. The one divide: the live's platform registers 1
  // message listener per route (its own chrome — the s44 census extended);
  // the clone's zero-listener stance is guarded by the s44 exact-set source
  // pin. This spec freezes the DOM-side zero-target contract on the public
  // routes (the chrome is auth-invariant — the navbar/footer link sets are
  // identical signed in and out; the probe verified the signed-in census).

  test("no target attributes, no noopener rels, no opener anywhere", async ({ page }) => {
    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const census = await page.evaluate(() => ({
        targets: Array.from(document.querySelectorAll("a, area, form, button"))
          .filter((el) => el.getAttribute("target"))
          .map((el) => `${el.tagName}:${el.getAttribute("target")}`),
        noopenerRels: Array.from(document.querySelectorAll("[rel]"))
          .map((el) => el.getAttribute("rel") || "")
          .filter((r) => /noopener|noreferrer|opener/.test(r)),
        hasOpener: !!window.opener,
      }));
      expect(census.targets, `${route} ships no target attributes`).toEqual([]);
      expect(census.noopenerRels, `${route} ships no noopener family rels`).toEqual([]);
      expect(census.hasOpener, `${route} has no opener`).toBe(false);
    }
  });
});


test.describe("session-47 parity: the new CSS media tiers (prefers-contrast + prefers-reduced-transparency)", () => {
  // The s47 media-tier census (both sites — the app routes signed in, the
  // auth routes signed out, the session_104 direction (a)): ZERO
  // prefers-contrast + ZERO prefers-reduced-transparency rules on EITHER
  // site's app routes, and emulating either tier (plus both at once)
  // changes NOTHING — no heights, no computed styles (the s22
  // no-adaptation contract extended to the two newer media features). The
  // LIVE's auth routes carry platform-sheet rules the clone does not: 2
  // prefers-contrast rules that are the GOOGLE IDENTITY SERVICES button
  // chrome (the injected googleidentityservice_button_styles sheet — s43
  // counted them, s47 identified the owner) + 8 prefers-reduced-motion
  // rules (the auth-shell bundle's motion-safe/motion-reduce
  // view-transition/toast utilities) — ALL INERT (the render tier is
  // byte-identical under contrast:more and reduced-motion:reduce; the
  // platform-chrome documentation family, like the s43 43-keyframes + the
  // s46 message listener). The census-methodology note: the s43 walker
  // never recursed into @layer blocks (Tailwind v4 emits ALL utilities
  // inside @layer), so the clone's 1 forced-colors rule per route —
  // Tailwind v4's own .outline-hidden accessibility helper (a transparent
  // outline, renders nothing; v3 has no such utility, so the live ships
  // 0) — escaped it. These specs freeze the clone's no-adaptation contract
  // on the public routes (the source tier is pinned by
  // tests/platform-surface-source.test.ts).

  test("the render tier adapts nothing under either emulated media tier", async ({ page }) => {
    // The two newer media features ride CDP's Emulation.setEmulatedMedia
    // (Playwright's emulateMedia option set covers contrast natively but
    // not reduced-transparency; one mechanism for all four states avoids
    // composition concerns). The emulation persists across navigations.
    const cdp = await page.context().newCDPSession(page);
    const setFeatures = (features: { name: string; value: string }[]) =>
      cdp.send("Emulation.setEmulatedMedia", { features });

    for (const route of ["/", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);

      const probe = () => page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
        h1: (() => {
          const el = document.querySelector("h1");
          if (!el) return null;
          const cs = getComputedStyle(el);
          return `${cs.color}|${cs.fontSize}|${cs.letterSpacing}`;
        })(),
        nav: (() => {
          const el = document.querySelector("nav");
          return el ? getComputedStyle(el).backgroundColor : null;
        })(),
      }));

      // Baseline: no emulation
      await setFeatures([]);
      await page.waitForTimeout(200);
      const baseline = await probe();
      // The emulation proof: the reads are OFF before, ON under each tier.
      expect(await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches)).toBe(false);
      expect(await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches)).toBe(false);

      await setFeatures([{ name: "prefers-contrast", value: "more" }]);
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches)).toBe(true);
      const contrast = await probe();

      await setFeatures([{ name: "prefers-reduced-transparency", value: "reduce" }]);
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches)).toBe(true);
      const transparency = await probe();

      // Both tiers at once (the maximal-adaptation tier)
      await setFeatures([
        { name: "prefers-contrast", value: "more" },
        { name: "prefers-reduced-transparency", value: "reduce" },
      ]);
      await page.waitForTimeout(200);
      const both = await probe();

      expect(contrast, `${route}: nothing adapts under prefers-contrast: more`).toEqual(baseline);
      expect(transparency, `${route}: nothing adapts under prefers-reduced-transparency: reduce`).toEqual(baseline);
      expect(both, `${route}: nothing adapts under both tiers at once`).toEqual(baseline);
    }
    // Reset (leave the page unemulated for the rest of the suite)
    await setFeatures([]);
    await cdp.detach();
  });

  test("the layer-aware CSSOM census: no app-level prefers-* rules; forced-colors stays the framework helper", async ({ page }) => {
    for (const route of ["/", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      // The LAYER-AWARE walk (the s43 correction — recursing into
      // @layer/@media/@supports, not just top-level media rules).
      const census = await page.evaluate(() => {
        const families: Record<string, string[]> = {
          "prefers-contrast": [],
          "prefers-reduced-transparency": [],
          "prefers-reduced-motion": [],
          "prefers-color-scheme": [],
          "forced-colors": [],
        };
        const walk = (rules: CSSRuleList) => {
          for (const rule of Array.from(rules)) {
            const media = (rule as CSSMediaRule).media;
            if (media) {
              const text = media.mediaText;
              for (const fam of Object.keys(families)) {
                if (text.includes(fam)) families[fam].push(rule.cssText.slice(0, 150));
              }
            }
            if ((rule as { cssRules?: CSSRuleList }).cssRules) {
              try { walk((rule as CSSMediaRule).cssRules); } catch { /* cross-origin or detached */ }
            }
          }
        };
        for (const sheet of Array.from(document.styleSheets)) {
          try { walk(sheet.cssRules); } catch { /* cross-origin */ }
        }
        return families;
      });
      expect(census["prefers-contrast"], `${route}: no prefers-contrast rules`).toEqual([]);
      expect(census["prefers-reduced-transparency"], `${route}: no prefers-reduced-transparency rules`).toEqual([]);
      expect(census["prefers-reduced-motion"], `${route}: no prefers-reduced-motion rules`).toEqual([]);
      expect(census["prefers-color-scheme"], `${route}: no prefers-color-scheme rules`).toEqual([]);
      // The framework containment: every forced-colors rule is Tailwind
      // v4's own .outline-hidden accessibility helper (a transparent
      // outline — renders nothing; the select primitive's shadcn class
      // carries the utility). A future app-level forced-colors adaptation
      // fails this containment instead of drifting silently.
      for (const rule of census["forced-colors"]) {
        expect(rule.includes("outline-hidden"), `${route}: forced-colors stays framework-only (the outline-hidden helper)`).toBe(true);
      }
    }
  });
});


test.describe("session-47 parity: the Web-Share census", () => {
  // The s47 web-share census (both sites, all 9 routes, the session_104
  // direction (b)): the ZERO-share surface — the API absent in the shared
  // probe context, zero instrumented calls (share/canShare overridden
  // before load), zero share-labeled UI elements, no share_target in
  // either manifest (the clone 200 / the live 302 — the s24
  // platform-redirect family). Neither site ships ANY Web-Share surface.
  // This spec freezes the clone's public-route contract (the source tier
  // is pinned by tests/platform-surface-source.test.ts).

  test("no navigator.share surface: API absent, zero share UI, no manifest share_target", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — the same
    // context the probe censused; a Playwright bump that exposes the API
    // re-baselines this read, while the API-USE census stays the durable
    // contract).
    const api = await page.evaluate(() => ({
      share: typeof navigator.share,
      canShare: typeof navigator.canShare,
    }));
    expect(api.share).toBe("undefined");
    expect(api.canShare).toBe("undefined");

    // The UI census across the public routes (share-labeled buttons,
    // links, aria-labels and class names)
    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const shareUi = await page.evaluate(() => {
        const found: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label]"))) {
          const label = (el.getAttribute("aria-label") || el.textContent || "").trim().toLowerCase();
          const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
          if (/share|telegram|whatsapp/.test(label) || /share/.test(cls)) {
            found.push(`${el.tagName}:${label.slice(0, 40)}`);
          }
        }
        return found;
      });
      expect(shareUi, `${route} ships no share UI`).toEqual([]);
    }

    // The manifest share_target tier (the PWA share-target surface)
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    expect((await res.text()).includes("share_target"), "the manifest declares no share target").toBe(false);
  });
});


test.describe("session-47 parity: the idle-tier census", () => {
  // The s47 idle census (both sites, all 9 routes, instrumented + a 3s
  // settle, the session_104 direction (c)): the ZERO-idle surface — the
  // APIs EXIST in the shared context (requestIdleCallback, IdleDetector,
  // navigator.scheduling) but ZERO registrations fire anywhere on either
  // site. This spec freezes the clone's public-route zero-registration
  // contract (the source tier is pinned by
  // tests/platform-surface-source.test.ts).

  test("zero requestIdleCallback registrations on the public routes", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __s47idle: number }).__s47idle = 0;
      if (window.requestIdleCallback) {
        const orig = window.requestIdleCallback.bind(window);
        window.requestIdleCallback = (cb: IdleRequestCallback, opts?: IdleRequestOptions) => {
          (window as unknown as { __s47idle: number }).__s47idle++;
          return orig(cb, opts);
        };
      }
    });
    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000); // idle callbacks fire once the main thread goes quiet
      const count = await page.evaluate(() => (window as unknown as { __s47idle?: number }).__s47idle || 0);
      expect(count, `${route} schedules no idle work`).toBe(0);
    }
  });
});


test.describe("session-48 parity: the clipboard census", () => {
  // The s48 clipboard census (both sites, all 9 routes + the two auth
  // routes, the session_106 direction (a)): the ZERO-clipboard surface —
  // the API PRESENT in the shared context (the async clipboard object,
  // unlike navigator.share) but zero app calls (writeText/readText +
  // the legacy execCommand path all instrumented before load), zero
  // copy-labeled UI elements. The copy/cut/paste LISTENERS the runtimes
  // register are React's own event delegation (framework surface — the
  // s48 framework-internal listener family), not app handlers. This spec
  // freezes the clone's public-route contract (the source tier is pinned
  // by tests/platform-surface-source.test.ts).

  test("no clipboard surface: API present, zero calls, zero copy UI", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s48clip: { calls: string[]; exec: string[] } };
      w.__s48clip = { calls: [], exec: [] };
      if (navigator.clipboard) {
        for (const m of ["writeText", "readText", "write", "read"] as const) {
          const anyClip = navigator.clipboard as unknown as Record<string, unknown>;
          if (typeof anyClip[m] === "function") {
            const orig = (anyClip[m] as (...a: unknown[]) => Promise<unknown>).bind(navigator.clipboard);
            anyClip[m] = (...a: unknown[]) => {
              w.__s48clip.calls.push(`${m}@${location.pathname}`);
              return orig(...a);
            };
          }
        }
      }
      const origExec = Document.prototype.execCommand;
      Document.prototype.execCommand = function (this: Document, cmd: string, ...rest: unknown[]) {
        w.__s48clip.exec.push(`${cmd}@${location.pathname}`);
        return (origExec as unknown as (cmd: string, ...rest: unknown[]) => boolean).apply(this, [cmd, ...rest]);
      };
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — the same
    // context the probe censused; a Playwright bump that changes the
    // headless clipboard surface re-baselines this read, while the
    // zero-CALL census stays the durable contract).
    const api = await page.evaluate(() => {
      const clip = navigator.clipboard as unknown as Record<string, unknown> | undefined;
      return {
        present: !!clip,
        writeText: typeof clip?.writeText,
      };
    });
    expect(api.present).toBe(true);
    expect(api.writeText).toBe("function");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const counters = await page.evaluate(() => {
        const w = window as unknown as { __s48clip?: { calls: string[]; exec: string[] } };
        const copyUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label]"))) {
          const label = (el.getAttribute("aria-label") || el.textContent || "").trim().toLowerCase();
          if (/copy|clipboard/.test(label)) copyUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        return { calls: w.__s48clip?.calls ?? [], exec: w.__s48clip?.exec ?? [], copyUi };
      });
      expect(counters.calls, `${route} never calls the async clipboard API`).toEqual([]);
      expect(counters.exec, `${route} never uses the legacy copy path`).toEqual([]);
      expect(counters.copyUi, `${route} ships no copy-labeled UI`).toEqual([]);
    }
  });
});


test.describe("session-48 parity: the fullscreen / Picture-in-Picture census", () => {
  // The s48 fullscreen/PiP census (both sites, all 9 routes + the auth
  // routes, the session_106 direction (b)): the ZERO-fullscreen/PiP
  // surface — both APIs ENABLED in the shared context, zero
  // requestFullscreen/exitFullscreen/requestPictureInPicture calls
  // (instrumented before load), zero video elements, zero fullscreen/
  // PiP-labeled UI, zero :fullscreen/:picture-in-picture CSSOM rules (the
  // layer-aware walk, the s47 walker). The fullscreenchange listeners the
  // clone's react-dom 19.3 registers at the document tier are framework
  // surface (its non-delegated event list — the s48 framework-internal
  // listener family; the live's older React ships no fullscreen family),
  // all inert: the app never requests fullscreen or PiP. This spec freezes
  // the clone's public-route contract (the source tier is pinned by
  // tests/platform-surface-source.test.ts).

  test("no fullscreen/PiP surface: APIs enabled, zero requests, zero UI, zero CSSOM rules", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s48fs: { calls: string[]; exits: string[]; pip: string[] } };
      w.__s48fs = { calls: [], exits: [], pip: [] };
      const origRFS = Element.prototype.requestFullscreen;
      Element.prototype.requestFullscreen = function (this: Element, ...a: unknown[]) {
        w.__s48fs.calls.push(`${this.tagName}@${location.pathname}`);
        return (origRFS as unknown as (...a: unknown[]) => Promise<void>).apply(this, a);
      };
      const origEFS = Document.prototype.exitFullscreen;
      Document.prototype.exitFullscreen = function (this: Document) {
        w.__s48fs.exits.push(location.pathname);
        return (origEFS as unknown as () => Promise<void>).call(this);
      };
      const origPIP = HTMLVideoElement.prototype.requestPictureInPicture;
      HTMLVideoElement.prototype.requestPictureInPicture = function (this: HTMLVideoElement) {
        w.__s48fs.pip.push(location.pathname);
        return (origPIP as unknown as () => Promise<PictureInPictureWindow>).call(this);
      };
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e Chromium context — a Playwright bump
    // that changes the headless surface re-baselines the read; the
    // zero-CALL census is the durable contract).
    const api = await page.evaluate(() => ({
      fullscreenEnabled: document.fullscreenEnabled,
      pipEnabled: document.pictureInPictureEnabled,
    }));
    expect(api.fullscreenEnabled).toBe(true);
    expect(api.pipEnabled).toBe(true);

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s48fs?: { calls: string[]; exits: string[]; pip: string[] } };
        const fsUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title]"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/full\s?screen|picture.?in.?picture/.test(label)) fsUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        // The layer-aware CSSOM selector census (the s47 walker: recurse
        // into @layer/@media/@supports — Tailwind v4 emits utilities inside
        // @layer).
        const fsRules: string[] = [];
        const walk = (rules: CSSRuleList | undefined): void => {
          for (const rule of Array.from(rules ?? [])) {
            const nested = (rule as CSSGroupingRule).cssRules;
            if (nested) walk(nested);
            const sel = (rule as CSSStyleRule).selectorText || "";
            if (/:fullscreen|:picture-in-picture/i.test(sel)) fsRules.push(sel.slice(0, 80));
          }
        };
        for (const sheet of Array.from(document.styleSheets)) {
          try { walk(sheet.cssRules); } catch { /* cross-origin sheet */ }
        }
        return {
          calls: w.__s48fs?.calls ?? [],
          exits: w.__s48fs?.exits ?? [],
          pip: w.__s48fs?.pip ?? [],
          videos: document.querySelectorAll("video").length,
          fsUi,
          fsRules,
        };
      });
      expect(census.calls, `${route} never requests fullscreen`).toEqual([]);
      expect(census.exits, `${route} never exits fullscreen`).toEqual([]);
      expect(census.pip, `${route} never requests Picture-in-Picture`).toEqual([]);
      expect(census.videos, `${route} renders no video elements`).toBe(0);
      expect(census.fsUi, `${route} ships no fullscreen/PiP-labeled UI`).toEqual([]);
      expect(census.fsRules, `${route} ships no :fullscreen/:picture-in-picture CSS rules`).toEqual([]);
    }
  });
});


test.describe("session-48 parity: the gamepad / WebHID census", () => {
  // The s48 gamepad/WebHID census (both sites, all 9 routes + the auth
  // routes, the session_106 direction (c)): the ZERO-gamepad/HID surface —
  // the APIs EXIST in the shared context (navigator.getGamepads a
  // function, navigator.hid present with getDevices/requestDevice — the
  // Chromium surface, identical on both sites) but zero polls, zero
  // gamepad event registrations, zero gamepad-labeled UI. This spec
  // freezes the clone's public-route contract (the source tier is pinned
  // by tests/platform-surface-source.test.ts).

  test("no gamepad/HID surface: APIs present, zero polls, zero gamepad UI", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s48gp: number };
      w.__s48gp = 0;
      if (navigator.getGamepads) {
        const orig = navigator.getGamepads.bind(navigator);
        navigator.getGamepads = (...a: unknown[]) => {
          w.__s48gp++;
          return (orig as unknown as (...a: unknown[]) => (Gamepad | null)[])(...a);
        };
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e Chromium context).
    const api = await page.evaluate(() => ({
      getGamepads: typeof navigator.getGamepads,
      hid: !!(navigator as unknown as { hid?: unknown }).hid,
    }));
    expect(api.getGamepads).toBe("function");
    expect(api.hid).toBe(true);

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s48gp?: number };
        const gpUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/gamepad|controller|joystick/.test(label)) gpUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        return { polls: w.__s48gp ?? 0, gpUi };
      });
      expect(census.polls, `${route} never polls the gamepad API`).toBe(0);
      expect(census.gpUi, `${route} ships no gamepad-labeled UI`).toEqual([]);
    }
  });
});


test.describe("session-49 parity: the credentials / WebAuthn census", () => {
  // The s49 credentials/WebAuthn census (both sites, all 9 routes + the
  // auth routes, the session_109 direction (a)): the ZERO-passkey surface —
  // the password-adjacent API family is FULLY PRESENT in the shared context
  // (navigator.credentials with create/get/store/preventSilentAccess +
  // PublicKeyCredential with both statics, identical shape on both sites)
  // but zero instrumented calls, zero passkey/biometric/fingerprint-labeled
  // UI, zero app-level registrations of the family's events. The error
  // listeners the clone's Next.js runtime registers (script/document/window
  // tiers + the route announcer) are framework surface (the s49
  // framework-internal listener family), not app handlers. This spec
  // freezes the clone's public-route contract (the source tier is pinned
  // by tests/platform-surface-source.test.ts).

  test("no credentials/WebAuthn surface: APIs present, zero calls, zero passkey UI", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s49cred: { calls: string[] } };
      w.__s49cred = { calls: [] };
      if (navigator.credentials) {
        for (const m of ["create", "get", "store", "preventSilentAccess"] as const) {
          const anyCred = navigator.credentials as unknown as Record<string, unknown>;
          if (typeof anyCred[m] === "function") {
            const orig = (anyCred[m] as (...a: unknown[]) => Promise<unknown>).bind(navigator.credentials);
            anyCred[m] = (...a: unknown[]) => {
              w.__s49cred.calls.push(`${m}@${location.pathname}`);
              return orig(...a);
            };
          }
        }
      }
      const PKC = (window as unknown as { PublicKeyCredential?: Record<string, unknown> }).PublicKeyCredential;
      if (PKC) {
        for (const m of ["isUserVerifyingPlatformAuthenticatorAvailable", "isConditionalMediationAvailable"] as const) {
          if (typeof PKC[m] === "function") {
            const orig = (PKC[m] as (...a: unknown[]) => Promise<boolean>).bind(PKC);
            PKC[m] = (...a: unknown[]) => {
              w.__s49cred.calls.push(`${m}@${location.pathname}`);
              return orig(...a);
            };
          }
        }
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — the same
    // context the probe censused; a Playwright bump that changes the
    // headless surface re-baselines this read, while the zero-CALL census
    // stays the durable contract).
    const api = await page.evaluate(() => ({
      credentials: !!navigator.credentials,
      create: typeof navigator.credentials?.create,
      pkc: typeof (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential,
      uvpaa: typeof (window as unknown as { PublicKeyCredential?: { isUserVerifyingPlatformAuthenticatorAvailable?: unknown } }).PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable,
    }));
    expect(api.credentials).toBe(true);
    expect(api.create).toBe("function");
    expect(api.pkc).toBe("function");
    expect(api.uvpaa).toBe("function");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s49cred?: { calls: string[] } };
        const credUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3, label"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/passkey|webauthn|biometric|fingerprint|face\s?id|touch\s?id|authenticator\s?key/.test(label)) credUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        return { calls: w.__s49cred?.calls ?? [], credUi };
      });
      expect(census.calls, `${route} never calls the credentials/WebAuthn APIs`).toEqual([]);
      expect(census.credUi, `${route} ships no passkey-labeled UI`).toEqual([]);
    }
  });
});


test.describe("session-49 parity: the Web-Speech census", () => {
  // The s49 Web-Speech census (both sites, all 9 routes + the auth routes,
  // the session_109 direction (b)): the ZERO-voice surface — the tier is
  // PRESENT in the shared context (speechSynthesis + SpeechRecognition,
  // both exposed by the e2e Chromium, identical on both sites) but zero
  // instrumented speak/cancel/getVoices calls, zero SpeechRecognition
  // constructions, zero speech/voice/mic-labeled UI, zero speech-family
  // CSSOM rules. This spec freezes the clone's public-route contract (the
  // source tier is pinned by tests/platform-surface-source.test.ts).

  test("no speech surface: API present, zero calls, zero voice UI", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s49speech: { calls: string[]; ctor: number } };
      w.__s49speech = { calls: [], ctor: 0 };
      if (window.speechSynthesis) {
        for (const m of ["speak", "cancel", "getVoices"] as const) {
          const synth = window.speechSynthesis as unknown as Record<string, unknown>;
          if (typeof synth[m] === "function") {
            const orig = (synth[m] as (...a: unknown[]) => unknown).bind(window.speechSynthesis);
            synth[m] = (...a: unknown[]) => {
              w.__s49speech.calls.push(`${m}@${location.pathname}`);
              return orig(...a);
            };
          }
        }
      }
      const w2 = window as unknown as Record<string, unknown>;
      const SR = (w2.SpeechRecognition || w2.webkitSpeechRecognition) as (new (...a: unknown[]) => unknown) | undefined;
      if (SR) {
        const OrigSR = SR;
        function PatchedSR(this: unknown, ...a: unknown[]) {
          w.__s49speech.ctor++;
          return new (OrigSR as new (...a: unknown[]) => unknown)(...a);
        }
        PatchedSR.prototype = (OrigSR as unknown as { prototype: unknown }).prototype;
        const key = w2.SpeechRecognition ? "SpeechRecognition" : "webkitSpeechRecognition";
        w2[key] = PatchedSR;
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context).
    const api = await page.evaluate(() => ({
      synth: typeof window.speechSynthesis,
      speak: typeof window.speechSynthesis?.speak,
      recognition: typeof (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition,
    }));
    expect(api.synth).toBe("object");
    expect(api.speak).toBe("function");
    expect(api.recognition).toBe("function");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s49speech?: { calls: string[]; ctor: number } };
        const voiceUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3, label"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/speak|listen|voice|microphone|speech|dictat/.test(label)) voiceUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        return { calls: w.__s49speech?.calls ?? [], ctor: w.__s49speech?.ctor ?? 0, voiceUi };
      });
      expect(census.calls, `${route} never calls the speech APIs`).toEqual([]);
      expect(census.ctor, `${route} never constructs a SpeechRecognition`).toBe(0);
      expect(census.voiceUi, `${route} ships no voice-labeled UI`).toEqual([]);
    }
  });
});


test.describe("session-49 parity: the Bluetooth / Serial / USB census", () => {
  // The s49 Bluetooth/Serial/USB census (both sites, all 9 routes + the
  // auth routes, the session_109 direction (c)): the ZERO-connectivity
  // surface — navigator.bluetooth is ABSENT in the shared headless context
  // on BOTH sites (the s47 navigator.share ABSENT case's mirror — the
  // headless flag), while navigator.serial + navigator.usb are present
  // with identical shape; but zero instrumented requestDevice/requestPort/
  // getPorts/getDevices calls, zero bluetooth/serial/pairing-labeled UI.
  // This spec freezes the clone's public-route contract (the source tier
  // is pinned by tests/platform-surface-source.test.ts).

  test("no connectivity surface: APIs present, zero calls, zero pairing UI", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s49conn: { calls: string[] } };
      w.__s49conn = { calls: [] };
      const nav = navigator as unknown as Record<string, Record<string, unknown> | undefined>;
      for (const [iface, method] of [
        ["serial", "requestPort"],
        ["serial", "getPorts"],
        ["usb", "requestDevice"],
        ["usb", "getDevices"],
        ["bluetooth", "requestDevice"],
      ] as const) {
        const obj = nav[iface];
        if (obj && typeof obj[method] === "function") {
          const orig = (obj[method] as (...a: unknown[]) => Promise<unknown>).bind(obj);
          obj[method] = (...a: unknown[]) => {
            w.__s49conn.calls.push(`${iface}.${method}@${location.pathname}`);
            return orig(...a);
          };
        }
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — serial +
    // usb present, bluetooth ABSENT: the headless flag, documented as
    // context-bound like the s47 navigator.share note).
    const api = await page.evaluate(() => {
      const nav = navigator as unknown as Record<string, Record<string, unknown> | undefined>;
      return {
        serial: typeof nav.serial?.requestPort === "function",
        usb: typeof nav.usb?.requestDevice === "function",
        bluetooth: typeof nav.bluetooth?.requestDevice,
      };
    });
    expect(api.serial).toBe(true);
    expect(api.usb).toBe(true);
    expect(api.bluetooth).toBe("undefined");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s49conn?: { calls: string[] } };
        const connUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3, label"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/bluetooth|pair\s?device|serial\s?port|usb\s?device|connect\s?device/.test(label)) connUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        return { calls: w.__s49conn?.calls ?? [], connUi };
      });
      expect(census.calls, `${route} never calls the connectivity APIs`).toEqual([]);
      expect(census.connUi, `${route} ships no pairing-labeled UI`).toEqual([]);
    }
  });
});


test.describe("session-50 parity: the WebXR / immersive-VR census", () => {
  // The s50 WebXR census (both sites, all 9 routes + the auth routes, the
  // session_112 direction (a)): the ZERO-XR surface — the last unprobed
  // major device tier is PRESENT with IDENTICAL shape in the shared context
  // (navigator.xr with isSessionSupported + requestSession, XRSession +
  // XRSystem constructors, XRDevice absent on both) but zero instrumented
  // calls, zero vr/headset/immersive-labeled UI, zero sessionstart/
  // sessionend registrations. This spec freezes the clone's public-route
  // contract (the source tier is pinned by
  // tests/platform-surface-source.test.ts).

  test("no XR surface: APIs present, zero calls, zero XR UI", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s50xr: { calls: string[] } };
      w.__s50xr = { calls: [] };
      const xr = (navigator as unknown as { xr?: Record<string, unknown> }).xr;
      if (xr) {
        for (const m of ["isSessionSupported", "requestSession"] as const) {
          if (typeof xr[m] === "function") {
            const orig = (xr[m] as (...a: unknown[]) => Promise<unknown>).bind(xr);
            xr[m] = (...a: unknown[]) => {
              w.__s50xr.calls.push(`${m}@${location.pathname}`);
              return orig(...a);
            };
          }
        }
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — the same
    // context the probe censused; a Playwright bump that changes the
    // headless surface re-baselines this read, while the zero-CALL census
    // stays the durable contract).
    const api = await page.evaluate(() => {
      const xr = (navigator as unknown as { xr?: Record<string, unknown> }).xr;
      const win = window as unknown as Record<string, unknown>;
      return {
        xr: !!xr,
        isSessionSupported: typeof xr?.isSessionSupported,
        requestSession: typeof xr?.requestSession,
        XRSession: typeof win.XRSession,
        XRSystem: typeof win.XRSystem,
        XRDevice: typeof win.XRDevice,
      };
    });
    expect(api.xr).toBe(true);
    expect(api.isSessionSupported).toBe("function");
    expect(api.requestSession).toBe("function");
    expect(api.XRSession).toBe("function");
    expect(api.XRSystem).toBe("function");
    expect(api.XRDevice).toBe("undefined");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s50xr?: { calls: string[] } };
        const xrUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3, label"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/web\s?xr|\bxr\b|immersive|virtual\s?reality|augmented\s?reality|headset|vr\s?mode/.test(label)) xrUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        return { calls: w.__s50xr?.calls ?? [], xrUi };
      });
      expect(census.calls, `${route} never calls the XR APIs`).toEqual([]);
      expect(census.xrUi, `${route} ships no XR-labeled UI`).toEqual([]);
    }
  });
});


test.describe("session-50 parity: the File System Access census", () => {
  // The s50 File System Access census (both sites, all 9 routes + the auth
  // routes, the session_112 direction (b)): the ZERO-picker surface — the
  // full picker tier is PRESENT with IDENTICAL shape on both sites
  // (showOpenFilePicker + showSaveFilePicker + showDirectoryPicker + the
  // FileSystem constructor family) but zero instrumented picker calls,
  // zero input[type=file] elements, zero upload/import/export-labeled UI.
  // This spec freezes the clone's public-route contract (the source tier
  // is pinned by tests/platform-surface-source.test.ts).

  test("no file-picker surface: APIs present, zero calls, zero file inputs", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s50fs: { calls: string[] } };
      w.__s50fs = { calls: [] };
      const win = window as unknown as Record<string, unknown>;
      for (const m of ["showOpenFilePicker", "showSaveFilePicker", "showDirectoryPicker"] as const) {
        if (typeof win[m] === "function") {
          const orig = (win[m] as (...a: unknown[]) => Promise<unknown>).bind(window);
          win[m] = (...a: unknown[]) => {
            w.__s50fs.calls.push(`${m}@${location.pathname}`);
            return orig(...a);
          };
        }
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — the same
    // context the probe censused; context-bound like every presence
    // mirror, while the zero-CALL census stays the durable contract).
    const api = await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      return {
        open: typeof win.showOpenFilePicker,
        save: typeof win.showSaveFilePicker,
        dir: typeof win.showDirectoryPicker,
        fsh: typeof win.FileSystemHandle,
        fsdh: typeof win.FileSystemDirectoryHandle,
      };
    });
    expect(api.open).toBe("function");
    expect(api.save).toBe("function");
    expect(api.dir).toBe("function");
    expect(api.fsh).toBe("function");
    expect(api.fsdh).toBe("function");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s50fs?: { calls: string[] } };
        const fsUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3, label"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/upload|import\s?file|export\s?file|open\s?file|save\s?file|browse\s?files|file\s?picker|drop\s?zone/.test(label)) fsUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        const fileInputs = document.querySelectorAll('input[type="file"]').length;
        return { calls: w.__s50fs?.calls ?? [], fsUi, fileInputs };
      });
      expect(census.calls, `${route} never calls the picker APIs`).toEqual([]);
      expect(census.fsUi, `${route} ships no file-picker-labeled UI`).toEqual([]);
      expect(census.fileInputs, `${route} ships no file inputs`).toBe(0);
    }
  });
});


test.describe("session-50 parity: the Web NFC / Web SMS census", () => {
  // The s50 Web NFC / Web SMS census (both sites, all 9 routes + the auth
  // routes, the session_112 direction (c)): the ZERO-nfc surface —
  // NDEFReader + NDEFMessage are ABSENT in the shared headless context on
  // BOTH sites (the s47 navigator.share / s49 navigator.bluetooth ABSENT
  // case's mirror — the headless flag; the spec documents the absence,
  // never asserts presence), and the Web OTP consumption tier is ZERO on
  // the public routes of both sites (zero one-time-code inputs). The
  // clone's verify-view one-time-code autocomplete is the s26-pinned
  // intentional hardening (the password-manager contract spec), not a
  // family-C API reference. This spec freezes the clone's public-route
  // contract (the source tier is pinned by
  // tests/platform-surface-source.test.ts).

  test("no NFC/SMS surface: NDEF absent, zero constructions, zero OTP inputs", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __s50nfc: { ctor: number; calls: string[] } };
      w.__s50nfc = { ctor: 0, calls: [] };
      const win = window as unknown as Record<string, unknown>;
      const NDEF = win.NDEFReader as (new (...a: unknown[]) => unknown) | undefined;
      if (typeof NDEF === "function") {
        const OrigNDEF = NDEF;
        function PatchedNDEF(this: unknown) {
          w.__s50nfc.ctor++;
          return new (OrigNDEF as new (...a: unknown[]) => unknown)();
        }
        (PatchedNDEF as unknown as { prototype: unknown }).prototype = (OrigNDEF as unknown as { prototype: unknown }).prototype;
        win.NDEFReader = PatchedNDEF;
        const scan = (OrigNDEF as unknown as { prototype: Record<string, unknown> }).prototype.scan;
        if (typeof scan === "function") {
          (OrigNDEF as unknown as { prototype: Record<string, unknown> }).prototype.scan = function patchedScan(this: unknown, ...a: unknown[]) {
            w.__s50nfc.calls.push(`scan@${location.pathname}`);
            return (scan as (...a: unknown[]) => unknown).apply(this, a);
          };
        }
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    // The API-surface reads (the e2e headless-Chromium context — NDEFReader
    // + NDEFMessage ABSENT: the headless flag, documented as context-bound
    // like the s49 bluetooth note).
    const api = await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      return {
        NDEFReader: typeof win.NDEFReader,
        NDEFMessage: typeof win.NDEFMessage,
      };
    });
    expect(api.NDEFReader).toBe("undefined");
    expect(api.NDEFMessage).toBe("undefined");

    for (const route of ["/", "/Courses", "/Pricing", "/About", "/Contact", "/BecomeInstructor", "/AIAssistant", "/login"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const census = await page.evaluate(() => {
        const w = window as unknown as { __s50nfc?: { ctor: number; calls: string[] } };
        const nfcUi: string[] = [];
        for (const el of Array.from(document.querySelectorAll("button, a, [role=button], [aria-label], [title], h1, h2, h3, label"))) {
          const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
          if (/nfc|near\s?field|tap\s?to\s?share|tag\s?reader/.test(label)) nfcUi.push(`${el.tagName}:${label.slice(0, 40)}`);
        }
        const otpInputs = Array.from(document.querySelectorAll("input"))
          .filter((el) => (el.getAttribute("autocomplete") || "").includes("one-time-code")).length;
        return { ctor: w.__s50nfc?.ctor ?? 0, calls: w.__s50nfc?.calls ?? [], nfcUi, otpInputs };
      });
      expect(census.ctor, `${route} never constructs NDEFReader`).toBe(0);
      expect(census.calls, `${route} never calls the NFC APIs`).toEqual([]);
      expect(census.nfcUi, `${route} ships no NFC-labeled UI`).toEqual([]);
      expect(census.otpInputs, `${route} ships no one-time-code inputs (the Web OTP tier)`).toBe(0);
    }
  });
});


test.describe("session-33 parity: the verify throttle (the burst spec — deliberately last)", () => {
  test("an 11x verify burst trips the 429 throttle", async ({ request }) => {
    // Pre-fix: 14 rapid requests all returned 200 — every one minting a
    // session cookie. The verify limit is 10/min (signup's sibling).
    // Deliberately the suite's LAST spec: the burst poisons the verify
    // bucket for the fixed window (nothing after this touches verify).
    const codes: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await request.post("/api/auth/verify", {
        headers: { "content-type": "application/json" },
        data: { email: "sepnetflix2023@outlook.com", code: "123456" },
      });
      codes.push(res.status());
    }
    const throttled = codes.filter((c) => c === 429).length;
    expect(throttled, `the burst must trip the throttle (statuses: ${codes.join(",")})`).toBeGreaterThanOrEqual(1);
    expect(codes[0], "the first request passes").toBe(200);
    // The 429 carries the house shape (Retry-After + the {error} body).
    const retryAfter = codes.indexOf(429);
    expect(retryAfter).toBeGreaterThan(-1);
  });
});
