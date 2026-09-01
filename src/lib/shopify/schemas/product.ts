import { z } from "zod";

import { httpsUrlSchema } from "@/lib/validation/url";

export const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string().length(3),
});

export const storefrontProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  trackingParameters: z.string().max(2048).nullable().optional(),
  featuredImage: z
    .object({
      url: httpsUrlSchema,
      altText: z.string().nullable(),
      width: z.number().int().positive().nullable(),
      height: z.number().int().positive().nullable(),
    })
    .nullable(),
  priceRange: z.object({
    minVariantPrice: moneySchema,
  }),
});

export const productImageSchema = z.object({
  id: z.string(),
  url: httpsUrlSchema,
  altText: z.string().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export const productVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  sku: z.string().nullable(),
  selectedOptions: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
  image: productImageSchema.nullable(),
  price: moneySchema,
  compareAtPrice: moneySchema.nullable(),
});

export const productDetailsSchema = storefrontProductSchema.extend({
  description: z.string(),
  vendor: z.string(),
  productType: z.string(),
  seo: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
  }),
  images: z.object({
    nodes: z.array(productImageSchema),
  }),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      optionValues: z.array(
        z.object({
          name: z.string(),
        }),
      ),
    }),
  ),
  variants: z.object({
    nodes: z.array(productVariantSchema),
  }),
});

export type StorefrontProduct = z.infer<typeof storefrontProductSchema>;
export type ProductDetails = z.infer<typeof productDetailsSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
