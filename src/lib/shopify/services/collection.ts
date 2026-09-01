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

const paginationCursorSchema = z.string().trim().min(1).max(2048);

const browseInputFields = {
  filters: z.array(productFilterInputSchema).max(25).default([]),
  sort: collectionSortValueSchema.default("featured"),
  after: paginationCursorSchema.nullable().default(null),
  before: paginationCursorSchema.nullable().default(null),
};

function normalizeBrowseCursors<
  TInput extends { after: string | null; before: string | null },
>(input: TInput) {
  return input.after && input.before
    ? { ...input, after: null, before: null }
    : input;
}

const browseInputSchema = z
  .object(browseInputFields)
  .transform(normalizeBrowseCursors);

const collectionInputSchema = z
  .object({ ...browseInputFields, handle: collectionHandleSchema })
  .transform(normalizeBrowseCursors);

const PRODUCTS_PER_PAGE = 10;
const EMPTY_PAGE_INFO = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
} as const;

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

function productPaginationVariables({
  after,
  before,
}: {
  after: string | null;
  before: string | null;
}) {
  return before
    ? {
        first: null,
        last: PRODUCTS_PER_PAGE,
        after: null,
        before,
      }
    : {
        first: PRODUCTS_PER_PAGE,
        last: null,
        after,
        before: null,
      };
}

export async function getCollection(input: unknown) {
  const { after, before, handle, filters, sort } =
    collectionInputSchema.parse(input);
  const sorting = collectionSort[sort];
  const response = await shopifyFetch({
    query: COLLECTION_QUERY,
    schema: collectionResponseSchema,
    variables: {
      handle,
      filters,
      ...productPaginationVariables({ after, before }),
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
  const { after, before, filters, sort } = browseInputSchema.parse(input);
  const sorting = collectionSort[sort];

  return shopifyFetch({
    query: ALL_PRODUCTS_QUERY,
    schema: allProductsResponseSchema,
    variables: {
      filters,
      ...productPaginationVariables({ after, before }),
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
      : { nodes: [], filters: [], pageInfo: EMPTY_PAGE_INFO },
    currencyCode: response.paymentSettings.currencyCode,
  }));
}
