import { test, expect } from "@playwright/test";

test.describe("Landing Page (/)", () => {
  test("renders hero content, cards, and footer", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Home | PRPB");
    await expect(page.locator(".left-text")).toHaveText("PRPB");
    await expect(page.locator(".right-text")).toContainText("KNOWLEDGE");
    await expect(page.locator(".right-text")).toContainText("ARCHIVE");

    const blogsCard = page.getByRole("link", {
      name: "Go to BLOGS page",
      exact: true,
    });
    const aboutCard = page.getByRole("link", {
      name: "Go to ABOUT page",
      exact: true,
    });
    await expect(blogsCard).toBeVisible();
    await expect(aboutCard).toBeVisible();

    await expect(page.locator("footer")).toContainText(
      `© ${new Date().getFullYear()} PRPB`,
    );

    await blogsCard.click();
    await expect(page).toHaveURL(/\/blogs$/);

    await page.goto("/");
    await aboutCard.click();
    await expect(page).toHaveURL(/\/about$/);
  });
});

test.describe("About Page (/about)", () => {
  test("renders about heading and story sections", async ({ page }) => {
    await page.goto("/about");

    await expect(page).toHaveTitle("About | PRPB");
    await expect(page.locator("main")).toContainText("About");
    await expect(
      page.getByRole("heading", {
        name: "1. เป็นเสมือนกับ memo ไว้ให้ตัวเองในอนาคตอ่าน",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "2. เพื่อแบ่งปันความรู้ให้กับผู้ใช้ AWS คนอื่น ๆ",
      }),
    ).toBeVisible();
  });
});

test.describe("Header, Theme Toggle & Responsive Modes", () => {
  test("switches between PC header and Mobile header on resize and navigates", async ({
    page,
  }) => {
    // Desktop mode (>= 1024px)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const pcBlogsLink = page
      .locator("header")
      .getByRole("link", { name: "Go to Blogs page" });
    const pcAboutLink = page
      .locator("header")
      .getByRole("link", { name: "Go to About page" });
    await expect(pcBlogsLink).toBeVisible();
    await expect(pcAboutLink).toBeVisible();
    await expect(page.locator("header .menu-container")).toHaveCount(0);

    // Resize to mobile (< 1024px)
    await page.setViewportSize({ width: 390, height: 844 });
    const menuContainer = page.locator("header .menu-container");
    const menuOverlay = page.locator("header .menu-overlay");
    await expect(menuContainer).toBeVisible();

    // Open mobile menu
    await menuContainer.click();
    await expect(menuContainer).toHaveClass(/active/);
    await expect(menuOverlay).toHaveClass(/active/);
    await expect(page.locator("body")).toHaveClass(/lock/);

    // Close mobile menu by clicking overlay
    await menuOverlay.click({ position: { x: 10, y: 10 } });
    await expect(menuContainer).not.toHaveClass(/active/);
    await expect(page.locator("body")).not.toHaveClass(/lock/);

    // Open mobile menu again and navigate to About
    await menuContainer.click();
    await menuContainer.getByRole("link", { name: "Go to About page" }).click();
    await expect(page).toHaveURL(/\/about$/);

    // Resize back to desktop (>= 1024px)
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator("header .menu-container")).toHaveCount(0);
    await expect(
      page
        .locator("header")
        .getByRole("link", { name: "Go to Home page", exact: true }),
    ).toBeVisible();
  });

  test("toggles dark and light theme and persists to localStorage", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const html = page.locator("html");
    const themeToggle = page.locator("header .cursor-pointer.overflow-hidden");
    await expect(themeToggle).toBeVisible();

    const initialIsDark = await html.evaluate((el) =>
      el.classList.contains("dark"),
    );

    await themeToggle.click();
    if (initialIsDark) {
      await expect(html).not.toHaveClass(/dark/);
      const stored = await page.evaluate(() =>
        localStorage.getItem("PRPB_THEME"),
      );
      expect(stored).toBe("light");
    } else {
      await expect(html).toHaveClass(/dark/);
      const stored = await page.evaluate(() =>
        localStorage.getItem("PRPB_THEME"),
      );
      expect(stored).toBe("dark");
    }

    // Toggle back
    await themeToggle.click();
    if (initialIsDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });
});

test.describe("Blogs Page (/blogs)", () => {
  test("renders blog list sorted by publishDate and supports text search and Clear", async ({
    page,
  }) => {
    await page.goto("/blogs");
    await expect(page).toHaveTitle("Blogs | PRPB");

    const blogLinks = page.locator('a[aria-label^="Open blog "]');
    await expect(blogLinks).toHaveCount(4);

    // Verify newest blog is first
    await expect(blogLinks.first()).toHaveAttribute(
      "href",
      "/blog/s3-presigned-post-request",
    );

    // Search by title keyword
    const searchInput = page.getByPlaceholder("Search blogs...");
    await searchInput.fill("cdk");

    const clearTextBtn = page.getByRole("button", {
      name: "Clear text search",
    });
    await expect(clearTextBtn).toBeVisible();

    await page.getByRole("button", { name: "Apply" }).click();
    await expect(blogLinks).toHaveCount(1);
    await expect(blogLinks.first()).toHaveAttribute(
      "href",
      "/blog/what-happens-when-we-bootstrap-cdk",
    );

    // Clicking Clear immediately resets the filter and restores all blogs
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(searchInput).toHaveValue("");
    await expect(blogLinks).toHaveCount(4);
  });

  test("filters blogs by tags with OR and AND logic and supports tag search", async ({
    page,
  }) => {
    await page.goto("/blogs");

    const blogLinks = page.locator('a[aria-label^="Open blog "]');
    await expect(blogLinks).toHaveCount(4);

    // Open tag dropdown
    const tagDropdownTrigger = page.locator('div[aria-haspopup="listbox"]');
    await tagDropdownTrigger.click();
    await expect(tagDropdownTrigger).toHaveAttribute("aria-expanded", "true");

    // Search inside tag dropdown
    const tagSearchInput = page.getByPlaceholder("Search tags...");
    await tagSearchInput.fill("nonexistent");
    await expect(page.getByText("No tags found")).toBeVisible();

    await tagSearchInput.fill("");
    await expect(page.locator("label").filter({ hasText: "S3" })).toBeVisible();

    // Select S3 and CloudFront tags
    await page
      .locator("label")
      .filter({ hasText: /^S3$/ })
      .locator('input[type="checkbox"]')
      .check();
    await page
      .locator("label")
      .filter({ hasText: /^CloudFront$/ })
      .locator('input[type="checkbox"]')
      .check();

    // Close dropdown by clicking outside
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await expect(tagDropdownTrigger).toHaveAttribute("aria-expanded", "false");

    // Apply with default OR logic -> 2 S3 blogs
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(blogLinks).toHaveCount(2);

    // Enable AND logic -> 1 blog (has both S3 and CloudFront)
    await page
      .getByLabel("Match all selected tags (AND)")
      .check();
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(blogLinks).toHaveCount(1);
    await expect(blogLinks.first()).toHaveAttribute(
      "href",
      "/blog/s3-presigned-url-vs-cloudfront-signed-url",
    );

    // Remove CloudFront tag pill and Apply -> 2 blogs have S3
    await page
      .getByRole("button", { name: "Remove CloudFront", exact: true })
      .click();
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(blogLinks).toHaveCount(2);

    // Clear resets everything immediately
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(blogLinks).toHaveCount(4);
  });

  test("initializes filters from URL query parameters (?tag= & ?search=)", async ({
    page,
  }) => {
    await page.goto("/blogs?tag=VPC");
    const blogLinks = page.locator('a[aria-label^="Open blog "]');
    await expect(blogLinks).toHaveCount(1);
    await expect(blogLinks.first()).toHaveAttribute(
      "href",
      "/blog/how-private-resources-resolve-dns",
    );

    await page.goto("/blogs?search=CloudFront");
    await expect(blogLinks).toHaveCount(1);
    await expect(blogLinks.first()).toHaveAttribute(
      "href",
      "/blog/s3-presigned-url-vs-cloudfront-signed-url",
    );
  });
});

test.describe("Blog Detail Page (/blog/<slug>)", () => {
  test("renders blog metadata, foldable code blocks, copy button, tag links, and TOC", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/s3-presigned-post-request");

    await expect(page).toHaveTitle(
      "S3 Presigned Post Request ขั้นกว่าของ S3 Presigned URL | PRPB",
    );
    await expect(page.locator("#content")).toContainText("2026-04-24");

    // Hero thumbnail
    const thumbnail = page.locator('#content img[alt$="thumbnail"]');
    await expect(thumbnail).toBeVisible();

    // Copy button in CodeBlock (hydrated via client:visible when scrolled into view)
    const firstCodeBlock = page.locator("#content astro-island").first();
    await firstCodeBlock.scrollIntoViewIfNeeded();
    await expect(firstCodeBlock).not.toHaveAttribute("ssr", "");
    const firstCopyBtn = firstCodeBlock.getByRole("button", { name: "Copy" });
    await firstCopyBtn.click();
    await expect(
      firstCodeBlock.getByRole("button", { name: "Copied" }),
    ).toBeVisible();

    // Foldable CodeBlock (<details>/<summary>)
    const foldableSummary = page.locator("details summary").first();
    const foldableDetails = page.locator("details").first();
    await foldableSummary.scrollIntoViewIfNeeded();
    await expect(foldableSummary).toContainText(
      "Status 204 Response From S3 (avatar/selfish.jpg)",
    );
    await expect(foldableDetails).not.toHaveAttribute("open", "");
    await foldableSummary.click();
    await expect(foldableDetails).toHaveAttribute("open", "");

    // Desktop TOC sidebar is visible and links to sections
    const tocNav = page.locator("nav");
    await expect(tocNav).toContainText("Table of content");
    const tocLink = tocNav.getByRole("link", {
      name: "Go to สร้าง S3 Presigned Post Request section",
    });
    await expect(tocLink).toBeVisible();
    await tocLink.click();
    await expect(page).toHaveURL(
      new RegExp(`${encodeURI("#สร้าง-s3-presigned-post-request")}$`),
    );

    // Mobile/Tablet TOC drawer toggle (< 1280px)
    await page.setViewportSize({ width: 390, height: 844 });
    const tocToggleBtn = page.locator("nav > div").first();
    await tocToggleBtn.click();
    await expect(page.locator("body")).toHaveClass(/lock/);

    // Clicking tag badge navigates to /blogs?tag=...
    await tocToggleBtn.click();
    await expect(page.locator("body")).not.toHaveClass(/lock/);
    await page
      .locator("#content")
      .getByRole("link", {
        name: "Open list of blogs with tag = S3 in a new tab",
      })
      .click();
    await expect(page).toHaveURL(/\/blogs\?tag=S3$/);
  });
});

