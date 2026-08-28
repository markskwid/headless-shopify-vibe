import type { Metadata } from "next";

import {
  SearchPrompt,
  SearchResults,
  SearchResultsError,
} from "@/components/commerce/search-results";
import { searchProducts } from "@/lib/shopify";
import { searchPageParamsSchema } from "@/lib/shopify/schemas/search";

export const metadata: Metadata = {
  title: "Search",
  robots: "noindex, follow",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = searchPageParamsSchema.parse(await searchParams);

  if (!query) return <SearchPrompt />;
  if (query.length < 2) return <SearchPrompt invalid />;

  let results;

  try {
    results = await searchProducts(query);
  } catch {
    return <SearchResultsError />;
  }

  return (
    <SearchResults
      query={query}
      products={results.search.nodes}
      totalCount={results.search.totalCount}
    />
  );
}
