import { PackageOpen, SearchX } from "lucide-react";

import { ProductCard } from "@/components/commerce/product-card";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { StorefrontProduct } from "@/lib/shopify/schemas/product";

type SearchResultsProps = {
  query: string;
  products: StorefrontProduct[];
  totalCount: number;
};

export function SearchResults({
  query,
  products,
  totalCount,
}: SearchResultsProps) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Product search
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
        Results for “{query}”
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "product" : "products"} found
      </p>

      {products.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              eager={index < 4}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-10 border-dashed py-14 text-center">
          <CardContent>
            <PackageOpen className="mx-auto size-8 text-muted-foreground" />
            <CardTitle className="mt-4">No products found</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different product name or a broader keyword.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

export function SearchPrompt({ invalid = false }: { invalid?: boolean }) {
  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 place-items-center px-5 py-20 sm:px-8">
      <div className="text-center">
        <SearchX className="mx-auto size-9 text-muted-foreground" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {invalid ? "Search term is too short" : "Search the catalog"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {invalid
            ? "Enter at least 2 characters to find matching products."
            : "Use the search icon in the header to find products by name or keyword."}
        </p>
      </div>
    </main>
  );
}

export function SearchResultsError() {
  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 place-items-center px-5 py-20 sm:px-8">
      <Card className="w-full border-destructive/20 text-center">
        <CardContent className="py-8">
          <SearchX className="mx-auto size-8 text-destructive" />
          <CardTitle className="mt-4">Search is unavailable</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Shopify could not return results. Please try again in a moment.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
