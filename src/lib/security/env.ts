import "server-only";

import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.preprocess(emptyStringToUndefined, schema.optional());

const securityEnvSchema = z
  .object({
    upstashUrl: optionalString(z.url().startsWith("https://")),
    upstashToken: optionalString(z.string().trim().min(20).max(2048)),
    rateLimitKeySalt: optionalString(z.string().min(32).max(256)),
    trustedProxyIpHeader: z.preprocess(
      emptyStringToUndefined,
      z
        .enum([
          "cf-connecting-ip",
          "x-forwarded-for",
          "x-real-ip",
          "x-vercel-forwarded-for",
        ])
        .default("x-forwarded-for"),
    ),
  })
  .superRefine((value, context) => {
    if (Boolean(value.upstashUrl) !== Boolean(value.upstashToken)) {
      context.addIssue({
        code: "custom",
        message:
          "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured together.",
      });
    }

    if ((value.upstashUrl || value.upstashToken) && !value.rateLimitKeySalt) {
      context.addIssue({
        code: "custom",
        path: ["rateLimitKeySalt"],
        message:
          "RATE_LIMIT_KEY_SALT is required when distributed rate limiting is configured.",
      });
    }
  });

export type SecurityConfig = {
  rateLimit:
    | {
        url: string;
        token: string;
        keySalt: string;
      }
    | null;
  trustedProxyIpHeader:
    | "cf-connecting-ip"
    | "x-forwarded-for"
    | "x-real-ip"
    | "x-vercel-forwarded-for";
};

let cachedConfig: SecurityConfig | undefined;

export function getSecurityConfig(): SecurityConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = securityEnvSchema.parse({
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    rateLimitKeySalt: process.env.RATE_LIMIT_KEY_SALT,
    trustedProxyIpHeader: process.env.TRUSTED_PROXY_IP_HEADER,
  });

  cachedConfig = {
    rateLimit:
      parsed.upstashUrl && parsed.upstashToken && parsed.rateLimitKeySalt
        ? {
            url: parsed.upstashUrl,
            token: parsed.upstashToken,
            keySalt: parsed.rateLimitKeySalt,
          }
        : null,
    trustedProxyIpHeader: parsed.trustedProxyIpHeader,
  };

  return cachedConfig;
}
