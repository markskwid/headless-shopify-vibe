import { shopifyFetch } from "../client";
import { SITEMAP_RESOURCES_QUERY } from "../graphql/queries/sitemap";
import {
  sitemapResourceTypeSchema,
  sitemapResponseSchema,
  type SitemapResource,
} from "../schemas/sitemap";

const MAX_SITEMAP_PAGES = 10_000;

export async function getSitemapResources(input: unknown) {
  const type = sitemapResourceTypeSchema.parse(input);
  const resources = new Map<string, SitemapResource>();
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= MAX_SITEMAP_PAGES) {
    const response = await shopifyFetch({
      query: SITEMAP_RESOURCES_QUERY,
      schema: sitemapResponseSchema,
      variables: { type, page },
      revalidate: 3_600,
      tags: ["shopify-sitemap", `shopify-sitemap:${type.toLowerCase()}`],
    });

    hasNextPage = response.sitemap.resources.hasNextPage;

    for (const resource of response.sitemap.resources.items) {
      resources.set(resource.handle, resource);
    }

    page += 1;
  }

  return [...resources.values()];
}
