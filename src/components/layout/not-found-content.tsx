import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.93_0.06_151_/_0.65),transparent_38%),radial-gradient(circle_at_bottom_right,oklch(0.95_0.05_77_/_0.55),transparent_34%)]" />
      <div className="mx-auto w-full max-w-3xl text-center">
        <p
          className="text-[clamp(6rem,22vw,13rem)] leading-none font-semibold tracking-[-0.08em] text-foreground/8 select-none"
          aria-hidden="true"
        >
          404
        </p>
        <div className="relative -mt-8 rounded-3xl border bg-background/95 p-7 shadow-xl shadow-foreground/5 backdrop-blur sm:-mt-14 sm:p-12">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Page not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            We couldn&apos;t find that page.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            The link may be outdated, or the page may have moved. Return to the
            storefront or continue browsing all products.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonVariants({ size: "lg" })}>
              <ArrowLeft aria-hidden="true" />
              Back to home
            </Link>
            <Link
              href="/collections/all"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <ShoppingBag aria-hidden="true" />
              Shop all products
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
