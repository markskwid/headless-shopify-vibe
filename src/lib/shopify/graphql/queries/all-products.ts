import { PRODUCT_FILTER_FRAGMENT } from "../fragments/collection";
import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $first: Int!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean!
  ) {
    paymentSettings {
      currencyCode
    }
    collection(handle: "all") {
      unfilteredProducts: products(first: 1) {
        filters {
          ...ProductFilterFields
        }
      }
      products(
        first: $first
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          ...ProductCardFields
        }
        filters {
          ...ProductFilterFields
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_FILTER_FRAGMENT}
`;
