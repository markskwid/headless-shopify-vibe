import "server-only";

import { sanityFetch } from "../client";
import { getSanityConfig } from "../env";
import {
  EDITORIAL_PAGE_QUERY,
  EDITORIAL_SITEMAP_QUERY,
} from "../queries/editorial-page";
import {
  editorialPageSchema,
  editorialPageSlugSchema,
  editorialSitemapSchema,
} from "../schemas/editorial-page";

export async function getEditorialPage(slug: string) {
  if (!getSanityConfig().configured) return null;

  const parsedSlug = editorialPageSlugSchema.parse(slug);

  return sanityFetch({
    query: EDITORIAL_PAGE_QUERY,
    params: { slug: parsedSlug },
    schema: editorialPageSchema,
    revalidate: 300,
    tags: ["sanity-editorial-pages", `sanity-editorial-page:${parsedSlug}`],
  });
}

export async function getEditorialSitemapEntries() {
  if (!getSanityConfig().configured) return [];

  return sanityFetch({
    query: EDITORIAL_SITEMAP_QUERY,
    schema: editorialSitemapSchema,
    revalidate: 3_600,
    tags: ["sanity-editorial-pages"],
  });
}
