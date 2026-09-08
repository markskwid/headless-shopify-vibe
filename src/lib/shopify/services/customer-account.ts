import "server-only";

import { requireShopifyConfig } from "../env";

/**
 * Returns Shopify's hosted customer-account entry point. Shopify routes signed
 * out customers through its passwordless login and signed-in customers to
 * their account.
 */
export function getHostedCustomerAccountUrl() {
  const { storeDomain } = requireShopifyConfig();

  return new URL("/account", `https://${storeDomain}`).toString();
}
