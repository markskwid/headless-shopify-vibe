import {
  COLLECTION_CARD_FRAGMENT,
  PRODUCT_FILTER_FRAGMENT,
  PRODUCT_PAGE_INFO_FRAGMENT,
} from "../fragments/collection";
import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
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
    collection(handle: $handle) {
      ...CollectionCardFields
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
  ${COLLECTION_CARD_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_FILTER_FRAGMENT}
  ${PRODUCT_PAGE_INFO_FRAGMENT}
`;
