import {
  CUSTOMER_ACCOUNT_FIELDS_FRAGMENT,
  CUSTOMER_FIELDS_FRAGMENT,
  CUSTOMER_ORDER_FIELDS_FRAGMENT,
  MAILING_ADDRESS_FIELDS_FRAGMENT,
} from "../fragments/customer";

export const CUSTOMER_QUERY = `#graphql
  query Customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      ...CustomerAccountFields
    }
  }
  ${CUSTOMER_ACCOUNT_FIELDS_FRAGMENT}
  ${CUSTOMER_FIELDS_FRAGMENT}
  ${MAILING_ADDRESS_FIELDS_FRAGMENT}
`;

export const CUSTOMER_NEWSLETTER_PROFILE_QUERY = `#graphql
  query CustomerNewsletterProfile($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      email
      acceptsMarketing
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders(
    $customerAccessToken: String!
    $first: Int!
    $after: String
  ) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(
        first: $first
        after: $after
        sortKey: PROCESSED_AT
        reverse: true
      ) {
        nodes {
          ...CustomerOrderFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${CUSTOMER_ORDER_FIELDS_FRAGMENT}
`;
