import type { NextConfig } from "next";

function serverActionAllowedOrigins() {
  const value = process.env.SERVER_ACTION_ALLOWED_ORIGINS;
  if (!value?.trim()) return [];

  return value.split(",").map((origin) => {
    const candidate = origin.trim().toLowerCase();

    if (!/^(?:\*\.)?[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d{1,5})?$/.test(candidate)) {
      throw new Error(
        "SERVER_ACTION_ALLOWED_ORIGINS must contain comma-separated hostnames without a protocol or path.",
      );
    }

    return candidate;
  });
}

const allowedOrigins = serverActionAllowedOrigins();
const productionOnlyHeaders =
  process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@countrystatecity/countries"],
  experimental: {
    serverActions: {
      bodySizeLimit: "64kb",
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-XSS-Protection", value: "0" },
          ...productionOnlyHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
