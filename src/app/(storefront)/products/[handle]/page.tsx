import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/commerce/product-detail";
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
    return product
      ? { title: product.title, description: product.description || undefined }
      : {};
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

  return (
    <ProductDetail product={product} relatedProducts={relatedProducts} />
  );
}
