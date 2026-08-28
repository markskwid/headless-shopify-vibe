import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($handle: String!) {
    productRecommendations(productHandle: $handle, intent: RELATED) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
