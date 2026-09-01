import type { Metadata } from "next";
import { connection } from "next/server";

import { JsonLd } from "@/components/seo/json-ld";
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
import { getSiteSeo, socialMetadata } from "@/lib/seo/metadata";
import { storefrontUrl } from "@/lib/seo/env";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();

  return {
    title: { absolute: seo.title },
    description: seo.description,
    ...socialMetadata({
      title: seo.title,
      description: seo.description,
      pathname: "/",
      image: seo.socialImage
        ? { ...seo.socialImage, altText: seo.socialImage.alt }
        : null,
    }),
  };
}

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

  const seo = await getSiteSeo();
  const homeUrl = storefrontUrl("/");

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: seo.siteName,
            url: homeUrl,
            ...(seo.logoUrl ? { logo: seo.logoUrl } : {}),
            ...(seo.socialProfiles.length ? { sameAs: seo.socialProfiles } : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: seo.siteName,
            url: homeUrl,
          },
        ]}
      />
      <ConnectedStorefront data={storefrontResult.value} banners={banners} />
    </>
  );
}
