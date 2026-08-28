import "server-only";

import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const sanityEnvSchema = z.object({
  projectId: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .regex(
        /^[a-z0-9]+$/,
        "NEXT_PUBLIC_SANITY_PROJECT_ID must contain lowercase letters and numbers only.",
      )
      .optional(),
  ),
  dataset: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .regex(
        /^[a-z0-9_-]+$/,
        "NEXT_PUBLIC_SANITY_DATASET contains unsupported characters.",
      )
      .default("production"),
  ),
  apiVersion: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "SANITY_API_VERSION must use YYYY-MM-DD.",
      )
      .default("2026-08-27"),
  ),
  token: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).optional(),
  ),
});

export type SanityConfig = {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
};

export type SanityConfigResult =
  | { configured: true; config: SanityConfig }
  | { configured: false; issues: string[] };

export function getSanityConfig(): SanityConfigResult {
  const parsed = sanityEnvSchema.safeParse({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION,
    token: process.env.SANITY_API_READ_TOKEN,
  });

  if (!parsed.success) {
    return {
      configured: false,
      issues: [...new Set(parsed.error.issues.map((issue) => issue.message))],
    };
  }

  if (!parsed.data.projectId) {
    return {
      configured: false,
      issues: ["NEXT_PUBLIC_SANITY_PROJECT_ID is not configured."],
    };
  }

  return {
    configured: true,
    config: {
      projectId: parsed.data.projectId,
      dataset: parsed.data.dataset,
      apiVersion: parsed.data.apiVersion,
      token: parsed.data.token,
    },
  };
}

export function requireSanityConfig(): SanityConfig {
  const result = getSanityConfig();

  if (!result.configured) {
    throw new SanityConfigurationError(result.issues);
  }

  return result.config;
}

export class SanityConfigurationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join(" "));
    this.name = "SanityConfigurationError";
  }
}
