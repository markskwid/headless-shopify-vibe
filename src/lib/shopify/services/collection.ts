import { z } from "zod";

import { shopifyFetch } from "../client";
import { ALL_PRODUCTS_QUERY } from "../graphql/queries/all-products";
import { COLLECTION_QUERY } from "../graphql/queries/collection";
import {
  allProductsResponseSchema,
  collectionHandleSchema,
  collectionResponseSchema,
  collectionSortValueSchema,
  productFilterInputSchema,
  type CollectionSortValue,
  type ShopifyProductFilter,
} from "../schemas/collection";

const browseInputSchema = z.object({
  filters: z.array(productFilterInputSchema).max(25).default([]),
  sort: collectionSortValueSchema.default("featured"),
});

const collectionInputSchema = browseInputSchema.extend({
  handle: collectionHandleSchema,
});

const collectionSort = {
  featured: { sortKey: "COLLECTION_DEFAULT", reverse: false },
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  newest: { sortKey: "CREATED", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  "title-asc": { sortKey: "TITLE", reverse: false },
  "title-desc": { sortKey: "TITLE", reverse: true },
} as const satisfies Record<
  CollectionSortValue,
  { sortKey: string; reverse: boolean }
>;

function retainFullPriceRange<
  TProducts extends { filters: ShopifyProductFilter[] },
>(
  products: TProducts,
  unfilteredFilters: TProducts["filters"],
): TProducts {
  const priceFilter = unfilteredFilters.find(
    (filter) => filter.type === "PRICE_RANGE",
  );

  if (!priceFilter) return products;

  return {
    ...products,
    filters: products.filters.map((filter) =>
      filter.type === "PRICE_RANGE" ? priceFilter : filter,
    ),
  };
}

export async function getCollection(input: unknown) {
  const { handle, filters, sort } = collectionInputSchema.parse(input);
  const sorting = collectionSort[sort];
  const response = await shopifyFetch({
    query: COLLECTION_QUERY,
    schema: collectionResponseSchema,
    variables: {
      handle,
      first: 24,
      filters,
      ...sorting,
    },
    revalidate: 60,
    tags: ["shopify-collections", `shopify-collection:${handle}`],
  });

  return response.collection
    ? {
        ...response.collection,
        products: retainFullPriceRange(
          response.collection.products,
          response.collection.unfilteredProducts.filters,
        ),
        currencyCode: response.paymentSettings.currencyCode,
      }
    : null;
}

export function getAllProducts(input: unknown = {}) {
  const { filters, sort } = browseInputSchema.parse(input);
  const sorting = collectionSort[sort];

  return shopifyFetch({
    query: ALL_PRODUCTS_QUERY,
    schema: allProductsResponseSchema,
    variables: {
      first: 24,
      filters,
      ...sorting,
    },
    revalidate: 60,
    tags: [
      "shopify-products",
      "shopify-collections",
      "shopify-collection:all",
    ],
  }).then((response) => ({
    products: response.collection
      ? retainFullPriceRange(
          response.collection.products,
          response.collection.unfilteredProducts.filters,
        )
      : { nodes: [], filters: [] },
    currencyCode: response.paymentSettings.currencyCode,
  }));
}
