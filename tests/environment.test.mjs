import assert from "node:assert/strict";
import test from "node:test";

import {
  getShopifyConfig,
  getShopifyWebhookSecret,
  requireShopifyConfig,
  ShopifyConfigurationError,
} from "../src/lib/shopify/env.ts";
import {
  getSanityConfig,
  getSanityWebhookSecret,
  requireSanityConfig,
  SanityConfigurationError,
} from "../src/lib/sanity/env.ts";

function clearProviderEnvironment() {
  for (const key of [
    "SHOPIFY_STORE_DOMAIN",
    "SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN",
    "SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN",
    "SHOPIFY_STOREFRONT_API_VERSION",
    "SHOPIFY_WEBHOOK_SECRET",
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "SANITY_API_VERSION",
    "SANITY_API_READ_TOKEN",
    "SANITY_REVALIDATE_SECRET",
  ]) {
    delete process.env[key];
  }
}

test("Shopify environment normalizes domains and prefers private tokens", () => {
  clearProviderEnvironment();
  process.env.SHOPIFY_STORE_DOMAIN = " HTTPS://Test-Shop.MyShopify.com/ ";
  process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN = " private-token ";
  process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN = "public-token";

  assert.deepEqual(requireShopifyConfig(), {
    storeDomain: "test-shop.myshopify.com",
    apiVersion: "2026-07",
    access: { type: "private", token: "private-token" },
  });
});

test("Shopify environment supports public and tokenless access", () => {
  clearProviderEnvironment();
  process.env.SHOPIFY_STORE_DOMAIN = "test-shop.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN = "public-token";
  assert.deepEqual(requireShopifyConfig().access, {
    type: "public",
    token: "public-token",
  });

  delete process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN;
  assert.deepEqual(requireShopifyConfig().access, { type: "tokenless" });
});

test("Shopify environment reports missing domains and invalid API versions", () => {
  clearProviderEnvironment();
  let result = getShopifyConfig();
  assert.equal(result.configured, false);
  assert.equal(result.issues.includes("SHOPIFY_STORE_DOMAIN is required."), true);
  assert.throws(requireShopifyConfig, ShopifyConfigurationError);

  process.env.SHOPIFY_STORE_DOMAIN = "not-a-shop.example.com";
  process.env.SHOPIFY_STOREFRONT_API_VERSION = "latest";
  result = getShopifyConfig();
  assert.equal(result.configured, false);
  assert.equal(result.issues.length >= 1, true);
});

test("provider webhook secrets are optional but reject short values", () => {
  clearProviderEnvironment();
  assert.equal(getShopifyWebhookSecret(), undefined);
  assert.equal(getSanityWebhookSecret(), undefined);

  process.env.SHOPIFY_WEBHOOK_SECRET = "too-short";
  process.env.SANITY_REVALIDATE_SECRET = "too-short";
  assert.throws(getShopifyWebhookSecret, (error) => error?.name === "ZodError");
  assert.throws(getSanityWebhookSecret, (error) => error?.name === "ZodError");
});

test("Sanity environment distinguishes missing, valid, and invalid configuration", () => {
  clearProviderEnvironment();
  assert.deepEqual(getSanityConfig(), {
    configured: false,
    issues: ["NEXT_PUBLIC_SANITY_PROJECT_ID is not configured."],
  });
  assert.throws(requireSanityConfig, SanityConfigurationError);

  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "abc123";
  process.env.NEXT_PUBLIC_SANITY_DATASET = "preview_data";
  process.env.SANITY_API_VERSION = "2026-09-03";
  process.env.SANITY_API_READ_TOKEN = " private-read-token ";
  assert.deepEqual(requireSanityConfig(), {
    projectId: "abc123",
    dataset: "preview_data",
    apiVersion: "2026-09-03",
    token: "private-read-token",
  });

  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "INVALID-ID";
  assert.equal(getSanityConfig().configured, false);
});
