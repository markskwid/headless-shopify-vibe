import { shopifyFetch } from "../client";
import { PREDICTIVE_PRODUCT_SEARCH_QUERY } from "../graphql/queries/predictive-search";
import { PRODUCT_BY_HANDLE_QUERY } from "../graphql/queries/product";
import { PRODUCT_RECOMMENDATIONS_QUERY } from "../graphql/queries/product-recommendations";
import { SEARCH_PRODUCTS_QUERY } from "../graphql/queries/search-products";
import {
  predictiveSearchInputSchema,
  predictiveSearchResponseSchema,
  productHandleSchema,
  productByHandleResponseSchema,
  productRecommendationsResponseSchema,
  searchProductsResponseSchema,
  searchQuerySchema,
} from "../schemas/search";

export async function getPredictiveProducts(input: unknown) {
  const { query, limit } = predictiveSearchInputSchema.parse(input);
  const response = await shopifyFetch({
    query: PREDICTIVE_PRODUCT_SEARCH_QUERY,
    schema: predictiveSearchResponseSchema,
    variables: { query, limit },
    revalidate: 60,
    tags: ["shopify-search"],
  });

  return { products: response.predictiveSearch?.products ?? [] };
}

export function searchProducts(input: unknown, first = 24) {
  const query = searchQuerySchema.parse(input);

  return shopifyFetch({
    query: SEARCH_PRODUCTS_QUERY,
    schema: searchProductsResponseSchema,
    variables: { query, first },
    revalidate: 60,
    tags: ["shopify-search"],
  });
}

export async function getProductByHandle(input: unknown) {
  const handle = productHandleSchema.parse(input);
  const response = await shopifyFetch({
    query: PRODUCT_BY_HANDLE_QUERY,
    schema: productByHandleResponseSchema,
    variables: { handle },
    revalidate: 300,
    tags: ["shopify-products", `shopify-product:${handle}`],
  });

  return response.product;
}

export async function getRelatedProducts(input: unknown) {
  const handle = productHandleSchema.parse(input);
  const response = await shopifyFetch({
    query: PRODUCT_RECOMMENDATIONS_QUERY,
    schema: productRecommendationsResponseSchema,
    variables: { handle },
    revalidate: 300,
    tags: [
      "shopify-product-recommendations",
      `shopify-product-recommendations:${handle}`,
    ],
  });

  return response.productRecommendations ?? [];
}
