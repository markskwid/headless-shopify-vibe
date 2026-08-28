import { COLLECTION_CARD_FRAGMENT } from "../fragments/collection";
import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const STOREFRONT_HOME_QUERY = `#graphql
  query StorefrontHome($first: Int!, $collectionCount: Int!) {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductCardFields
      }
    }
    collections(
      first: $collectionCount
      sortKey: UPDATED_AT
      reverse: true
    ) {
      nodes {
        ...CollectionCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${COLLECTION_CARD_FRAGMENT}
`;
