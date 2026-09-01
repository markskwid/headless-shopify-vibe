import type { MetadataRoute } from "next";

import { getStorefrontBaseUrl, storefrontUrl } from "@/lib/seo/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/account/",
        "/api/",
        "/cart",
        "/login",
        "/register",
        "/search",
        "/studio",
      ],
    },
    sitemap: storefrontUrl("/sitemap.xml"),
    host: getStorefrontBaseUrl(),
  };
}
