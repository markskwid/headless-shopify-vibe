import type { Metadata } from "next";
import { connection } from "next/server";

import { CollectionBrowser } from "@/components/commerce/collection-browser";
import { JsonLd } from "@/components/seo/json-ld";
import { storefrontUrl } from "@/lib/seo/env";
import { getAllProducts } from "@/lib/shopify";
import { parseCollectionBrowseParams } from "@/lib/shopify/schemas/collection";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse, sort, and filter all products in the store.",
  alternates: { canonical: "/collections/all" },
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
              name: "All products",
              item: storefrontUrl("/collections/all"),
            },
          ],
        }}
      />
      <CollectionBrowser
        collection={{
          title: "All products",
          description: "Explore every product currently available in the store.",
          image: null,
        }}
        currencyCode={response.currencyCode}
        filters={response.products.filters}
        pageInfo={response.products.pageInfo}
        pathname="/collections/all"
        products={response.products.nodes}
        selectedFilters={browse.serializedFilters}
        selectedPriceRange={browse.selectedPriceRange}
        sort={browse.sort}
      />
    </>
  );
}
