import "server-only";

import type { Metadata } from "next";

import { getSeoSettings } from "@/lib/sanity";
import { getStorefrontIdentity, getShopifyConfig } from "@/lib/shopify";

import { getStorefrontBaseUrl } from "./env";

const FALLBACK_TITLE = "Headless Vibe";
const FALLBACK_DESCRIPTION =
  "A reusable Next.js starter for Shopify headless storefronts.";

export type SiteSeo = {
  title: string;
  description: string;
  siteName: string;
  logoUrl: string | null;
  socialImage: { url: string; width: number; height: number; alt: string } | null;
  socialProfiles: string[];
};

export async function getSiteSeo(): Promise<SiteSeo> {
  const shopifyConfigured = getShopifyConfig().configured;
  const [sanityResult, shopifyResult] = await Promise.allSettled([
    getSeoSettings(),
    shopifyConfigured ? getStorefrontIdentity() : Promise.resolve(null),
  ]);
  const sanity = sanityResult.status === "fulfilled" ? sanityResult.value : null;
  const shopify =
    shopifyResult.status === "fulfilled" ? shopifyResult.value?.shop : null;
  const siteName = sanity?.siteName || shopify?.name || FALLBACK_TITLE;

  return {
    title: sanity?.seo?.title || siteName,
    description:
      sanity?.seo?.description || shopify?.description || FALLBACK_DESCRIPTION,
    siteName,
    logoUrl: sanity?.logo?.url ?? null,
    socialImage: sanity?.seo?.socialImage ?? null,
    socialProfiles: sanity?.socialProfiles ?? [],
  };
}

export function socialMetadata({
  title,
  description,
  pathname,
  image,
}: {
  title: string;
  description?: string | null;
  pathname: string;
  image?: { url: string; width?: number | null; height?: number | null; altText?: string | null } | null;
}): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const summary = description || undefined;
  const images = image
    ? [
        {
          url: image.url,
          ...(image.width ? { width: image.width } : {}),
          ...(image.height ? { height: image.height } : {}),
          alt: image.altText || title,
        },
      ]
    : undefined;

  return {
    alternates: { canonical: pathname },
    openGraph: {
      type: "website",
      url: pathname,
      title,
      description: summary,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description: summary,
      images: images?.map(({ url, alt }) => ({ url, alt })),
    },
  };
}

export function rootMetadata(seo: SiteSeo): Metadata {
  const image = seo.socialImage
    ? {
        url: seo.socialImage.url,
        width: seo.socialImage.width,
        height: seo.socialImage.height,
        altText: seo.socialImage.alt,
      }
    : null;

  return {
    metadataBase: new URL(getStorefrontBaseUrl()),
    title: { default: seo.title, template: `%s | ${seo.siteName}` },
    description: seo.description,
    applicationName: seo.siteName,
    openGraph: {
      type: "website",
      siteName: seo.siteName,
      title: seo.title,
      description: seo.description,
      images: image
        ? [{ url: image.url, width: image.width, height: image.height, alt: image.altText }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      images: image ? [{ url: image.url, alt: image.altText }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}
