import "server-only";

import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { z } from "zod";

import {
  readBoundedJsonBody,
  WebhookRequestError,
} from "@/lib/security/webhook-request";

import { requireSanityConfig } from "../env";

const MAX_SANITY_WEBHOOK_BYTES = 64 * 1024;

const sanityWebhookPayloadSchema = z
  .object({
    _id: z.string().trim().min(1).max(512).optional(),
    _type: z.string().trim().min(1).max(128).optional(),
  })
  .loose()
  .nullable();

export class SanityWebhookError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 413 | 415,
  ) {
    super(message);
    this.name = "SanityWebhookError";
  }
}

export async function parseSanityWebhook(
  request: NextRequest,
  secret: string,
) {
  try {
    await readBoundedJsonBody(request.clone(), MAX_SANITY_WEBHOOK_BYTES);
  } catch (error) {
    if (error instanceof WebhookRequestError) {
      throw new SanityWebhookError(error.message, error.status);
    }
    throw error;
  }

  const { body, isValidSignature } = await parseBody<unknown>(
    request,
    secret,
    true,
  );

  if (!isValidSignature) {
    throw new SanityWebhookError("Invalid Sanity webhook signature.", 401);
  }

  if (request.headers.get("sanity-dataset") !== requireSanityConfig().dataset) {
    throw new SanityWebhookError("Invalid Sanity webhook signature.", 401);
  }

  const payload = sanityWebhookPayloadSchema.safeParse(body);

  if (!payload.success) {
    throw new SanityWebhookError("Invalid Sanity webhook payload.", 400);
  }

  return {
    documentId: payload.data?._id ?? null,
    documentType: payload.data?._type ?? null,
  };
}
