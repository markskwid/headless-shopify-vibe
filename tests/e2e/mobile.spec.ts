import { expect, test } from "@playwright/test";

test("mobile navigation reaches a product and exposes usable cart controls", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();

  const mobileNavigation = page.getByRole("navigation", {
    name: "Mobile primary",
  });
  await expect(mobileNavigation).toBeVisible();

  const collectionLink = mobileNavigation.locator('a[href="/collections/all"]');
  if (!(await collectionLink.isVisible())) {
    const expandableItems = mobileNavigation.locator("summary");
    for (
      let index = 0;
      index < (await expandableItems.count()) && !(await collectionLink.isVisible());
      index += 1
    ) {
      await expandableItems.nth(index).click();
    }
  }
  await expect(collectionLink).toBeVisible();
  await collectionLink.click();
  await expect(page).toHaveURL(/\/collections\/all/);

  const productLink = page
    .locator('main a[href^="/products/"]')
    .filter({ hasText: "Available" });
  await expect(productLink.first()).toBeVisible();
  await productLink.first().click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();

  const cart = page.getByRole("dialog", { name: /Your cart/ });
  await expect(cart).toBeVisible();
  await expect(cart.getByRole("link", { name: "Checkout" })).toBeVisible();
  await expect(cart.getByRole("link", { name: "View cart" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
