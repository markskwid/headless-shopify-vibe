import { CART_FRAGMENT } from "../fragments/cart";

export const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_NOTE_UPDATE_MUTATION = `#graphql
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_DISCOUNT_CODES_UPDATE_MUTATION = `#graphql
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(
      cartId: $cartId
      discountCodes: $discountCodes
    ) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `#graphql
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(
      cartId: $cartId
      buyerIdentity: $buyerIdentity
    ) {
      cart { ...CartFields }
      userErrors { code field message }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;
