import type { NextRequest } from "next/server";

import { locationQuerySchema } from "@/lib/locations/schemas";
import {
  getLocationCountries,
  getLocationStates,
} from "@/lib/locations/services";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestSecurityContextFromHeaders } from "@/lib/security/request";

export const runtime = "nodejs";

const cacheHeaders = {
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

export async function GET(request: NextRequest) {
  const requestContext = getRequestSecurityContextFromHeaders(request.headers);
  const rateLimit = await checkRateLimit(
    "locations-ip",
    requestContext.clientKey,
  );

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many location requests. Wait a moment and try again." },
      {
        status: 429,
        headers: { "Cache-Control": "no-store", "Retry-After": "60" },
      },
    );
  }

  const parsed = locationQuerySchema.safeParse({
    level: request.nextUrl.searchParams.get("level"),
    country: request.nextUrl.searchParams.get("country") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid location request." },
      { status: 400 },
    );
  }

  try {
    if (parsed.data.level === "countries") {
      return Response.json(
        { countries: await getLocationCountries() },
        { headers: cacheHeaders },
      );
    }

    return Response.json(
      { states: await getLocationStates(parsed.data.country) },
      { headers: cacheHeaders },
    );
  } catch {
    return Response.json(
      { error: "Location options are temporarily unavailable." },
      { status: 503 },
    );
  }
}
