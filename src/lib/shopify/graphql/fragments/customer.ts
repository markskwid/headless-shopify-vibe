export const CUSTOMER_FIELDS_FRAGMENT = `#graphql
  fragment CustomerFields on Customer {
    id
    firstName
    lastName
    email
    phone
    acceptsMarketing
  }
`;

export const MAILING_ADDRESS_FIELDS_FRAGMENT = `#graphql
  fragment MailingAddressFields on MailingAddress {
    id
    firstName
    lastName
    company
    address1
    address2
    city
    province
    country
    zip
    phone
    formatted
  }
`;

export const CUSTOMER_ACCOUNT_FIELDS_FRAGMENT = `#graphql
  fragment CustomerAccountFields on Customer {
    ...CustomerFields
    defaultAddress {
      ...MailingAddressFields
    }
    addresses(first: 250) {
      nodes {
        ...MailingAddressFields
      }
    }
  }
`;

export const CUSTOMER_ORDER_FIELDS_FRAGMENT = `#graphql
  fragment CustomerOrderFields on Order {
    id
    orderNumber
    processedAt
    financialStatus
    fulfillmentStatus
    currentTotalPrice {
      amount
      currencyCode
    }
    totalPrice {
      amount
      currencyCode
    }
    totalRefunded {
      amount
      currencyCode
    }
    lineItems(first: 250) {
      nodes {
        title
        discountedTotalPrice {
          amount
          currencyCode
        }
        variant {
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    statusUrl
  }
`;

export const CUSTOMER_USER_ERROR_FRAGMENT = `#graphql
  fragment CustomerUserErrorFields on CustomerUserError {
    code
    field
    message
  }
`;
