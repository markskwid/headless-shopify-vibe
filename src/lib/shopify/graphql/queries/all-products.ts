import {
  PRODUCT_FILTER_FRAGMENT,
  PRODUCT_PAGE_INFO_FRAGMENT,
} from "../fragments/collection";
import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $first: Int
    $last: Int
    $after: String
    $before: String
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
        last: $last
        after: $after
        before: $before
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
        pageInfo {
          ...ProductPageInfoFields
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_FILTER_FRAGMENT}
  ${PRODUCT_PAGE_INFO_FRAGMENT}
`;
