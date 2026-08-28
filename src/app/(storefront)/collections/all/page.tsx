import type { Metadata } from "next";
import { connection } from "next/server";

import { CollectionBrowser } from "@/components/commerce/collection-browser";
import { getAllProducts } from "@/lib/shopify";
import { parseCollectionBrowseParams } from "@/lib/shopify/schemas/collection";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse, sort, and filter all products in the store.",
};

type AllProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AllProductsPage({
  searchParams,
}: AllProductsPageProps) {
  await connection();

  const browse = parseCollectionBrowseParams(await searchParams);
  const response = await getAllProducts(browse);

  return (
    <CollectionBrowser
      collection={{
        title: "All products",
        description: "Explore every product currently available in the store.",
        image: null,
      }}
      currencyCode={response.currencyCode}
      filters={response.products.filters}
      pathname="/collections/all"
      products={response.products.nodes}
      selectedFilters={browse.serializedFilters}
      selectedPriceRange={browse.selectedPriceRange}
      sort={browse.sort}
    />
  );
}
