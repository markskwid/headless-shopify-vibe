import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CollectionBrowser } from "@/components/commerce/collection-browser";
import { JsonLd } from "@/components/seo/json-ld";
import { storefrontUrl } from "@/lib/seo/env";
import { socialMetadata } from "@/lib/seo/metadata";
import { getCollection } from "@/lib/shopify";
import {
  collectionHandleSchema,
  parseCollectionBrowseParams,
} from "@/lib/shopify/schemas/collection";

type CollectionPageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const parsedHandle = collectionHandleSchema.safeParse((await params).handle);

  if (!parsedHandle.success) return {};

  try {
    const collection = await getCollection({ handle: parsedHandle.data });

    if (!collection) return {};

    const title = collection.seo.title || collection.title;
    const description = collection.seo.description || collection.description;

    return {
      title,
      description: description || undefined,
      ...socialMetadata({
        title,
        description,
        pathname: `/collections/${collection.handle}`,
        image: collection.image,
      }),
    };
  } catch {
    return {};
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  await connection();

  const parsedHandle = collectionHandleSchema.safeParse((await params).handle);

  if (!parsedHandle.success) notFound();

  const browse = parseCollectionBrowseParams(await searchParams);
  const collection = await getCollection({
    after: browse.after,
    before: browse.before,
    handle: parsedHandle.data,
    filters: browse.filters,
    sort: browse.sort,
  });

  if (!collection) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: storefrontUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: collection.title,
              item: storefrontUrl(`/collections/${collection.handle}`),
            },
          ],
        }}
      />
      <CollectionBrowser
        collection={collection}
        currencyCode={collection.currencyCode}
        filters={collection.products.filters}
        pageInfo={collection.products.pageInfo}
        pathname={`/collections/${collection.handle}`}
        products={collection.products.nodes}
        selectedFilters={browse.serializedFilters}
        selectedPriceRange={browse.selectedPriceRange}
        sort={browse.sort}
      />
    </>
  );
}
