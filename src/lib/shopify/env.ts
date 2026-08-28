import "server-only";

import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalTokenSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const shopifyEnvSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z
    .string({ error: "SHOPIFY_STORE_DOMAIN is required." })
    .trim()
    .min(1, "SHOPIFY_STORE_DOMAIN is required.")
    .transform((value) =>
      value
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "")
        .toLowerCase(),
    )
    .pipe(
      z
        .string()
        .regex(
          /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/,
          "SHOPIFY_STORE_DOMAIN must look like your-store.myshopify.com.",
        ),
    ),
  SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN: optionalTokenSchema,
  SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN: optionalTokenSchema,
  SHOPIFY_STOREFRONT_API_VERSION: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .regex(
        /^\d{4}-(01|04|07|10)$/,
        "SHOPIFY_STOREFRONT_API_VERSION must use YYYY-01, YYYY-04, YYYY-07, or YYYY-10.",
      )
      .default("2026-07"),
  ),
});

type ParsedShopifyEnv = z.output<typeof shopifyEnvSchema>;

type ShopifyAccess =
  | { type: "private"; token: string }
  | { type: "public"; token: string }
  | { type: "tokenless" };

export type ShopifyConfig = {
  apiVersion: string;
  storeDomain: string;
  access: ShopifyAccess;
};

export type ShopifyConfigResult =
  | { configured: true; config: ShopifyConfig }
  | { configured: false; issues: string[] };

function toConfig(env: ParsedShopifyEnv): ShopifyConfig {
  const access: ShopifyAccess = env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN
    ? {
        type: "private",
        token: env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
      }
    : env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN
      ? {
          type: "public",
          token: env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN,
        }
      : { type: "tokenless" };

  return {
    apiVersion: env.SHOPIFY_STOREFRONT_API_VERSION,
    storeDomain: env.SHOPIFY_STORE_DOMAIN,
    access,
  };
}

export function getShopifyConfig(): ShopifyConfigResult {
  const parsed = shopifyEnvSchema.safeParse({
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN:
      process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
    SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN:
      process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN,
    SHOPIFY_STOREFRONT_API_VERSION:
      process.env.SHOPIFY_STOREFRONT_API_VERSION,
  });

  if (!parsed.success) {
    return {
      configured: false,
      issues: [...new Set(parsed.error.issues.map((issue) => issue.message))],
    };
  }

  return { configured: true, config: toConfig(parsed.data) };
}

export function requireShopifyConfig(): ShopifyConfig {
  const result = getShopifyConfig();

  if (!result.configured) {
    throw new ShopifyConfigurationError(result.issues);
  }

  return result.config;
}

export class ShopifyConfigurationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join(" "));
    this.name = "ShopifyConfigurationError";
  }
}
