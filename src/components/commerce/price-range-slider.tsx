"use client";

import { useMemo, useState } from "react";

import type { ProductFilterPriceRange } from "@/lib/shopify/schemas/collection";
import { formatMoney } from "@/lib/shopify/utils/format-money";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function toCurrencyPrecision(value: number) {
  return Math.round(value * 100) / 100;
}

export function PriceRangeSlider({
  currencyCode,
  idPrefix,
  initialRange,
  lowerBound,
  upperBound,
}: {
  currencyCode: string;
  idPrefix: string;
  initialRange: ProductFilterPriceRange | null;
  lowerBound: number;
  upperBound: number;
}) {
  const initialMinimum = clamp(
    initialRange?.min ?? lowerBound,
    lowerBound,
    upperBound,
  );
  const initialMaximum = clamp(
    initialRange?.max ?? upperBound,
    initialMinimum,
    upperBound,
  );
  const [minimum, setMinimum] = useState(initialMinimum);
  const [maximum, setMaximum] = useState(initialMaximum);

  const span = upperBound - lowerBound;
  const minimumPosition = span ? ((minimum - lowerBound) / span) * 100 : 0;
  const maximumPosition = span ? ((maximum - lowerBound) / span) * 100 : 100;
  const isActive = minimum > lowerBound || maximum < upperBound;
  const serializedFilter = useMemo(
    () =>
      JSON.stringify({
        price: {
          min: toCurrencyPrecision(minimum),
          max: toCurrencyPrecision(maximum),
        },
      }),
    [maximum, minimum],
  );
  const rangeClassName =
    "pointer-events-none absolute inset-x-0 top-2 h-1 w-full appearance-none bg-transparent outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-foreground [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-sm";

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="filter"
        value={serializedFilter}
        disabled={!isActive}
      />
      <div className="flex items-center justify-between gap-3 text-sm tabular-nums">
        <output htmlFor={`${idPrefix}-minimum`}>
          {formatMoney(minimum, currencyCode)}
        </output>
        <span className="text-muted-foreground" aria-hidden="true">
          –
        </span>
        <output htmlFor={`${idPrefix}-maximum`}>
          {formatMoney(maximum, currencyCode)}
        </output>
      </div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-muted" />
        <div
          className="absolute top-2 h-1 rounded-full bg-foreground"
          style={{
            left: `${minimumPosition}%`,
            right: `${100 - maximumPosition}%`,
          }}
        />
        <input
          id={`${idPrefix}-minimum`}
          type="range"
          min={lowerBound}
          max={upperBound}
          step="0.01"
          value={minimum}
          aria-label="Minimum price"
          aria-valuetext={formatMoney(minimum, currencyCode)}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maximum);
            setMinimum(toCurrencyPrecision(value));
          }}
          className={rangeClassName}
          style={{ zIndex: minimum >= maximum - span * 0.05 ? 3 : 2 }}
        />
        <input
          id={`${idPrefix}-maximum`}
          type="range"
          min={lowerBound}
          max={upperBound}
          step="0.01"
          value={maximum}
          aria-label="Maximum price"
          aria-valuetext={formatMoney(maximum, currencyCode)}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minimum);
            setMaximum(toCurrencyPrecision(value));
          }}
          className={rangeClassName}
          style={{ zIndex: 2 }}
        />
      </div>
      {isActive ? (
        <button
          type="button"
          onClick={() => {
            setMinimum(lowerBound);
            setMaximum(upperBound);
          }}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Reset price
        </button>
      ) : null}
    </div>
  );
}
