import type { MetadataRoute } from "next";

import { storefrontUrl } from "@/lib/seo/env";
import { getEditorialSitemapEntries } from "@/lib/sanity";
import { getShopifyConfig, getSitemapResources } from "@/lib/shopify";

export const revalidate = 3_600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: storefrontUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: storefrontUrl("/collections/all"),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const shopifyConfigured = getShopifyConfig().configured;
  const [editorialResult, productsResult, collectionsResult] =
    await Promise.allSettled([
      getEditorialSitemapEntries(),
      shopifyConfigured ? getSitemapResources("PRODUCT") : Promise.resolve([]),
      shopifyConfigured
        ? getSitemapResources("COLLECTION")
        : Promise.resolve([]),
    ]);

  if (editorialResult.status === "fulfilled") {
    entries.push(
      ...editorialResult.value.map((page) => ({
        url: storefrontUrl(`/${page.slug}`),
        lastModified: new Date(page._updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );
  }

  if (productsResult.status === "fulfilled") {
    entries.push(
      ...productsResult.value.map((product) => ({
        url: storefrontUrl(`/products/${product.handle}`),
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );
  }

  if (collectionsResult.status === "fulfilled") {
    entries.push(
      ...collectionsResult.value
        .filter((collection) => collection.handle !== "all")
        .map((collection) => ({
          url: storefrontUrl(`/collections/${collection.handle}`),
          lastModified: new Date(collection.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
    );
  }

  return entries;
}
