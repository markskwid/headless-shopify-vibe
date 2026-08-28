import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@countrystatecity/countries"],
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
};

export default nextConfig;
