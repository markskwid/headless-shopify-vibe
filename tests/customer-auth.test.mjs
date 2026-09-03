import assert from "node:assert/strict";
import { mock, test } from "node:test";

import {
  loginCustomer,
  ShopifyCustomerError,
} from "../src/lib/shopify/services/customer.ts";
import {
  createCustomerTokenFixture,
  setShopifyTestEnvironment,
  shopifyData,
  TEST_CUSTOMER_TOKEN,
} from "./helpers/shopify-fixtures.mjs";

test("loginCustomer normalizes credentials and returns a validated token", async () => {
  setShopifyTestEnvironment();
  let captured;
  mock.method(globalThis, "fetch", async (_url, request) => {
    captured = request;
    return shopifyData({
      customerAccessTokenCreate: {
        customerAccessToken: createCustomerTokenFixture(),
        customerUserErrors: [],
      },
    });
  });

  const token = await loginCustomer(
    { email: "  CUSTOMER@EXAMPLE.COM ", password: "secret-password" },
    "203.0.113.11",
  );

  assert.equal(token.accessToken, TEST_CUSTOMER_TOKEN);
  assert.equal(captured.cache, "no-store");
  assert.equal(
    captured.headers.get("Shopify-Storefront-Buyer-IP"),
    "203.0.113.11",
  );
  assert.deepEqual(JSON.parse(captured.body).variables, {
    input: {
      email: "customer@example.com",
      password: "secret-password",
    },
  });
});

test("loginCustomer rejects invalid credentials before requesting Shopify", async () => {
  setShopifyTestEnvironment();

  for (const input of [
    { email: "invalid", password: "secret-password" },
    { email: "customer@example.com", password: "" },
    { email: "customer@example.com", password: "x".repeat(129) },
  ]) {
    await assert.rejects(
      loginCustomer(input),
      (error) => error?.name === "ZodError",
    );
  }
});

test("loginCustomer exposes Shopify customer errors", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    shopifyData({
      customerAccessTokenCreate: {
        customerAccessToken: null,
        customerUserErrors: [
          { code: "UNIDENTIFIED_CUSTOMER", field: ["input"], message: "Incorrect email or password." },
        ],
      },
    }),
  );

  await assert.rejects(
    loginCustomer({ email: "customer@example.com", password: "wrong-password" }),
    (error) =>
      error instanceof ShopifyCustomerError &&
      error.message === "Incorrect email or password.",
  );
});

test("loginCustomer uses a safe fallback when Shopify omits its payload", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    shopifyData({ customerAccessTokenCreate: null }),
  );

  await assert.rejects(
    loginCustomer({ email: "customer@example.com", password: "wrong-password" }),
    (error) =>
      error instanceof ShopifyCustomerError &&
      error.message === "The email or password is incorrect.",
  );
});
