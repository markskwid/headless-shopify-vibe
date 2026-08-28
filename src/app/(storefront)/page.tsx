import { connection } from "next/server";

import {
  ConnectedStorefront,
  SetupStorefront,
  StorefrontError,
} from "@/components/storefront/storefront";
import { getHomePageBanners } from "@/lib/sanity";
import {
  getShopifyConfig,
  getStorefrontHome,
  ShopifyRequestError,
} from "@/lib/shopify";

export default async function Home() {
  await connection();

  const configuration = getShopifyConfig();

  if (!configuration.configured) {
    return <SetupStorefront issues={configuration.issues} />;
  }

  const [storefrontResult, bannersResult] = await Promise.allSettled([
    getStorefrontHome(),
    getHomePageBanners(),
  ]);

  if (storefrontResult.status === "rejected") {
    const error = storefrontResult.reason;
    const message =
      error instanceof ShopifyRequestError
        ? error.message
        : "An unexpected error occurred while loading Shopify.";

    return <StorefrontError message={message} />;
  }

  const banners =
    bannersResult.status === "fulfilled" ? bannersResult.value : [];

  return <ConnectedStorefront data={storefrontResult.value} banners={banners} />;
}
