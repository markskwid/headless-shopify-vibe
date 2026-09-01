import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/commerce/product-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { storefrontUrl } from "@/lib/seo/env";
import { socialMetadata } from "@/lib/seo/metadata";
import { getProductByHandle, getRelatedProducts } from "@/lib/shopify";
import { productPageParamsSchema } from "@/lib/shopify/schemas/search";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const parsed = productPageParamsSchema.safeParse(await params);

  if (!parsed.success) return {};

  try {
    const product = await getProductByHandle(parsed.data.handle);
    if (!product) return {};

    const title = product.seo.title || product.title;
    const description = product.seo.description || product.description;
    const pathname = `/products/${product.handle}`;

    return {
      title,
      description: description || undefined,
      ...socialMetadata({
        title,
        description,
        pathname,
        image: product.featuredImage,
      }),
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const parsed = productPageParamsSchema.safeParse(await params);

  if (!parsed.success) notFound();

  const [productResult, relatedResult] = await Promise.allSettled([
    getProductByHandle(parsed.data.handle),
    getRelatedProducts(parsed.data.handle),
  ]);

  if (productResult.status === "rejected") throw productResult.reason;

  const product = productResult.value;

  if (!product) notFound();

  const relatedProducts =
    relatedResult.status === "fulfilled" ? relatedResult.value : [];

  const productUrl = storefrontUrl(`/products/${product.handle}`);
  const productImages = product.images.nodes.map((image) => image.url);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: productImages,
    url: productUrl,
    ...(product.vendor
      ? { brand: { "@type": "Brand", name: product.vendor } }
      : {}),
    ...(product.productType ? { category: product.productType } : {}),
    offers: product.variants.nodes.map((variant) => ({
      "@type": "Offer",
      url: productUrl,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(variant.sku ? { sku: variant.sku } : {}),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          productJsonLd,
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: storefrontUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "All products",
                item: storefrontUrl("/collections/all"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.title,
                item: productUrl,
              },
            ],
          },
        ]}
      />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </>
  );
}
