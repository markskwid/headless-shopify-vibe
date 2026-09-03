import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

import {
  createCartFixture,
  createCustomerTokenFixture,
  TEST_CART_ID,
  TEST_CUSTOMER_TOKEN,
} from "./helpers/shopify-fixtures.mjs";

let cartSession;
let customerSession;
let cookieValues;
let cookieWrites;
let importSequence = 0;

beforeEach(async () => {
  cookieValues = new Map();
  cookieWrites = [];
  const cookieStore = {
    get(name) {
      const value = cookieValues.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set(name, value, options) {
      cookieWrites.push({ name, value, options });
      if (options?.maxAge === 0) cookieValues.delete(name);
      else cookieValues.set(name, value);
    },
  };

  mock.module("next/headers", {
    namedExports: { cookies: async () => cookieStore },
  });

  importSequence += 1;
  cartSession = await import(
    `../src/lib/shopify/services/cart-session.ts?session-test=${importSequence}`
  );
  customerSession = await import(
    `../src/lib/shopify/services/customer-session.ts?session-test=${importSequence}`
  );
});

test("cart cookie reads accept only Shopify cart IDs", async () => {
  cookieValues.set("shopify_cart_id", TEST_CART_ID);
  assert.equal(await cartSession.getCartIdFromCookies(), TEST_CART_ID);

  cookieValues.set("shopify_cart_id", "not-a-cart-id");
  assert.equal(await cartSession.getCartIdFromCookies(), null);

  cookieValues.delete("shopify_cart_id");
  assert.equal(await cartSession.getCartIdFromCookies(), null);
});

test("cart cookie writes are HTTP-only and persist for 30 days", async () => {
  process.env.NODE_ENV = "development";

  await cartSession.setCartIdCookie(TEST_CART_ID);

  assert.deepEqual(cookieWrites, [
    {
      name: "shopify_cart_id",
      value: TEST_CART_ID,
      options: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      },
    },
  ]);
  await assert.rejects(
    cartSession.setCartIdCookie("invalid"),
    (error) => error?.name === "ZodError",
  );
});

test("cart snapshots never expose the server-only cart ID", () => {
  const snapshot = cartSession.toCartSnapshot(createCartFixture());

  assert.equal("id" in snapshot, false);
  assert.equal(snapshot.checkoutUrl.includes("/checkouts/"), true);
  assert.equal(snapshot.totalQuantity, 1);
});

test("remembered customer sessions persist securely for seven days", async () => {
  process.env.NODE_ENV = "production";

  await customerSession.setCustomerSessionCookie(
    createCustomerTokenFixture(),
    true,
  );

  assert.equal(await customerSession.getCustomerAccessTokenFromCookies(), TEST_CUSTOMER_TOKEN);
  assert.equal(await customerSession.hasCustomerSession(), true);
  assert.equal(await customerSession.isCustomerSessionRemembered(), true);
  assert.equal(cookieWrites.length, 2);
  for (const write of cookieWrites) {
    assert.equal(write.options.httpOnly, true);
    assert.equal(write.options.secure, true);
    assert.equal(write.options.sameSite, "lax");
    assert.equal(write.options.path, "/");
    assert.equal(write.options.priority, "high");
    assert.equal(write.options.maxAge, 60 * 60 * 24 * 7);
  }
});

test("non-remembered customer sessions remain session cookies", async () => {
  process.env.NODE_ENV = "development";

  await customerSession.setCustomerSessionCookie(
    createCustomerTokenFixture(),
    false,
  );

  const tokenWrite = cookieWrites.find(
    ({ name }) => name === "shopify_customer_access_token",
  );
  const rememberedWrite = cookieWrites.find(
    ({ name }) => name === "shopify_customer_session_remembered",
  );
  assert.equal(tokenWrite.options.maxAge, undefined);
  assert.equal(tokenWrite.options.secure, false);
  assert.equal(rememberedWrite.value, "");
  assert.equal(rememberedWrite.options.maxAge, 0);
  assert.equal(await customerSession.isCustomerSessionRemembered(), false);
});

test("invalid customer tokens are ignored and logout clears both cookies", async () => {
  process.env.NODE_ENV = "production";
  cookieValues.set("shopify_customer_access_token", "");
  assert.equal(await customerSession.getCustomerAccessTokenFromCookies(), null);
  assert.equal(await customerSession.hasCustomerSession(), false);

  await customerSession.clearCustomerSessionCookie();

  assert.deepEqual(
    cookieWrites.map(({ name, value, options }) => ({
      name,
      value,
      maxAge: options.maxAge,
      secure: options.secure,
      httpOnly: options.httpOnly,
    })),
    [
      {
        name: "shopify_customer_access_token",
        value: "",
        maxAge: 0,
        secure: true,
        httpOnly: true,
      },
      {
        name: "shopify_customer_session_remembered",
        value: "",
        maxAge: 0,
        secure: true,
        httpOnly: true,
      },
    ],
  );
});
