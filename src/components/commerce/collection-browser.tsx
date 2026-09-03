import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { ProductCard } from "@/components/commerce/product-card";
import { CollectionSortSelect } from "@/components/commerce/collection-sort-select";
import { PriceRangeSlider } from "@/components/commerce/price-range-slider";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  CollectionCardData,
  CollectionSortValue,
  ProductFilterPriceRange,
  ProductPageInfo,
  ShopifyProductFilter,
  StorefrontProduct,
} from "@/lib/shopify";
import {
  collectionSortOptions,
  getProductFilterPriceRange,
  serializeProductFilter,
} from "@/lib/shopify/schemas/collection";
import { cn } from "@/lib/utils";

type CollectionBrowserProps = {
  collection: Pick<CollectionCardData, "title" | "description" | "image">;
  currencyCode: string;
  filters: ShopifyProductFilter[];
  pageInfo: ProductPageInfo;
  pathname: string;
  products: StorefrontProduct[];
  selectedFilters: string[];
  selectedPriceRange: ProductFilterPriceRange | null;
  sort: CollectionSortValue;
};

function collectionPageHref({
  cursor,
  direction,
  pathname,
  selectedFilters,
  sort,
}: {
  cursor: string;
  direction: "after" | "before";
  pathname: string;
  selectedFilters: string[];
  sort: CollectionSortValue;
}) {
  const params = new URLSearchParams({ sort });

  selectedFilters.forEach((filter) => params.append("filter", filter));
  params.set(direction, cursor);

  return `${pathname}?${params.toString()}`;
}

function CollectionPagination({
  pageInfo,
  pathname,
  selectedFilters,
  sort,
}: Pick<
  CollectionBrowserProps,
  "pageInfo" | "pathname" | "selectedFilters" | "sort"
>) {
  const previousCursor = pageInfo.hasPreviousPage
    ? pageInfo.startCursor
    : null;
  const nextCursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;

  if (!previousCursor && !nextCursor) return null;

  return (
    <nav
      className="mt-10 flex items-center justify-between gap-4 border-t pt-6"
      aria-label="Collection pagination"
    >
      {previousCursor ? (
        <Link
          href={collectionPageHref({
            cursor: previousCursor,
            direction: "before",
            pathname,
            selectedFilters,
            sort,
          })}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <ChevronLeft data-icon="inline-start" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <span className="hidden text-sm text-muted-foreground sm:inline">
        Browse more products
      </span>

      {nextCursor ? (
        <Link
          href={collectionPageHref({
            cursor: nextCursor,
            direction: "after",
            pathname,
            selectedFilters,
            sort,
          })}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Next
          <ChevronRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}

type FilterFormProps = Pick<
  CollectionBrowserProps,
  | "currencyCode"
  | "filters"
  | "pathname"
  | "selectedFilters"
  | "selectedPriceRange"
  | "sort"
> & {
  idPrefix: string;
};

function FilterForm({
  currencyCode,
  filters,
  idPrefix,
  pathname,
  selectedFilters,
  selectedPriceRange,
  sort,
}: FilterFormProps) {
  const selected = new Set(selectedFilters);

  return (
    <form action={pathname} method="get" className="space-y-7">
      <input type="hidden" name="sort" value={sort} />

      {filters.length ? (
        filters.map((filter) => {
          const availablePriceRange = filter.values
            .map((value) => getProductFilterPriceRange(value.input))
            .find((priceRange) => priceRange?.max !== undefined);

          return (
            <fieldset key={filter.id} className="space-y-3">
              <legend className="font-medium">{filter.label}</legend>
              {filter.type === "PRICE_RANGE" &&
              availablePriceRange?.max !== undefined ? (
                <PriceRangeSlider
                  key={`${idPrefix}-${availablePriceRange.min ?? 0}-${availablePriceRange.max}-${selectedPriceRange?.min ?? "minimum"}-${selectedPriceRange?.max ?? "maximum"}`}
                  currencyCode={currencyCode}
                  idPrefix={`${idPrefix}-${filter.id}`}
                  initialRange={selectedPriceRange}
                  lowerBound={availablePriceRange.min ?? 0}
                  upperBound={availablePriceRange.max}
                />
              ) : (
                <div className="space-y-2.5">
                  {filter.values.map((value) => {
                    const serialized = serializeProductFilter(value.input);
                    const checked = selected.has(serialized);
                    const inputId = `${idPrefix}-${filter.id}-${value.id}`;

                    return (
                      <label
                        key={value.id}
                        htmlFor={inputId}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 text-sm",
                          value.count === 0 &&
                            !checked &&
                            "cursor-not-allowed text-muted-foreground/60",
                        )}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          name="filter"
                          value={serialized}
                          defaultChecked={checked}
                          disabled={value.count === 0 && !checked}
                          className="size-4 rounded border-input accent-foreground"
                        />
                        <span className="min-w-0 flex-1">{value.label}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {value.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          );
        })
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          No storefront filters are enabled. Configure filters in Shopify Search
          &amp; Discovery to make them available here.
        </p>
      )}

      {filters.length ? (
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Apply filters
        </button>
      ) : null}
    </form>
  );
}

export function CollectionBrowser({
  collection,
  currencyCode,
  filters,
  pageInfo,
  pathname,
  products,
  selectedFilters,
  selectedPriceRange,
  sort,
}: CollectionBrowserProps) {
  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <header className="grid overflow-hidden rounded-2xl bg-secondary/70 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Collection
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {collection.title}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
            {collection.description ||
              `Browse products from the ${collection.title} collection.`}
          </p>
        </div>
        <div className="relative min-h-64 lg:min-h-80">
          <Image
            src={collection.image?.url ?? "/collection-placeholder.svg"}
            alt={collection.image?.altText ?? `${collection.title} collection`}
            fill
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover"
          />
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-4 border-b border-foreground/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Products
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
            {pageInfo.hasNextPage || pageInfo.hasPreviousPage
              ? " on this page"
              : ""}
          </p>
        </div>
        <CollectionSortSelect
          key={sort}
          options={collectionSortOptions}
          pathname={pathname}
          selectedFilters={selectedFilters}
          value={sort}
        />
      </div>

      <details className="mt-5 rounded-xl border bg-card p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
            {hasActiveFilters ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {selectedFilters.length}
              </span>
            ) : null}
          </span>
          {hasActiveFilters ? (
            <Link
              href={pathname}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" aria-hidden="true" />
              Clear
            </Link>
          ) : null}
        </summary>
        <div className="mt-6 border-t pt-5">
          <FilterForm
            currencyCode={currencyCode}
            filters={filters}
            idPrefix="mobile"
            pathname={pathname}
            selectedFilters={selectedFilters}
            selectedPriceRange={selectedPriceRange}
            sort={sort}
          />
        </div>
      </details>

      <div className="mt-7 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--site-header-height)+2rem)] rounded-xl border bg-card p-5">
            <div className="mb-6 flex items-center justify-between gap-3 border-b pb-4">
              <h2 className="flex items-center gap-2 font-medium">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
              </h2>
              {hasActiveFilters ? (
                <Link
                  href={pathname}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear all
                </Link>
              ) : null}
            </div>
            <FilterForm
              currencyCode={currencyCode}
              filters={filters}
              idPrefix="desktop"
              pathname={pathname}
              selectedFilters={selectedFilters}
              selectedPriceRange={selectedPriceRange}
              sort={sort}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="h-fit border-dashed py-16 text-center">
              <CardContent>
                <PackageOpen className="mx-auto size-7 text-muted-foreground" />
                <p className="mt-4 font-medium">
                  {hasActiveFilters
                    ? "No products match these filters."
                    : "No products are available yet."}
                </p>
                {hasActiveFilters ? (
                  <Link
                    href={pathname}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mt-5",
                    )}
                  >
                    Clear filters
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          )}

          <CollectionPagination
            pageInfo={pageInfo}
            pathname={pathname}
            selectedFilters={selectedFilters}
            sort={sort}
          />
        </div>
      </div>
    </main>
  );
}
