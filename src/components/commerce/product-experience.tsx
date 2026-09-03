"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/commerce/cart-provider";
import type {
  ProductDetails,
  ProductImage,
  ProductVariant,
} from "@/lib/shopify/schemas/product";
import { formatMoney } from "@/lib/shopify/utils/format-money";
import { cn } from "@/lib/utils";

function variantMatches(
  variant: ProductVariant,
  selections: Record<string, string>,
) {
  return variant.selectedOptions.every(
    (option) => selections[option.name] === option.value,
  );
}

function mergeProductImages(
  product: ProductDetails,
  preferredImageId: string | undefined,
) {
  const images = new Map<string, ProductImage>();

  product.images.nodes.forEach((image) => images.set(image.id, image));
  product.variants.nodes.forEach((variant) => {
    if (variant.image) images.set(variant.image.id, variant.image);
  });

  const mergedImages = [...images.values()];

  if (!preferredImageId) return mergedImages;

  return mergedImages.sort((firstImage, secondImage) => {
    if (firstImage.id === preferredImageId) return -1;
    if (secondImage.id === preferredImageId) return 1;
    return 0;
  });
}

export function ProductExperience({ product }: { product: ProductDetails }) {
  const { addItem, isPending: cartPending } = useCart();
  const initialVariant =
    product.variants.nodes.find((variant) => variant.availableForSale) ??
    product.variants.nodes[0];
  const galleryImages = useMemo(
    () => mergeProductImages(product, initialVariant?.image?.id),
    [initialVariant?.image?.id, product],
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      initialVariant?.selectedOptions.map((option) => [
        option.name,
        option.value,
      ]) ?? [],
    ),
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryRef, galleryApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });
  const selectedVariant =
    product.variants.nodes.find((variant) =>
      variantMatches(variant, selectedOptions),
    ) ?? initialVariant;
  const visibleOptions = product.options.filter(
    (option) =>
      !(
        option.name === "Title" &&
        option.optionValues.length === 1 &&
        option.optionValues[0]?.name === "Default Title"
      ),
  );
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  useEffect(() => {
    if (!galleryApi) return;

    const updateSelectedImage = () => {
      setActiveImageIndex(galleryApi.selectedScrollSnap());
    };

    updateSelectedImage();
    galleryApi.on("select", updateSelectedImage);
    galleryApi.on("reInit", updateSelectedImage);

    return () => {
      galleryApi.off("select", updateSelectedImage);
      galleryApi.off("reInit", updateSelectedImage);
    };
  }, [galleryApi]);

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function showImage(index: number) {
    const nextIndex = Math.min(
      Math.max(index, 0),
      Math.max(galleryImages.length - 1, 0),
    );

    setActiveImageIndex(nextIndex);
    galleryApi?.scrollTo(nextIndex, prefersReducedMotion());
  }

  function selectOption(optionName: string, value: string) {
    const nextSelections = { ...selectedOptions, [optionName]: value };
    const nextVariant = product.variants.nodes.find((variant) =>
      variantMatches(variant, nextSelections),
    );

    setSelectedOptions(nextSelections);

    if (nextVariant?.image) {
      const imageIndex = galleryImages.findIndex(
        (image) => image.id === nextVariant.image?.id,
      );

      if (imageIndex >= 0) showImage(imageIndex);
    }
  }

  function optionValueExists(optionName: string, value: string) {
    const nextSelections = { ...selectedOptions, [optionName]: value };

    return product.variants.nodes.some((variant) =>
      variantMatches(variant, nextSelections),
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:gap-16">
      <div className="min-w-0">
        <div className="relative overflow-hidden rounded-2xl bg-secondary">
          {galleryImages.length ? (
            <div
              ref={galleryRef}
              className="aspect-square cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
              role="region"
              aria-label="Product image gallery"
              aria-roledescription="carousel"
            >
              <div className="flex h-full">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative min-w-0 flex-[0_0_100%]"
                    role="group"
                    aria-label={`Image ${index + 1} of ${galleryImages.length}`}
                    aria-roledescription="slide"
                  >
                    <Image
                      src={image.url}
                      alt={image.altText ?? `${product.title} image ${index + 1}`}
                      fill
                      draggable={false}
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="pointer-events-none select-none object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid aspect-square place-items-center text-muted-foreground">
              <ImageIcon className="size-12" aria-hidden="true" />
            </div>
          )}

          {galleryImages.length > 1 ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center sm:left-5">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-lg"
                  className="pointer-events-auto rounded-full bg-background/85 shadow-sm backdrop-blur active:translate-y-0! disabled:opacity-35"
                  onClick={() => showImage(activeImageIndex - 1)}
                  disabled={activeImageIndex === 0}
                  aria-label="Previous product image"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center sm:right-5">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-lg"
                  className="pointer-events-auto rounded-full bg-background/85 shadow-sm backdrop-blur active:translate-y-0! disabled:opacity-35"
                  onClick={() => showImage(activeImageIndex + 1)}
                  disabled={activeImageIndex === galleryImages.length - 1}
                  aria-label="Next product image"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
              <span className="absolute right-3 bottom-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur sm:right-5 sm:bottom-5">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            </>
          ) : null}
        </div>

        {galleryImages.length > 1 ? (
          <div
            className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Product image thumbnails"
          >
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => showImage(index)}
                aria-label={`Show product image ${index + 1}`}
                aria-current={index === activeImageIndex ? "true" : undefined}
                className={cn(
                  "relative aspect-square w-18 shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-secondary transition-[border-color,opacity,transform,box-shadow] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-22",
                  index === activeImageIndex
                    ? "scale-100 border-foreground opacity-100 shadow-sm"
                    : "scale-[0.96] border-transparent opacity-60 hover:scale-100 hover:opacity-100",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="self-start lg:sticky lg:top-[calc(var(--site-header-height)+2rem)]">
        {product.vendor ? (
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {product.vendor}
          </p>
        ) : null}
        <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-6xl">
          {product.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-xl font-semibold">
            {formatMoney(price.amount, price.currencyCode)}
          </p>
          {compareAtPrice && Number(compareAtPrice.amount) > Number(price.amount) ? (
            <p className="text-base text-muted-foreground line-through">
              {formatMoney(compareAtPrice.amount, compareAtPrice.currencyCode)}
            </p>
          ) : null}
          <Badge
            variant={selectedVariant?.availableForSale ? "secondary" : "outline"}
          >
            {selectedVariant?.availableForSale ? "In stock" : "Sold out"}
          </Badge>
        </div>

        {visibleOptions.length ? (
          <div className="mt-8 space-y-6">
            {visibleOptions.map((option) => (
              <fieldset key={option.id}>
                <legend className="text-sm font-medium">{option.name}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {option.optionValues.map(({ name: value }) => {
                    const selected = selectedOptions[option.name] === value;
                    const exists = optionValueExists(option.name, value);

                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!exists}
                        onClick={() => selectOption(option.name, value)}
                        aria-pressed={selected}
                        className={cn(
                          "min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-35",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "bg-background hover:bg-muted",
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          className="mt-8 h-12 w-full text-base"
          disabled={!selectedVariant?.availableForSale || cartPending}
          onClick={() => {
            if (selectedVariant) void addItem(selectedVariant.id);
          }}
        >
          {cartPending
            ? "Adding…"
            : selectedVariant?.availableForSale
              ? "Add to cart"
              : "Sold out"}
        </Button>

        {product.description ? (
          <div className="mt-9 border-t pt-7">
            <h2 className="text-sm font-semibold">Product details</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
