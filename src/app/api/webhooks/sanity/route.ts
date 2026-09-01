import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { getSanityWebhookSecret } from "@/lib/sanity/env";
import {
  parseSanityWebhook,
  SanityWebhookError,
} from "@/lib/sanity/services/webhook";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  let secret: string | undefined;

  try {
    secret = getSanityWebhookSecret();
  } catch {
    return jsonResponse({ ok: false, error: "Webhook is not configured." }, 503);
  }

  if (!secret) {
    return jsonResponse({ ok: false, error: "Webhook is not configured." }, 503);
  }

  try {
    const event = await parseSanityWebhook(request, secret);

    revalidateTag("sanity", { expire: 0 });

    return jsonResponse({
      ok: true,
      revalidated: "sanity",
      documentType: event.documentType,
    });
  } catch (error) {
    if (error instanceof SanityWebhookError) {
      return jsonResponse({ ok: false, error: error.message }, error.status);
    }

    return jsonResponse({ ok: false, error: "Webhook processing failed." }, 500);
  }
}
