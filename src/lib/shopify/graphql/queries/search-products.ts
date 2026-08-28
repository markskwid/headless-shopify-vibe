import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const SEARCH_PRODUCTS_QUERY = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    search(
      query: $query
      first: $first
      prefix: LAST
      types: [PRODUCT]
    ) {
      totalCount
      nodes {
        __typename
        ... on Product {
          ...ProductCardFields
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
