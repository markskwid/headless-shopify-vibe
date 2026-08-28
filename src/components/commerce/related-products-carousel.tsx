"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/commerce/product-card";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct } from "@/lib/shopify/schemas/product";
import { cn } from "@/lib/utils";

export function RelatedProductsCarousel({
  products,
}: {
  products: StorefrontProduct[];
}) {
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const desktopStatic = products.length <= 4;
  const [carouselRef, carouselApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    breakpoints: desktopStatic
      ? {
          "(min-width: 1024px)": { active: false },
        }
      : undefined,
  });

  useEffect(() => {
    if (!carouselApi) return;

    const updateScrollControls = () => {
      setCanScrollBack(carouselApi.canScrollPrev());
      setCanScrollForward(carouselApi.canScrollNext());
    };

    updateScrollControls();
    carouselApi.on("select", updateScrollControls);
    carouselApi.on("reInit", updateScrollControls);

    return () => {
      carouselApi.off("select", updateScrollControls);
      carouselApi.off("reInit", updateScrollControls);
    };
  }, [carouselApi]);

  if (!products.length) return null;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return (
    <section
      className="mt-20 border-t pt-12 sm:mt-28 sm:pt-16"
      aria-labelledby="related-products-title"
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Keep exploring
          </p>
          <h2
            id="related-products-title"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            You may also like
          </h2>
        </div>

        {products.length > 1 ? (
          <div className={cn("flex gap-2", desktopStatic && "lg:hidden")}>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="rounded-full"
              onClick={() => carouselApi?.scrollPrev(prefersReducedMotion())}
              disabled={!canScrollBack}
              aria-label="Previous related products"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="rounded-full"
              onClick={() => carouselApi?.scrollNext(prefersReducedMotion())}
              disabled={!canScrollForward}
              aria-label="Next related products"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        ref={carouselRef}
        className={cn(
          "mt-7 cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing",
          desktopStatic && "lg:cursor-auto lg:overflow-visible",
        )}
        role="region"
        aria-label="Related products"
        aria-roledescription="carousel"
      >
        <ul
          className={cn(
            "flex gap-4 pb-2 sm:gap-5",
            desktopStatic && "lg:grid lg:grid-cols-4",
          )}
        >
          {products.map((product, index) => (
            <li
              key={product.id}
              className={cn(
                "min-w-0 flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_calc((100%-3.75rem)/4)]",
                desktopStatic && "lg:block",
              )}
              aria-label={`Related product ${index + 1} of ${products.length}`}
              aria-roledescription="slide"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
