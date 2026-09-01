import { NextResponse, type NextRequest } from "next/server";

import { getPredictiveProducts, ShopifyRequestError } from "@/lib/shopify";
import { predictiveSearchInputSchema } from "@/lib/shopify/schemas/search";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestSecurityContextFromHeaders } from "@/lib/security/request";

const privateResponseHeaders = {
  "Cache-Control": "private, no-store",
};

export async function GET(request: NextRequest) {
  const requestContext = getRequestSecurityContextFromHeaders(request.headers);
  const rateLimit = await checkRateLimit("search-ip", requestContext.clientKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many search requests. Wait a moment and try again." },
      {
        status: 429,
        headers: { ...privateResponseHeaders, "Retry-After": "60" },
      },
    );
  }

  const input = predictiveSearchInputSchema.safeParse({
    query: request.nextUrl.searchParams.get("q"),
    limit: 6,
  });

  if (!input.success) {
    return NextResponse.json(
      { error: "Enter a valid search query." },
      { status: 400, headers: privateResponseHeaders },
    );
  }

  try {
    const results = await getPredictiveProducts(input.data);
    return NextResponse.json(results, { headers: privateResponseHeaders });
  } catch (error) {
    const message =
      error instanceof ShopifyRequestError
        ? "Shopify search is temporarily unavailable."
        : "Search is temporarily unavailable.";

    return NextResponse.json(
      { error: message },
      { status: 502, headers: privateResponseHeaders },
    );
  }
}
