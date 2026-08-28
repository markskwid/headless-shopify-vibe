import { z } from "zod";

import { productImageSchema, storefrontProductSchema } from "./product";

const PRODUCT_FILTER_KEYS = [
  "available",
  "category",
  "price",
  "productMetafield",
  "productType",
  "productVendor",
  "tag",
  "taxonomyMetafield",
  "variantMetafield",
  "variantOption",
] as const;

const productFilterKeySchema = z.enum(PRODUCT_FILTER_KEYS);

export const productFilterInputSchema = z
  .record(z.string(), z.json())
  .refine(
    (input) => {
      const keys = Object.keys(input);
      return keys.length === 1 && productFilterKeySchema.safeParse(keys[0]).success;
    },
    "Invalid Shopify product filter.",
  );

const shopifyFilterValueInputSchema = z.preprocess((value) => {
  if (typeof value !== "string" || value.length > 2048) return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}, productFilterInputSchema);

export const collectionSortValueSchema = z.enum([
  "featured",
  "best-selling",
  "newest",
  "price-asc",
  "price-desc",
  "title-asc",
  "title-desc",
]);

export const collectionSortOptions = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title-asc", label: "Title: A–Z" },
  { value: "title-desc", label: "Title: Z–A" },
] as const satisfies ReadonlyArray<{
  value: z.infer<typeof collectionSortValueSchema>;
  label: string;
}>;

export const collectionHandleSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Invalid collection handle.");

export const collectionCardSchema = z.object({
  id: z.string(),
  handle: collectionHandleSchema,
  title: z.string(),
  description: z.string(),
  image: productImageSchema.nullable(),
});

export const shopifyProductFilterSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["BOOLEAN", "LIST", "PRICE_RANGE"]),
  values: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      count: z.number().int().nonnegative(),
      input: shopifyFilterValueInputSchema,
    }),
  ),
});

const collectionProductsSchema = z.object({
  nodes: z.array(storefrontProductSchema),
  filters: z.array(shopifyProductFilterSchema),
});

const collectionFilterOptionsSchema = z.object({
  filters: z.array(shopifyProductFilterSchema),
});

export const collectionResponseSchema = z.object({
  paymentSettings: z.object({
    currencyCode: z.string().length(3),
  }),
  collection: collectionCardSchema
    .extend({
      products: collectionProductsSchema,
      unfilteredProducts: collectionFilterOptionsSchema,
    })
    .nullable(),
});

export const allProductsResponseSchema = z.object({
  paymentSettings: z.object({
    currencyCode: z.string().length(3),
  }),
  collection: z
    .object({
      products: collectionProductsSchema,
      unfilteredProducts: collectionFilterOptionsSchema,
    })
    .nullable(),
});

const rawBrowseParamsSchema = z
  .object({
    sort: z.union([z.string(), z.array(z.string())]).optional(),
    filter: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .loose();

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function allValues(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function serializeProductFilter(input: ProductFilterInput) {
  return JSON.stringify(input);
}

const priceRangeSchema = z
  .object({
    min: z.number().finite().nonnegative().optional(),
    max: z.number().finite().nonnegative().optional(),
  })
  .refine(
    ({ min, max }) => min === undefined || max === undefined || min <= max,
    "Invalid Shopify price range.",
  );

export function getProductFilterPriceRange(input: ProductFilterInput) {
  const price = priceRangeSchema.safeParse(input.price);
  return price.success ? price.data : null;
}

export function parseCollectionBrowseParams(input: unknown) {
  const raw = rawBrowseParamsSchema.safeParse(input);
  const params = raw.success ? raw.data : {};
  const parsedSort = collectionSortValueSchema.safeParse(
    firstValue(params.sort),
  );
  const filters = allValues(params.filter)
    .slice(0, 25)
    .flatMap((value) => {
      if (value.length > 2048) return [];

      try {
        const parsed = productFilterInputSchema.safeParse(JSON.parse(value));
        return parsed.success ? [parsed.data] : [];
      } catch {
        return [];
      }
    });
  const uniqueFilters = Array.from(
    new Map(
      filters.map((filter) => [serializeProductFilter(filter), filter]),
    ).values(),
  );
  const selectedPriceRange = uniqueFilters
    .map(getProductFilterPriceRange)
    .find((priceRange) => priceRange !== null) ?? null;

  return {
    sort: parsedSort.success ? parsedSort.data : "featured",
    filters: uniqueFilters,
    serializedFilters: uniqueFilters.map(serializeProductFilter),
    selectedPriceRange,
  } as const;
}

export type CollectionCardData = z.infer<typeof collectionCardSchema>;
export type CollectionSortValue = z.infer<typeof collectionSortValueSchema>;
export type ProductFilterInput = z.infer<typeof productFilterInputSchema>;
export type ProductFilterPriceRange = z.infer<typeof priceRangeSchema>;
export type ShopifyProductFilter = z.infer<
  typeof shopifyProductFilterSchema
>;
