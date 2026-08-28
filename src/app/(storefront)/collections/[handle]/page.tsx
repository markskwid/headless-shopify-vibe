import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CollectionBrowser } from "@/components/commerce/collection-browser";
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

    return collection
      ? {
          title: collection.title,
          description: collection.description || undefined,
        }
      : {};
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
    handle: parsedHandle.data,
    filters: browse.filters,
    sort: browse.sort,
  });

  if (!collection) notFound();

  return (
    <CollectionBrowser
      collection={collection}
      currencyCode={collection.currencyCode}
      filters={collection.products.filters}
      pathname={`/collections/${collection.handle}`}
      products={collection.products.nodes}
      selectedFilters={browse.serializedFilters}
      selectedPriceRange={browse.selectedPriceRange}
      sort={browse.sort}
    />
  );
}
