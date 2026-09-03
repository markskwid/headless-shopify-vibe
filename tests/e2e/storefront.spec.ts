import { expect, test, type Page } from "@playwright/test";

import { e2eEnvironment } from "./environment";

async function expectHealthyStorefront(page: Page) {
  await expect(page.locator("main").first()).toBeVisible();
  await expect(page.getByText("Shopify could not be reached")).toHaveCount(0);
  await expect(page.getByText("Application error")).toHaveCount(0);
}

test("homepage exposes the storefront landmarks and primary navigation", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expectHealthyStorefront(page);
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Footer" })).toBeVisible();
  await expect(page.getByRole("heading").first()).toBeVisible();
});

test("search submits a configured term and opens a matching product", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).click();

  const searchInput = page.getByRole("searchbox", { name: "Search products" });
  await searchInput.fill(e2eEnvironment.searchTerm);
  await page
    .getByRole("link", {
      name: new RegExp(`View all results for`),
    })
    .click();

  await expect(page).toHaveURL(/\/search\?q=/);
  await expect(
    page.getByRole("heading", { name: /Results for/ }),
  ).toBeVisible();

  const configuredProduct = page.locator(
    `main a[href^="/products/${e2eEnvironment.productHandle}"]`,
  );
  await expect(configuredProduct.first()).toBeVisible();
  await configuredProduct.first().click();
  await expect(page).toHaveURL(
    new RegExp(`/products/${e2eEnvironment.productHandle}`),
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("blank and too-short searches are handled without requesting results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).click();

  const searchInput = page.getByRole("searchbox", { name: "Search products" });
  await searchInput.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Enter at least 2 characters to search.")).toBeVisible();

  await page.goto("/search?q=x");
  await expect(
    page.getByRole("heading", { name: "Search term is too short" }),
  ).toBeVisible();
});

test("a configured editorial page renders and an unknown route shows 404", async ({
  page,
}) => {
  await page.goto(`/${e2eEnvironment.editorialSlug}`);
  await expectHealthyStorefront(page);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: e2eEnvironment.editorialHeading,
    }),
  ).toBeVisible();

  await page.goto("/__playwright_unknown_storefront_route__");
  await expect(
    page.getByRole("heading", { name: "We couldn't find that page." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});
