import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getPredictiveProducts, ShopifyRequestError } from "@/lib/shopify";
import { predictiveSearchInputSchema } from "@/lib/shopify/schemas/search";

export async function GET(request: NextRequest) {
  const input = predictiveSearchInputSchema.safeParse({
    query: request.nextUrl.searchParams.get("q"),
    limit: 6,
  });

  if (!input.success) {
    return NextResponse.json(
      { error: z.prettifyError(input.error) },
      { status: 400 },
    );
  }

  try {
    const results = await getPredictiveProducts(input.data);
    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof ShopifyRequestError
        ? "Shopify search is temporarily unavailable."
        : "Search is temporarily unavailable.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
