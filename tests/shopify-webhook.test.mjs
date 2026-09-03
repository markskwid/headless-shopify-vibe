import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  parseShopifyWebhook,
  ShopifyWebhookError,
} from "../src/lib/shopify/services/webhook.ts";
import { setShopifyTestEnvironment } from "./helpers/shopify-fixtures.mjs";

const WEBHOOK_SECRET = "test-webhook-secret-with-at-least-32-chars";

function webhookRequest({
  body = JSON.stringify({ handle: "canvas-shoe" }),
  domain = "unit-test.myshopify.com",
  signature,
  topic = "products/update",
  includeRequiredHeaders = true,
} = {}) {
  const calculatedSignature = createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("base64");
  const headers = { "content-type": "application/json" };

  if (includeRequiredHeaders) {
    Object.assign(headers, {
      "x-shopify-hmac-sha256": signature ?? calculatedSignature,
      "x-shopify-shop-domain": domain,
      "x-shopify-topic": topic,
      "x-shopify-webhook-id": "3d9f4eb0-6b3d-4b8b-8920-c99872f9f243",
    });
  }

  return new Request("https://storefront.example/api/webhooks/shopify", {
    method: "POST",
    headers,
    body,
  });
}

test("parseShopifyWebhook authenticates and validates a delivery", async () => {
  setShopifyTestEnvironment();

  assert.deepEqual(
    await parseShopifyWebhook(webhookRequest(), WEBHOOK_SECRET),
    {
      handle: "canvas-shoe",
      shopDomain: "unit-test.myshopify.com",
      topic: "products/update",
      webhookId: "3d9f4eb0-6b3d-4b8b-8920-c99872f9f243",
    },
  );
});

test("parseShopifyWebhook rejects missing or malformed headers", async () => {
  setShopifyTestEnvironment();

  await assert.rejects(
    parseShopifyWebhook(
      webhookRequest({ includeRequiredHeaders: false }),
      WEBHOOK_SECRET,
    ),
    (error) => error instanceof ShopifyWebhookError && error.status === 400,
  );
});

test("parseShopifyWebhook rejects tampered signatures and wrong stores", async () => {
  setShopifyTestEnvironment();

  for (const request of [
    webhookRequest({ signature: Buffer.alloc(32).toString("base64") }),
    webhookRequest({ domain: "another-shop.myshopify.com" }),
  ]) {
    await assert.rejects(
      parseShopifyWebhook(request, WEBHOOK_SECRET),
      (error) => error instanceof ShopifyWebhookError && error.status === 401,
    );
  }
});

test("parseShopifyWebhook rejects malformed JSON and invalid handles", async () => {
  setShopifyTestEnvironment();

  for (const body of ["{not-json", JSON.stringify({ handle: "Unsafe Handle" })]) {
    await assert.rejects(
      parseShopifyWebhook(webhookRequest({ body }), WEBHOOK_SECRET),
      (error) => error instanceof ShopifyWebhookError && error.status === 400,
    );
  }
});
