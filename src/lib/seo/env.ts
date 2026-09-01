import "server-only";

import { z } from "zod";

const storefrontUrlSchema = z
  .url("STOREFRONT_BASE_URL must be a valid absolute URL.")
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost";
  }, "STOREFRONT_BASE_URL must use HTTPS (HTTP is allowed only for localhost).")
  .transform((value) => value.replace(/\/+$/, ""));

export function getStorefrontBaseUrl() {
  const configured = process.env.STOREFRONT_BASE_URL?.trim();
  const platformUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const candidate = configured
    ? configured
    : platformUrl
      ? `https://${platformUrl.replace(/^https?:\/\//i, "")}`
      : "http://localhost:3000";

  return storefrontUrlSchema.parse(candidate);
}

export function storefrontUrl(pathname = "/") {
  return new URL(pathname, `${getStorefrontBaseUrl()}/`).toString();
}
