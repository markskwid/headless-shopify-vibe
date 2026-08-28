import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const PREDICTIVE_PRODUCT_SEARCH_QUERY = `#graphql
  query PredictiveProductSearch($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT]) {
      products {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
