import Image from "next/image";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StorefrontProduct } from "@/lib/shopify/schemas/product";
import { formatMoney } from "@/lib/shopify/utils/format-money";

type ProductCardProps = {
  eager?: boolean;
  product: StorefrontProduct;
};

export function ProductCard({ eager = false, product }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice;
  const trackingParameters = product.trackingParameters?.replace(/^\?/, "");
  const href = `/products/${product.handle}${
    trackingParameters ? `?${trackingParameters}` : ""
  }`;

  return (
    <Link
      href={href}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 py-0 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <PackageOpen className="size-8" aria-hidden="true" />
            </div>
          )}
          <Badge
            variant={product.availableForSale ? "secondary" : "outline"}
            className="absolute top-3 left-3 bg-background/85 backdrop-blur"
          >
            {product.availableForSale ? "Available" : "Sold out"}
          </Badge>
        </div>
        <CardHeader className="gap-2 py-5">
          <CardTitle className="line-clamp-2">{product.title}</CardTitle>
          <CardDescription>
            From {formatMoney(price.amount, price.currencyCode)}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
