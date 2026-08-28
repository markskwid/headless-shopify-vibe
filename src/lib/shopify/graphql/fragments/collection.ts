export const COLLECTION_CARD_FRAGMENT = `#graphql
  fragment CollectionCardFields on Collection {
    id
    handle
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
`;

export const PRODUCT_FILTER_FRAGMENT = `#graphql
  fragment ProductFilterFields on Filter {
    id
    label
    type
    values {
      id
      label
      count
      input
    }
  }
`;
