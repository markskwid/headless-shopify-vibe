export const TEST_CART_ID = "gid://shopify/Cart/test-cart?key=test-secret";
export const TEST_LINE_ID = "gid://shopify/CartLine/test-line";
export const TEST_VARIANT_ID = "gid://shopify/ProductVariant/123456789";
export const TEST_CUSTOMER_TOKEN = "test-customer-access-token";

export function setShopifyTestEnvironment(overrides = {}) {
  process.env.SHOPIFY_STORE_DOMAIN = "unit-test.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_API_VERSION = "2026-07";
  delete process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN;
  delete process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN;
  delete process.env.SHOPIFY_WEBHOOK_SECRET;
  Object.assign(process.env, overrides);
}

export function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    statusText: init.statusText,
    headers: { "content-type": "application/json" },
  });
}

export function shopifyData(data, init) {
  return jsonResponse({ data }, init);
}

export function createCartLineFixture(overrides = {}) {
  return {
    id: TEST_LINE_ID,
    quantity: 1,
    cost: {
      amountPerQuantity: { amount: "25.00", currencyCode: "USD" },
      compareAtAmountPerQuantity: null,
      subtotalAmount: { amount: "25.00", currencyCode: "USD" },
      totalAmount: { amount: "25.00", currencyCode: "USD" },
    },
    discountAllocations: [],
    merchandise: {
      id: TEST_VARIANT_ID,
      title: "Default Title",
      availableForSale: true,
      image: null,
      selectedOptions: [],
      product: {
        handle: "test-product",
        title: "Test product",
      },
    },
    ...overrides,
  };
}

export function createCartFixture(overrides = {}) {
  return {
    id: TEST_CART_ID,
    checkoutUrl: "https://unit-test.myshopify.com/checkouts/test",
    totalQuantity: 1,
    note: null,
    discountCodes: [],
    cost: {
      subtotalAmount: { amount: "25.00", currencyCode: "USD" },
      totalAmount: { amount: "25.00", currencyCode: "USD" },
    },
    lines: { nodes: [] },
    ...overrides,
  };
}

export function createCartMutationPayload(overrides = {}) {
  return {
    cart: createCartFixture(),
    userErrors: [],
    warnings: [],
    ...overrides,
  };
}

export function createCustomerTokenFixture(overrides = {}) {
  return {
    accessToken: TEST_CUSTOMER_TOKEN,
    expiresAt: "2026-09-10T00:00:00.000Z",
    ...overrides,
  };
}
