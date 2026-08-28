import {
  COLLECTION_CARD_FRAGMENT,
  PRODUCT_FILTER_FRAGMENT,
} from "../fragments/collection";
import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $first: Int!
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
  ${COLLECTION_CARD_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_FILTER_FRAGMENT}
`;
