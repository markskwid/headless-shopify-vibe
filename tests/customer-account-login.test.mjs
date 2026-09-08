import assert from "node:assert/strict";
import test from "node:test";

import { getHostedCustomerAccountUrl } from "../src/lib/shopify/services/customer-account.ts";

test("the canonical login page redirects to Shopify's hosted account", async (t) => {
  const destinations = [];
  process.env.SHOPIFY_STORE_DOMAIN = "example-shop.myshopify.com";

  t.mock.module("next/navigation", {
    namedExports: {
      redirect(destination) {
        destinations.push(destination);
      },
    },
  });

  const { default: LoginPage } = await import(
    "../src/app/(storefront)/account/login/page.tsx"
  );

  LoginPage();

  assert.deepEqual(destinations, ["https://example-shop.myshopify.com/account"]);
});

test("builds the Shopify-hosted customer account entry URL from the validated store domain", () => {
  process.env.SHOPIFY_STORE_DOMAIN = "Example-Shop.myshopify.com";

  assert.equal(
    getHostedCustomerAccountUrl(),
    "https://example-shop.myshopify.com/account",
  );
});

test("rejects an unsafe customer account host instead of constructing a redirect", () => {
  process.env.SHOPIFY_STORE_DOMAIN = "example.com";

  assert.throws(
    () => getHostedCustomerAccountUrl(),
    /SHOPIFY_STORE_DOMAIN must look like your-store\.myshopify\.com/,
  );
});
