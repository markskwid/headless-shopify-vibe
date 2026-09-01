import "server-only";

import { z } from "zod";

import { requireShopifyConfig } from "./env";

const graphQlResponseSchema = z.object({
  data: z.unknown().optional(),
  errors: z
    .array(
      z
        .object({
          message: z.string(),
        })
        .loose(),
    )
    .optional(),
});

const SHOPIFY_REQUEST_TIMEOUT_MS = 12_000;

type ShopifyFetchOptions<TSchema extends z.ZodType> = {
  query: string;
  schema: TSchema;
  variables?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
  buyerIp?: string;
};

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export class ShopifyRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ShopifyRequestError";
  }
}

async function fetchShopify(
  url: string,
  request: NextRequestInit,
  retryNetworkFailure: boolean,
) {
  const attempts = retryNetworkFailure ? 2 : 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, {
        ...request,
        signal: AbortSignal.timeout(SHOPIFY_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw new ShopifyRequestError(
    "Shopify could not be reached after retrying the request. Please try again.",
    undefined,
    { cause: lastError },
  );
}

export async function shopifyFetch<TSchema extends z.ZodType>(
  options: ShopifyFetchOptions<TSchema>,
): Promise<z.output<TSchema>> {
  const config = requireShopifyConfig();
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (config.access.type === "private") {
    headers.set("Shopify-Storefront-Private-Token", config.access.token);
  }

  if (config.access.type === "public") {
    headers.set("X-Shopify-Storefront-Access-Token", config.access.token);
  }

  if (options.buyerIp) {
    headers.set("Shopify-Storefront-Buyer-IP", options.buyerIp);
  }

  const noStore = options.revalidate === false;
  const request: NextRequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: options.query,
      variables: options.variables ?? {},
    }),
    cache: noStore ? "no-store" : "force-cache",
    next: noStore
      ? undefined
      : {
          revalidate: options.revalidate ?? 300,
          tags: ["shopify", ...(options.tags ?? [])],
        },
  };

  const response = await fetchShopify(
    `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`,
    request,
    !noStore,
  );

  if (!response.ok) {
    throw new ShopifyRequestError(
      `Shopify returned ${response.status} ${response.statusText}. Check the store domain and Storefront API token.`,
      response.status,
    );
  }

  const payload = graphQlResponseSchema.safeParse(await response.json());

  if (!payload.success) {
    throw new ShopifyRequestError(
      "Shopify returned an unexpected response shape.",
      response.status,
    );
  }

  if (payload.data.errors?.length) {
    throw new ShopifyRequestError(
      payload.data.errors.map((error) => error.message).join(" "),
      response.status,
    );
  }

  if (payload.data.data === undefined) {
    throw new ShopifyRequestError(
      "Shopify returned no data for this request.",
      response.status,
    );
  }

  const data = options.schema.safeParse(payload.data.data);

  if (!data.success) {
    throw new ShopifyRequestError(
      `Shopify data validation failed: ${z.prettifyError(data.error)}`,
      response.status,
    );
  }

  return data.data;
}
