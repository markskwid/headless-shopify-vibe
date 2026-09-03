import assert from "node:assert/strict";
import { mock, test } from "node:test";

import {
  createCart,
  removeCartLine,
  ShopifyCartError,
  updateCartLine,
} from "../src/lib/shopify/services/cart.ts";
import {
  createCartFixture,
  createCartMutationPayload,
  setShopifyTestEnvironment,
  shopifyData,
  TEST_CART_ID,
  TEST_CUSTOMER_TOKEN,
  TEST_LINE_ID,
  TEST_VARIANT_ID,
} from "./helpers/shopify-fixtures.mjs";

test("createCart validates input and sends customer-aware cart variables", async () => {
  setShopifyTestEnvironment();
  let captured;
  mock.method(globalThis, "fetch", async (_url, request) => {
    captured = request;
    return shopifyData({
      cartCreate: createCartMutationPayload({
        warnings: [
          { code: "MERCHANDISE_NOT_ENOUGH_STOCK", message: "Only one remains.", target: "cart" },
        ],
      }),
    });
  });

  const result = await createCart(
    { merchandiseId: TEST_VARIANT_ID, quantity: 2 },
    TEST_CUSTOMER_TOKEN,
    "203.0.113.9",
  );

  assert.equal(result.cart.id, TEST_CART_ID);
  assert.deepEqual(result.warnings, ["Only one remains."]);
  assert.equal(captured.cache, "no-store");
  assert.equal(
    captured.headers.get("Shopify-Storefront-Buyer-IP"),
    "203.0.113.9",
  );
  assert.deepEqual(JSON.parse(captured.body).variables, {
    input: {
      lines: [{ merchandiseId: TEST_VARIANT_ID, quantity: 2 }],
      buyerIdentity: { customerAccessToken: TEST_CUSTOMER_TOKEN },
    },
  });
});

test("updateCartLine sends the validated quantity and line ID", async () => {
  setShopifyTestEnvironment();
  let variables;
  mock.method(globalThis, "fetch", async (_url, request) => {
    variables = JSON.parse(request.body).variables;
    return shopifyData({
      cartLinesUpdate: createCartMutationPayload({
        cart: createCartFixture({ totalQuantity: 3 }),
      }),
    });
  });

  const result = await updateCartLine(TEST_CART_ID, {
    lineId: TEST_LINE_ID,
    quantity: 3,
  });

  assert.equal(result.cart.totalQuantity, 3);
  assert.deepEqual(variables, {
    cartId: TEST_CART_ID,
    lines: [{ id: TEST_LINE_ID, quantity: 3 }],
  });
});

test("removeCartLine sends only the requested validated line", async () => {
  setShopifyTestEnvironment();
  let variables;
  mock.method(globalThis, "fetch", async (_url, request) => {
    variables = JSON.parse(request.body).variables;
    return shopifyData({
      cartLinesRemove: createCartMutationPayload({
        cart: createCartFixture({ totalQuantity: 0 }),
      }),
    });
  });

  const result = await removeCartLine(TEST_CART_ID, TEST_LINE_ID);

  assert.equal(result.cart.totalQuantity, 0);
  assert.deepEqual(variables, {
    cartId: TEST_CART_ID,
    lineIds: [TEST_LINE_ID],
  });
});

test("cart mutations reject invalid IDs and quantities before fetching", async () => {
  setShopifyTestEnvironment();

  for (const operation of [
    () => createCart({ merchandiseId: "gid://shopify/Product/1", quantity: 1 }),
    () => createCart({ merchandiseId: TEST_VARIANT_ID, quantity: 0 }),
    () => createCart({ merchandiseId: TEST_VARIANT_ID, quantity: 251 }),
    () => updateCartLine("not-a-cart", { lineId: TEST_LINE_ID, quantity: 1 }),
    () => updateCartLine(TEST_CART_ID, { lineId: "", quantity: 1 }),
    () => updateCartLine(TEST_CART_ID, { lineId: TEST_LINE_ID, quantity: 1.5 }),
    () => removeCartLine(TEST_CART_ID, ""),
  ]) {
    await assert.rejects(operation(), (error) => error?.name === "ZodError");
  }
});

test("cart mutations expose Shopify user errors and codes", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    shopifyData({
      cartLinesUpdate: createCartMutationPayload({
        cart: null,
        userErrors: [
          { code: "INVALID", field: ["lines", "0"], message: "Invalid quantity." },
        ],
      }),
    }),
  );

  await assert.rejects(
    updateCartLine(TEST_CART_ID, { lineId: TEST_LINE_ID, quantity: 2 }),
    (error) =>
      error instanceof ShopifyCartError &&
      error.message === "Invalid quantity." &&
      error.codes[0] === "INVALID",
  );
});

test("cart mutations reject a missing Shopify mutation payload", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    shopifyData({ cartLinesRemove: null }),
  );
  await assert.rejects(
    removeCartLine(TEST_CART_ID, TEST_LINE_ID),
    (error) =>
      error instanceof ShopifyCartError &&
      error.message.includes("did not return a cart mutation result"),
  );
});

test("cart mutations reject a missing updated cart", async () => {
  setShopifyTestEnvironment();
  mock.method(globalThis, "fetch", async () =>
    shopifyData({
      cartLinesRemove: createCartMutationPayload({ cart: null }),
    }),
  );
  await assert.rejects(
    removeCartLine(TEST_CART_ID, TEST_LINE_ID),
    (error) =>
      error instanceof ShopifyCartError &&
      error.message.includes("did not return an updated cart"),
  );
});
