import { ProductBackLink } from "@/components/commerce/product-back-link";
import { ProductExperience } from "@/components/commerce/product-experience";
import { RelatedProductsCarousel } from "@/components/commerce/related-products-carousel";
import type {
  ProductDetails,
  StorefrontProduct,
} from "@/lib/shopify/schemas/product";

type ProductDetailProps = {
  product: ProductDetails;
  relatedProducts: StorefrontProduct[];
};

export function ProductDetail({
  product,
  relatedProducts,
}: ProductDetailProps) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-14">
      <ProductBackLink />

      <ProductExperience key={product.id} product={product} />
      <RelatedProductsCarousel
        key={`${product.id}:related`}
        products={relatedProducts}
      />
    </main>
  );
}
