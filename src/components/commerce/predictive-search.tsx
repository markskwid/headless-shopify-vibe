"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageOpen, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { StorefrontProduct } from "@/lib/shopify/schemas/product";
import {
  predictiveSearchPayloadSchema,
  searchErrorPayloadSchema,
} from "@/lib/shopify/schemas/search";
import { formatMoney } from "@/lib/shopify/utils/format-money";

const SEARCH_DEBOUNCE_MS = 300;
const MINIMUM_QUERY_LENGTH = 2;

type SearchState =
  | { status: "idle"; products: [] }
  | { status: "loading"; products: [] }
  | { status: "success"; products: StorefrontProduct[] }
  | { status: "error"; products: []; message: string };

const initialSearchState: SearchState = { status: "idle", products: [] };

function ProductResult({
  product,
  onSelect,
}: {
  product: StorefrontProduct;
  onSelect: () => void;
}) {
  const price = product.priceRange.minVariantPrice;

  return (
    <li>
      <Link
        href={`/products/${product.handle}`}
        onClick={onSelect}
        className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-muted-foreground">
              <PackageOpen className="size-5" aria-hidden="true" />
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {product.title}
          </span>
          <span className="block text-xs text-muted-foreground">
            {product.availableForSale ? "Available" : "Sold out"}
          </span>
        </span>
        <span className="text-sm font-medium whitespace-nowrap">
          {formatMoney(price.amount, price.currencyCode)}
        </span>
      </Link>
    </li>
  );
}

export function PredictiveSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [state, setState] = useState<SearchState>(initialSearchState);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsId = useId();
  const normalizedQuery = query.trim();

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(normalizedQuery),
      SEARCH_DEBOUNCE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [normalizedQuery]);

  useEffect(() => {
    if (
      !open ||
      debouncedQuery !== normalizedQuery ||
      debouncedQuery.length < MINIMUM_QUERY_LENGTH
    ) {
      return;
    }

    const controller = new AbortController();

    async function loadResults() {
      setState({ status: "loading", products: [] });

      try {
        const response = await fetch(
          `/api/search/predictive?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const body: unknown = await response.json();

        if (!response.ok) {
          const error = searchErrorPayloadSchema.safeParse(body);
          throw new Error(
            error.success ? error.data.error : "Search is unavailable.",
          );
        }

        const payload = predictiveSearchPayloadSchema.safeParse(body);

        if (!payload.success) {
          throw new Error("Search returned an unexpected response.");
        }

        setState({ status: "success", products: payload.data.products });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          products: [],
          message:
            error instanceof Error
              ? error.message
              : "Search is temporarily unavailable.",
        });
      }
    }

    void loadResults();

    return () => controller.abort();
  }, [debouncedQuery, normalizedQuery, open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (normalizedQuery.length < MINIMUM_QUERY_LENGTH) {
      event.preventDefault();
      inputRef.current?.focus();
      return;
    }

    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full sm:size-10"
            aria-label="Search"
          />
        }
      >
        <Search aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="max-h-[min(90dvh,44rem)] gap-0 overflow-y-auto p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Search products</SheetTitle>
          <SheetDescription>
            Search the Shopify product catalog.
          </SheetDescription>
        </SheetHeader>
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
          <form
            action="/search"
            method="get"
            role="search"
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                name="q"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setState(initialSearchState);
                }}
                placeholder="Search products"
                autoComplete="off"
                enterKeyHint="search"
                aria-label="Search products"
                aria-controls={resultsId}
                className="h-12 w-full rounded-xl border bg-background pr-4 pl-12 text-base shadow-xs transition-shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-14 sm:text-lg"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              onClick={() => setOpen(false)}
              aria-label="Close search"
            >
              <X aria-hidden="true" />
            </Button>
          </form>

          <div
            id={resultsId}
            className="pt-4"
            aria-live="polite"
            aria-busy={state.status === "loading"}
          >
            {normalizedQuery.length < MINIMUM_QUERY_LENGTH ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Enter at least {MINIMUM_QUERY_LENGTH} characters to search.
              </p>
            ) : null}

            {state.status === "loading" ? (
              <div className="space-y-2 py-2" role="status">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-18 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                  />
                ))}
                <span className="sr-only">Loading search results</span>
              </div>
            ) : null}

            {state.status === "error" ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-5 text-center text-sm text-destructive">
                {state.message}
              </p>
            ) : null}

            {state.status === "success" && !state.products.length ? (
              <div className="rounded-xl border border-dashed px-4 py-8 text-center">
                <PackageOpen className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different product name or keyword.
                </p>
              </div>
            ) : null}

            {state.status === "success" && state.products.length ? (
              <>
                <ul className="space-y-1">
                  {state.products.map((product) => (
                    <ProductResult
                      key={product.id}
                      product={product}
                      onSelect={() => setOpen(false)}
                    />
                  ))}
                </ul>
                <Link
                  href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                  onClick={() => setOpen(false)}
                  className="mt-3 flex min-h-11 items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  View all results for “{debouncedQuery}”
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
