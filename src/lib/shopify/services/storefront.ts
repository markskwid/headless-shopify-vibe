import { shopifyFetch } from "../client";
import { STOREFRONT_HOME_QUERY } from "../graphql/queries/storefront-home";
import { STOREFRONT_IDENTITY_QUERY } from "../graphql/queries/storefront-identity";
import {
  storefrontHomeSchema,
  storefrontIdentitySchema,
} from "../schemas/storefront";

export function getStorefrontHome() {
  return shopifyFetch({
    query: STOREFRONT_HOME_QUERY,
    schema: storefrontHomeSchema,
    variables: { first: 8, collectionCount: 6 },
    revalidate: 300,
    tags: ["shopify-products", "shopify-collections"],
  });
}

export function getStorefrontIdentity() {
  return shopifyFetch({
    query: STOREFRONT_IDENTITY_QUERY,
    schema: storefrontIdentitySchema,
    revalidate: 300,
    tags: ["shopify-store-identity"],
  });
}
