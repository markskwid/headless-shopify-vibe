import { z } from "zod";

import { httpsUrlSchema } from "@/lib/validation/url";

import { collectionCardSchema } from "./collection";
import { storefrontProductSchema } from "./product";

export const storefrontHomeSchema = z.object({
  shop: z.object({
    name: z.string(),
    description: z.string().nullable(),
    primaryDomain: z.object({
      url: httpsUrlSchema,
    }),
  }),
  products: z.object({
    nodes: z.array(storefrontProductSchema),
  }),
  collections: z.object({
    nodes: z.array(collectionCardSchema),
  }),
});

export const storefrontIdentitySchema = z.object({
  shop: z.object({
    name: z.string(),
    description: z.string().nullable(),
  }),
});

export type StorefrontHome = z.infer<typeof storefrontHomeSchema>;
