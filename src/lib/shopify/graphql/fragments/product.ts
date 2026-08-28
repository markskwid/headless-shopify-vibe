export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCardFields on Product {
    id
    handle
    title
    availableForSale
    trackingParameters
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;
