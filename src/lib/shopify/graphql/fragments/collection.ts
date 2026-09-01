export const COLLECTION_CARD_FRAGMENT = `#graphql
  fragment CollectionCardFields on Collection {
    id
    handle
    title
    description
    seo {
      title
      description
    }
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

export const PRODUCT_PAGE_INFO_FRAGMENT = `#graphql
  fragment ProductPageInfoFields on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;
