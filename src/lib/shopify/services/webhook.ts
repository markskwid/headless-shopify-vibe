import "server-only";

import {
  readBoundedJsonBody,
  WebhookRequestError,
} from "@/lib/webhooks/request";

import { requireShopifyConfig } from "../env";
import {
  shopifyWebhookHeadersSchema,
  shopifyWebhookPayloadSchema,
} from "../schemas/webhook";
import { verifyShopifyWebhookSignature } from "../utils/webhook";

const MAX_SHOPIFY_WEBHOOK_BYTES = 5 * 1024 * 1024;

export class ShopifyWebhookError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 413 | 415,
  ) {
    super(message);
    this.name = "ShopifyWebhookError";
  }
}

export async function parseShopifyWebhook(
  request: Request,
  secret: string,
) {
  const headers = shopifyWebhookHeadersSchema.safeParse({
    hmac: request.headers.get("x-shopify-hmac-sha256"),
    shopDomain: request.headers.get("x-shopify-shop-domain"),
    topic: request.headers.get("x-shopify-topic"),
    webhookId: request.headers.get("x-shopify-webhook-id") || undefined,
  });

  if (!headers.success) {
    throw new ShopifyWebhookError("Invalid Shopify webhook headers.", 400);
  }

  let body: Uint8Array;

  try {
    body = await readBoundedJsonBody(request, MAX_SHOPIFY_WEBHOOK_BYTES);
  } catch (error) {
    if (error instanceof WebhookRequestError) {
      throw new ShopifyWebhookError(error.message, error.status);
    }
    throw error;
  }

  const validSignature = verifyShopifyWebhookSignature({
    body,
    secret,
    signature: headers.data.hmac,
  });
  const expectedDomain = requireShopifyConfig().storeDomain;

  if (!validSignature || headers.data.shopDomain !== expectedDomain) {
    throw new ShopifyWebhookError("Invalid Shopify webhook signature.", 401);
  }

  let rawPayload: unknown;

  try {
    rawPayload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new ShopifyWebhookError("Invalid Shopify webhook payload.", 400);
  }

  const payload = shopifyWebhookPayloadSchema.safeParse(rawPayload);

  if (!payload.success) {
    throw new ShopifyWebhookError("Invalid Shopify webhook payload.", 400);
  }

  return {
    handle: payload.data.handle ?? null,
    shopDomain: headers.data.shopDomain,
    topic: headers.data.topic,
    webhookId: headers.data.webhookId ?? null,
  };
}
