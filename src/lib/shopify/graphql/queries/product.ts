import { PRODUCT_CARD_FRAGMENT } from "../fragments/product";

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductCardFields
      description
      vendor
      productType
      seo {
        title
        description
      }
      images(first: 250) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      options {
        id
        name
        optionValues {
          name
        }
      }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          sku
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
