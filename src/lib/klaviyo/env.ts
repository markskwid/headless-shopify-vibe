import "server-only";

import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const klaviyoEnvSchema = z.object({
  listId: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .regex(
        /^[A-Za-z0-9]+$/,
        "KLAVIYO_LIST_ID must contain letters and numbers only.",
      )
      .optional(),
  ),
  apiKey: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .regex(
        /^pk_[A-Za-z0-9_-]{20,}$/,
        "KLAVIYO_API_KEY must be a valid private API key.",
      )
      .optional(),
  ),
});

export type KlaviyoConfig = {
  listId: string;
  apiKey: string;
};

export type KlaviyoConfigResult =
  | { configured: true; config: KlaviyoConfig }
  | { configured: false; issues: string[] };

export function getKlaviyoConfig(): KlaviyoConfigResult {
  const parsed = klaviyoEnvSchema.safeParse({
    listId: process.env.KLAVIYO_LIST_ID,
    apiKey: process.env.KLAVIYO_API_KEY,
  });

  if (!parsed.success) {
    return {
      configured: false,
      issues: [...new Set(parsed.error.issues.map((issue) => issue.message))],
    };
  }

  const issues: string[] = [];
  if (!parsed.data.listId) issues.push("KLAVIYO_LIST_ID is not configured.");
  if (!parsed.data.apiKey) issues.push("KLAVIYO_API_KEY is not configured.");

  if (issues.length || !parsed.data.listId || !parsed.data.apiKey) {
    return { configured: false, issues };
  }

  return {
    configured: true,
    config: { listId: parsed.data.listId, apiKey: parsed.data.apiKey },
  };
}

export function requireKlaviyoConfig(): KlaviyoConfig {
  const result = getKlaviyoConfig();

  if (!result.configured) {
    throw new KlaviyoConfigurationError(result.issues);
  }

  return result.config;
}

export class KlaviyoConfigurationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join(" "));
    this.name = "KlaviyoConfigurationError";
  }
}
