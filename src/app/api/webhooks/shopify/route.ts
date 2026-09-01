import { revalidatePath, revalidateTag } from "next/cache";

import { getShopifyWebhookSecret } from "@/lib/shopify/env";
import {
  parseShopifyWebhook,
  ShopifyWebhookError,
} from "@/lib/shopify/services/webhook";

export const runtime = "nodejs";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let secret: string | undefined;

  try {
    secret = getShopifyWebhookSecret();
  } catch {
    return jsonResponse({ ok: false, error: "Webhook is not configured." }, 503);
  }

  if (!secret) {
    return jsonResponse({ ok: false, error: "Webhook is not configured." }, 503);
  }

  try {
    const event = await parseShopifyWebhook(request, secret);

    revalidateTag("shopify", { expire: 0 });
    revalidatePath("/sitemap.xml");

    return jsonResponse({
      ok: true,
      revalidated: "shopify",
      topic: event.topic,
    });
  } catch (error) {
    if (error instanceof ShopifyWebhookError) {
      return jsonResponse({ ok: false, error: error.message }, error.status);
    }

    return jsonResponse({ ok: false, error: "Webhook processing failed." }, 500);
  }
}
