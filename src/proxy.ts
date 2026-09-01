import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const development = process.env.NODE_ENV === "development";
  const contentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""};
    style-src 'self'${development ? " 'unsafe-inline'" : ` 'nonce-${nonce}'`};
    style-src-attr 'unsafe-inline';
    img-src 'self' blob: data: https://cdn.shopify.com https://cdn.sanity.io;
    font-src 'self' data:;
    connect-src 'self'${development ? " ws: http:" : ""};
    media-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self';
    frame-ancestors 'self';
    manifest-src 'self';
    worker-src 'self' blob:;
    ${development ? "" : "upgrade-insecure-requests;"}
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|studio|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
