import assert from "node:assert/strict";
import test from "node:test";

import {
  getProductFilterPriceRange,
  parseCollectionBrowseParams,
  productFilterInputSchema,
  serializeProductFilter,
} from "../src/lib/shopify/schemas/collection.ts";
import {
  predictiveSearchInputSchema,
  productHandleSchema,
  searchPageParamsSchema,
  searchQuerySchema,
} from "../src/lib/shopify/schemas/search.ts";
import { getCartSubtotal } from "../src/lib/shopify/utils/cart-pricing.ts";
import {
  createCartFixture,
  createCartLineFixture,
} from "./helpers/shopify-fixtures.mjs";

test("collection browsing normalizes sort, filters, price, and pagination", () => {
  const availability = serializeProductFilter({ available: true });
  const price = serializeProductFilter({ price: { min: 10, max: 50 } });
  const result = parseCollectionBrowseParams({
    sort: ["price-desc", "featured"],
    filter: [availability, availability, price],
    after: "next-cursor",
  });

  assert.equal(result.sort, "price-desc");
  assert.deepEqual(result.filters, [
    { available: true },
    { price: { min: 10, max: 50 } },
  ]);
  assert.deepEqual(result.serializedFilters, [availability, price]);
  assert.deepEqual(result.selectedPriceRange, { min: 10, max: 50 });
  assert.equal(result.after, "next-cursor");
  assert.equal(result.before, null);
});

test("collection browsing drops malformed values and ambiguous cursors", () => {
  const result = parseCollectionBrowseParams({
    sort: "not-a-sort",
    filter: [
      "not-json",
      JSON.stringify({ unsupported: true }),
      JSON.stringify({ price: { min: 100, max: 20 } }),
    ],
    after: "next-cursor",
    before: "previous-cursor",
  });

  assert.equal(result.sort, "featured");
  assert.deepEqual(result.filters, [{ price: { min: 100, max: 20 } }]);
  assert.equal(result.selectedPriceRange, null);
  assert.equal(result.after, null);
  assert.equal(result.before, null);
});

test("collection filter schemas accept one supported key only", () => {
  assert.equal(
    productFilterInputSchema.safeParse({ productVendor: "Acme" }).success,
    true,
  );
  assert.equal(
    productFilterInputSchema.safeParse({ available: true, tag: "sale" }).success,
    false,
  );
  assert.equal(
    productFilterInputSchema.safeParse({ unsupported: true }).success,
    false,
  );
  assert.equal(
    getProductFilterPriceRange({ price: { min: 20, max: 10 } }),
    null,
  );
});

test("collection browsing caps accepted filters at 25", () => {
  const filters = Array.from({ length: 30 }, (_, index) =>
    JSON.stringify({ tag: `tag-${index}` }),
  );

  assert.equal(parseCollectionBrowseParams({ filter: filters }).filters.length, 25);
});

test("search and product inputs trim values and enforce public limits", () => {
  assert.equal(searchQuerySchema.parse("  shoes  "), "shoes");
  assert.equal(productHandleSchema.parse("  canvas-shoe  "), "canvas-shoe");
  assert.deepEqual(
    predictiveSearchInputSchema.parse({ query: "boots" }),
    { query: "boots", limit: 6 },
  );
  assert.deepEqual(searchPageParamsSchema.parse({ q: ["  hats  ", "ignored"] }), {
    q: "hats",
  });

  assert.equal(searchQuerySchema.safeParse("x").success, false);
  assert.equal(productHandleSchema.safeParse("Unsafe Handle").success, false);
  assert.equal(
    predictiveSearchInputSchema.safeParse({ query: "boots", limit: 11 }).success,
    false,
  );
});

test("cart subtotal reports Shopify line discounts without going negative", () => {
  const cart = createCartFixture({
    cost: {
      subtotalAmount: { amount: "100.00", currencyCode: "USD" },
      totalAmount: { amount: "75.00", currencyCode: "USD" },
    },
    lines: {
      nodes: [
        createCartLineFixture({
          discountAllocations: [
            { discountedAmount: { amount: "25.00", currencyCode: "USD" } },
          ],
        }),
      ],
    },
  });

  assert.deepEqual(getCartSubtotal(cart), {
    originalAmount: 100,
    discountedAmount: 75,
    currencyCode: "USD",
    hasDiscount: true,
  });

  const excessiveDiscount = {
    ...cart,
    cost: {
      subtotalAmount: { amount: "10.00", currencyCode: "USD" },
      totalAmount: { amount: "0.00", currencyCode: "USD" },
    },
  };
  assert.equal(getCartSubtotal(excessiveDiscount).discountedAmount, 0);
});
