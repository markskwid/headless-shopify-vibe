import "server-only";

import { createClient, type QueryParams } from "next-sanity";
import { z } from "zod";

import { requireSanityConfig } from "./env";

type SanityFetchOptions<TSchema extends z.ZodType> = {
  query: string;
  schema: TSchema;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
};

export class SanityRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SanityRequestError";
  }
}

export async function sanityFetch<TSchema extends z.ZodType>(
  options: SanityFetchOptions<TSchema>,
): Promise<z.output<TSchema>> {
  const config = requireSanityConfig();
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token,
    perspective: "published",
    useCdn: true,
    stega: false,
  });

  let response: unknown;

  try {
    response = await client.fetch(options.query, options.params ?? {}, {
      next: {
        revalidate: options.revalidate ?? 60,
        tags: options.tags ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Sanity error";
    throw new SanityRequestError(`Sanity request failed: ${message}`);
  }

  const parsed = options.schema.safeParse(response);

  if (!parsed.success) {
    throw new SanityRequestError(
      `Sanity data validation failed: ${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
