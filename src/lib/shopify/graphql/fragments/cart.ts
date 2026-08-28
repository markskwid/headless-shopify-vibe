export const CART_FRAGMENT = `#graphql
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    discountCodes {
      code
      applicable
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 250) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity {
            amount
            currencyCode
          }
          compareAtAmountPerQuantity {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        discountAllocations(lineLevelOnly: false) {
          discountedAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            image {
              id
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
`;
