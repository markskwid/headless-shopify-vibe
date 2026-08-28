import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CollectionCardData } from "@/lib/shopify";

export function CollectionCard({
  collection,
  eager = false,
}: {
  collection: CollectionCardData;
  eager?: boolean;
}) {
  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 py-0 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={collection.image?.url ?? "/collection-placeholder.svg"}
            alt={collection.image?.altText ?? `${collection.title} collection`}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
          />
        </div>
        <CardHeader className="gap-2 py-5">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg">{collection.title}</CardTitle>
            <ArrowUpRight
              className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </div>
          <CardDescription className="line-clamp-3 leading-6">
            {collection.description ||
              `Explore products from the ${collection.title} collection.`}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
