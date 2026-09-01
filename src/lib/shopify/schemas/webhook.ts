import { z } from "zod";

export const shopifyWebhookHeadersSchema = z.object({
  hmac: z
    .string()
    .regex(/^[A-Za-z0-9+/]{43}=$/, "Invalid Shopify webhook signature."),
  shopDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/),
  topic: z
    .string()
    .trim()
    .toLowerCase()
    .max(128)
    .regex(/^[a-z0-9_]+\/[a-z0-9_]+$/),
  webhookId: z.uuid().optional(),
});

export const shopifyWebhookPayloadSchema = z
  .object({
    handle: z
      .string()
      .trim()
      .max(255)
      .regex(/^[a-z0-9][a-z0-9-]*$/)
      .nullish(),
  })
  .loose();
