"use client";

import { useEffect, useState } from "react";
import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { HomePageBannerSlide } from "@/lib/sanity";
import { cn } from "@/lib/utils";

function ctaTarget(openInNewTab: boolean) {
  return openInNewTab
    ? { target: "_blank" as const, rel: "noreferrer" }
    : {};
}

function bannerImageLoader(
  { src, width, quality }: ImageLoaderProps,
  sourceWidth: number,
) {
  const url = new URL(src);

  url.searchParams.set("w", String(Math.min(width, sourceWidth)));
  url.searchParams.set("q", String(quality ?? 85));
  url.searchParams.set("auto", "format");

  return url.toString();
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HomePageBannerCarousel({
  banners,
}: {
  banners: HomePageBannerSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselRef, carouselApi] = useEmblaCarousel({
    align: "start",
    loop: banners.length > 1,
  });

  useEffect(() => {
    if (!carouselApi) return;

    const updateActiveBanner = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    updateActiveBanner();
    carouselApi.on("select", updateActiveBanner);
    carouselApi.on("reInit", updateActiveBanner);

    return () => {
      carouselApi.off("select", updateActiveBanner);
      carouselApi.off("reInit", updateActiveBanner);
    };
  }, [carouselApi]);

  function showBanner(index: number) {
    carouselApi?.scrollTo(index, prefersReducedMotion());
  }

  return (
    <section
      className="relative isolate overflow-hidden"
      aria-label="Homepage banners"
      aria-roledescription="carousel"
    >
      <div
        ref={carouselRef}
        className="cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
      >
        <div className="flex">
          {banners.map((banner, index) => {
            const Heading = index === 0 ? "h1" : "h2";
            const titleId = `homepage-banner-${banner._key}`;

            return (
              <article
                key={banner._key}
                className="relative isolate flex min-h-[28rem] min-w-0 flex-[0_0_100%] items-end overflow-hidden sm:min-h-[34rem] lg:min-h-[38rem]"
                role="group"
                aria-labelledby={titleId}
                aria-roledescription="slide"
              >
                <Image
                  loader={(loaderProps) =>
                    bannerImageLoader(loaderProps, banner.image.sourceWidth)
                  }
                  src={banner.image.url}
                  alt={banner.image.alt}
                  fill
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  sizes="100vw"
                  placeholder={banner.image.lqip ? "blur" : "empty"}
                  blurDataURL={banner.image.lqip ?? undefined}
                  className="pointer-events-none -z-20 select-none object-cover"
                  style={{ objectPosition: banner.image.objectPosition }}
                />
                <div
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/10"
                  aria-hidden="true"
                />
                <div className="mx-auto w-full max-w-7xl px-5 py-16 text-white sm:px-20 sm:py-20 lg:px-24 lg:py-24">
                  <div className="max-w-3xl">
                    <Heading
                      id={titleId}
                      className="text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance drop-shadow-sm sm:text-6xl lg:text-7xl"
                    >
                      {banner.title}
                    </Heading>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 drop-shadow-sm sm:text-lg">
                      {banner.description}
                    </p>
                    {banner.cta ? (
                      <Link
                        href={banner.cta.href}
                        className={cn(
                          buttonVariants({ size: "lg" }),
                          "mt-7 h-11 bg-white px-4 text-black hover:bg-white/90",
                        )}
                        {...ctaTarget(banner.cta.openInNewTab)}
                      >
                        {banner.cta.label}
                        <ArrowRight
                          data-icon="inline-end"
                          aria-hidden="true"
                        />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {banners.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-5 z-20 hidden items-center sm:flex">
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="pointer-events-auto rounded-full bg-background/85 shadow-sm backdrop-blur hover:bg-background active:translate-y-0!"
              onClick={() => carouselApi?.scrollPrev(prefersReducedMotion())}
              aria-label="Previous homepage banner"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-5 z-20 hidden items-center sm:flex">
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="pointer-events-auto rounded-full bg-background/85 shadow-sm backdrop-blur hover:bg-background active:translate-y-0!"
              onClick={() => carouselApi?.scrollNext(prefersReducedMotion())}
              aria-label="Next homepage banner"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center sm:bottom-5">
            <div className="flex items-center rounded-full bg-black/35 p-1 backdrop-blur-sm">
              {banners.map((banner, index) => (
                <button
                  key={banner._key}
                  type="button"
                  className="grid size-9 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  onClick={() => showBanner(index)}
                  aria-label={`Show banner ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "block size-2 rounded-full bg-white transition-[width,opacity] duration-300 motion-reduce:transition-none",
                      index === activeIndex
                        ? "w-6 opacity-100"
                        : "opacity-55 hover:opacity-100",
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            Showing banner {activeIndex + 1} of {banners.length}
          </p>
        </>
      ) : null}
    </section>
  );
}
