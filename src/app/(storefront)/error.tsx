"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function StorefrontRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-20 sm:px-8">
      <div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          The store took too long to respond
        </h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">
          We could not refresh these products from Shopify. Check your
          connection and try the request again.
        </p>
        <button
          type="button"
          onClick={reset}
          className={buttonVariants({ size: "lg", className: "mt-6" })}
        >
          <RotateCw data-icon="inline-start" />
          Try again
        </button>
      </div>
    </main>
  );
}
