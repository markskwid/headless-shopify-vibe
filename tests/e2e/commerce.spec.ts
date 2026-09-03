import { expect, test, type Page } from "@playwright/test";

import { e2eEnvironment } from "./environment";

function productPath(handle: string) {
  return `/products/${handle}`;
}

async function openAvailableProduct(page: Page) {
  await page.goto(productPath(e2eEnvironment.productHandle));
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();

  return {
    addButton: page.getByRole("button", { name: "Add to cart" }),
    productName: (await heading.innerText()).trim(),
  };
}

async function selectAnotherOption(page: Page) {
  const optionGroups = page.locator("main fieldset");

  for (let groupIndex = 0; groupIndex < (await optionGroups.count()); groupIndex += 1) {
    const buttons = optionGroups.nth(groupIndex).getByRole("button");

    for (let buttonIndex = 0; buttonIndex < (await buttons.count()); buttonIndex += 1) {
      const button = buttons.nth(buttonIndex);
      if ((await button.getAttribute("aria-pressed")) === "true") continue;
      if (await button.isDisabled()) continue;

      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      return true;
    }
  }

  return false;
}

test("collection browsing preserves safe behavior while sorting and filtering", async ({
  page,
}) => {
  const collectionPath = `/collections/${e2eEnvironment.collectionHandle}`;
  await page.goto(collectionPath);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const configuredProduct = page.locator(
    `main a[href^="${productPath(e2eEnvironment.productHandle)}"]`,
  );
  await expect(configuredProduct.first()).toBeVisible();

  const sort = page.getByLabel("Sort by");
  await expect(sort).toBeEnabled();
  await sort.selectOption("price-desc");
  await expect(page).toHaveURL(/sort=price-desc/, { timeout: 15_000 });
  await expect(sort).toHaveValue("price-desc");
  await expect(configuredProduct.first()).toBeVisible();

  await page.goto(`${collectionPath}?sort=price-desc&filter=not-json`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Showing \d+ products?/)).toBeVisible();

  await configuredProduct.first().click();
  await expect(page).toHaveURL(
    new RegExp(productPath(e2eEnvironment.productHandle)),
  );
});

test("product details expose price, variant state, and availability", async ({
  page,
}) => {
  const { addButton } = await openAvailableProduct(page);

  await expect(page.getByLabel("Product price")).toHaveText(/\S+/);
  await expect(addButton).toBeEnabled();

  const optionGroups = page.locator("main fieldset");
  if ((await optionGroups.count()) > 0) {
    const changed = await selectAnotherOption(page);
    test.info().annotations.push({
      type: "variant-coverage",
      description: changed
        ? "Selected another valid variant option."
        : "No alternative valid variant option exists on the configured product.",
    });
  }

  await page.goto(productPath(e2eEnvironment.unavailableProductHandle));
  const soldOutButton = page.getByRole("button", { name: "Sold out" });
  await expect(soldOutButton).toBeVisible();
  await expect(soldOutButton).toBeDisabled();
});

test("cart quantity, subtotal, and empty state update through a complete journey", async ({
  page,
}) => {
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Your cart",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Your cart is empty")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart, 0 items" })).toBeVisible();

  const { addButton, productName } = await openAvailableProduct(page);
  await addButton.click();

  const drawer = page.getByRole("dialog", { name: /Your cart/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(productName, { exact: true }).first()).toBeVisible();
  const subtotal = drawer.getByLabel("Cart subtotal");
  const initialSubtotal = await subtotal.innerText();

  await drawer
    .getByRole("button", { name: `Increase ${productName} quantity` })
    .click();
  await expect(
    drawer.getByRole("heading", { name: "Your cart (2)", exact: true }),
  ).toBeVisible();
  await expect.poll(() => subtotal.innerText()).not.toBe(initialSubtotal);

  await drawer
    .getByRole("button", { name: `Decrease ${productName} quantity` })
    .click();
  await expect(
    drawer.getByRole("heading", { name: "Your cart (1)", exact: true }),
  ).toBeVisible();

  await drawer
    .getByRole("button", { name: `Remove ${productName}` })
    .last()
    .click();
  await expect(drawer.getByText("Your cart is empty")).toBeVisible();
  await expect(
    drawer.getByRole("heading", { name: "Your cart", exact: true }),
  ).toBeVisible();
});

test("checkout action hands off to the approved Shopify URL without loading it", async ({
  page,
}) => {
  const { addButton } = await openAvailableProduct(page);
  await addButton.click();

  const checkout = page
    .getByRole("dialog", { name: /Your cart/ })
    .getByRole("link", { name: "Checkout" });
  const href = await checkout.getAttribute("href");
  expect(href, "Checkout must expose Shopify's checkoutUrl").toBeTruthy();

  const checkoutUrl = new URL(href as string, e2eEnvironment.baseUrl);
  expect(checkoutUrl.protocol).toBe("https:");
  expect(checkoutUrl.hostname).toBe(e2eEnvironment.checkoutHostname);
  expect(checkoutUrl.pathname).toMatch(/\/(?:checkouts|cart\/c)\//);

  await page.route(checkoutUrl.href, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Checkout handoff intercepted</title>",
    });
  });

  await checkout.click();
  await expect(page).toHaveURL(checkoutUrl.href);
  await expect(page).toHaveTitle("Checkout handoff intercepted");
});
