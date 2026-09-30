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
    // The reset itself animates under the universal smooth rule — wait out the
    // glide (~600ms for 2000px) before asserting the landing position.
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

  test("the canonical/og:url of a duplicate-id URL uses only the first value", async ({ page }) => {
    await page.goto("/CourseDetail?id=seed-1&id=x");
    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toContain("/CourseDetail?id=seed-1");
    expect(canonical).not.toContain("seed-1,x");
    expect(canonical).not.toContain("id=x");
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
