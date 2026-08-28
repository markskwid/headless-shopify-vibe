import { z } from "zod";

import { productDetailsSchema, storefrontProductSchema } from "./product";

export const searchQuerySchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters to search.")
  .max(100, "Search terms must be 100 characters or fewer.");

export const productHandleSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Invalid product handle.");

export const predictiveSearchInputSchema = z.object({
  query: searchQuerySchema,
  limit: z.number().int().min(1).max(10).default(6),
});

export const predictiveSearchResponseSchema = z.object({
  predictiveSearch: z
    .object({
      products: z.array(storefrontProductSchema),
    })
    .nullable(),
});

const searchProductNodeSchema = storefrontProductSchema.extend({
  __typename: z.literal("Product"),
});

export const searchProductsResponseSchema = z.object({
  search: z.object({
    totalCount: z.number().int().nonnegative(),
    nodes: z.array(searchProductNodeSchema),
  }),
});

export const productByHandleResponseSchema = z.object({
  product: productDetailsSchema.nullable(),
});

export const productRecommendationsResponseSchema = z.object({
  productRecommendations: z.array(storefrontProductSchema).nullable(),
});

export const predictiveSearchPayloadSchema = z.object({
  products: z.array(storefrontProductSchema),
});

export const searchErrorPayloadSchema = z.object({
  error: z.string(),
});

const firstSearchParam = (value: unknown) =>
  Array.isArray(value) ? value[0] : value;

export const searchPageParamsSchema = z.object({
  q: z.preprocess(
    firstSearchParam,
    z.string().trim().max(100).catch("").default(""),
  ),
});

export const productPageParamsSchema = z.object({
  handle: z.preprocess(firstSearchParam, productHandleSchema),
});

export type PredictiveSearchPayload = z.infer<
  typeof predictiveSearchPayloadSchema
>;
