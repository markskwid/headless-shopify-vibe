import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { z } from "zod";

import {
  ShopifyRequestError,
  shopifyFetch,
} from "../src/lib/shopify/client.ts";
import {
  jsonResponse,
  setShopifyTestEnvironment,
  shopifyData,
} from "./helpers/shopify-fixtures.mjs";

const responseSchema = z.object({ shop: z.object({ name: z.string() }) });

test("shopifyFetch validates data and sends private-token cached requests", async () => {
  setShopifyTestEnvironment({
    SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN: "private-test-token",
  });
  let captured;
  mock.method(globalThis, "fetch", async (url, request) => {
    captured = { url, request };
    return shopifyData({ shop: { name: "Test shop" } });
  });

  const result = await shopifyFetch({
    query: "query TestShop { shop { name } }",
    schema: responseSchema,
    variables: { locale: "EN" },
    revalidate: 90,
    tags: ["shop-identity"],
  });

  assert.deepEqual(result, { shop: { name: "Test shop" } });
  assert.equal(
    captured.url,
    "https://unit-test.myshopify.com/api/2026-07/graphql.json",
  );
  assert.equal(captured.request.cache, "force-cache");
  assert.deepEqual(captured.request.next, {
    revalidate: 90,
    tags: ["shopify", "shop-identity"],
  });
  assert.equal(
    captured.request.headers.get("Shopify-Storefront-Private-Token"),
    "private-test-token",
  );
  assert.deepEqual(JSON.parse(captured.request.body), {
    query: "query TestShop { shop { name } }",
    variables: { locale: "EN" },
  });
});

test("shopifyFetch sends uncached public-token buyer requests", async () => {
  setShopifyTestEnvironment({
    SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN: "public-test-token",
  });
  let capturedRequest;
  mock.method(globalThis, "fetch", async (_url, request) => {
    capturedRequest = request;
    return shopifyData({ shop: { name: "Test shop" } });
  });

  await shopifyFetch({
    query: "query TestShop { shop { name } }",
    schema: responseSchema,
    revalidate: false,
    buyerIp: "203.0.113.7",
  });

  assert.equal(capturedRequest.cache, "no-store");
  assert.equal(capturedRequest.next, undefined);
  assert.equal(
    capturedRequest.headers.get("X-Shopify-Storefront-Access-Token"),
    "public-test-token",
  );
  assert.equal(
    capturedRequest.headers.get("Shopify-Storefront-Buyer-IP"),
    "203.0.113.7",
  );
});

test("shopifyFetch surfaces HTTP failures with their status", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    jsonResponse(
      { errors: [{ message: "Unauthorized" }] },
      { status: 401, statusText: "Unauthorized" },
    ),
  );

  await assert.rejects(
    shopifyFetch({ query: "query Test { shop { name } }", schema: responseSchema }),
    (error) =>
      error instanceof ShopifyRequestError &&
      error.status === 401 &&
      error.message.includes("401 Unauthorized"),
  );
});

test("shopifyFetch surfaces GraphQL errors", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    jsonResponse({
      data: null,
      errors: [{ message: "First error" }, { message: "Second error" }],
    }),
  );

  await assert.rejects(
    shopifyFetch({ query: "query Test { shop { name } }", schema: responseSchema }),
    (error) =>
      error instanceof ShopifyRequestError &&
      error.message === "First error Second error",
  );
});

test("shopifyFetch rejects missing data", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () => jsonResponse({}));
  await assert.rejects(
    shopifyFetch({ query: "query Test { shop { name } }", schema: responseSchema }),
    (error) =>
      error instanceof ShopifyRequestError &&
      error.message === "Shopify returned no data for this request.",
  );
});

const malformedGraphQlEnvelopes = [
  ["an array", []],
  ["a non-array errors value", { errors: "invalid" }],
  ["a primitive", "invalid"],
];

for (const [description, payload] of malformedGraphQlEnvelopes) {
  test(`shopifyFetch rejects ${description} as a malformed GraphQL envelope`, async () => {
    setShopifyTestEnvironment();
    mock.method(globalThis, "fetch", async () => jsonResponse(payload));

    await assert.rejects(
      shopifyFetch({
        query: "query Test { shop { name } }",
        schema: responseSchema,
      }),
      (error) =>
        error instanceof ShopifyRequestError &&
        error.message === "Shopify returned an unexpected response shape.",
    );
  });
}

test("shopifyFetch rejects schema-invalid data", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    shopifyData({ shop: { name: 123 } }),
  );
  await assert.rejects(
    shopifyFetch({ query: "query Test { shop { name } }", schema: responseSchema }),
    (error) =>
      error instanceof ShopifyRequestError &&
      error.message.startsWith("Shopify data validation failed:"),
  );
});

test("shopifyFetch wraps an uncached network failure without retrying", async () => {
  setShopifyTestEnvironment();
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new TypeError("connection refused");
  });

  await assert.rejects(
    shopifyFetch({
      query: "mutation Test { cartCreate { cart { id } } }",
      schema: responseSchema,
      revalidate: false,
    }),
    (error) =>
      error instanceof ShopifyRequestError &&
      error.message.includes("could not be reached"),
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});
