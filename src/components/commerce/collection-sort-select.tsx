"use client";

import { useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CollectionSortValue } from "@/lib/shopify";

type SortOption = {
  label: string;
  value: CollectionSortValue;
};

const subscribeToHydration = () => () => {};

export function CollectionSortSelect({
  options,
  pathname,
  selectedFilters,
  value,
}: {
  options: readonly SortOption[];
  pathname: string;
  selectedFilters: string[];
  value: CollectionSortValue;
}) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [isPending, startTransition] = useTransition();

  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      Sort by
      <select
        name="sort"
        defaultValue={value}
        disabled={!isHydrated || isPending}
        aria-busy={!isHydrated || isPending}
        onChange={(event) => {
          const nextSort = event.target.value as CollectionSortValue;
          const params = new URLSearchParams({ sort: nextSort });

          selectedFilters.forEach((filter) => params.append("filter", filter));
          startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
          });
        }}
        className="h-9 min-w-48 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/30 disabled:cursor-wait disabled:opacity-70"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="sr-only" aria-live="polite">
        {isPending ? "Updating product order" : ""}
      </span>
    </label>
  );
}
