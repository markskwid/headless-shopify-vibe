import { CART_FRAGMENT } from "../fragments/cart";

export const CART_QUERY = `#graphql
  query Cart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;
