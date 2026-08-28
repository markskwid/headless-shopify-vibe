import {
  CUSTOMER_FIELDS_FRAGMENT,
  CUSTOMER_USER_ERROR_FRAGMENT,
  MAILING_ADDRESS_FIELDS_FRAGMENT,
} from "../fragments/customer";

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `#graphql
  mutation CustomerAccessTokenCreate(
    $input: CustomerAccessTokenCreateInput!
  ) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        ...CustomerFields
      }
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${CUSTOMER_FIELDS_FRAGMENT}
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation CustomerUpdate(
    $customerAccessToken: String!
    $customer: CustomerUpdateInput!
  ) {
    customerUpdate(
      customerAccessToken: $customerAccessToken
      customer: $customer
    ) {
      customer {
        ...CustomerFields
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${CUSTOMER_FIELDS_FRAGMENT}
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = `#graphql
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `#graphql
  mutation CustomerAddressCreate(
    $customerAccessToken: String!
    $address: MailingAddressInput!
  ) {
    customerAddressCreate(
      customerAccessToken: $customerAccessToken
      address: $address
    ) {
      customerAddress {
        ...MailingAddressFields
      }
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${MAILING_ADDRESS_FIELDS_FRAGMENT}
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `#graphql
  mutation CustomerAddressUpdate(
    $customerAccessToken: String!
    $addressId: ID!
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(
      customerAccessToken: $customerAccessToken
      id: $addressId
      address: $address
    ) {
      customerAddress {
        ...MailingAddressFields
      }
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${MAILING_ADDRESS_FIELDS_FRAGMENT}
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_ADDRESS_DELETE_MUTATION = `#graphql
  mutation CustomerAddressDelete(
    $customerAccessToken: String!
    $addressId: ID!
  ) {
    customerAddressDelete(
      customerAccessToken: $customerAccessToken
      id: $addressId
    ) {
      deletedCustomerAddressId
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;

export const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `#graphql
  mutation CustomerDefaultAddressUpdate(
    $customerAccessToken: String!
    $addressId: ID!
  ) {
    customerDefaultAddressUpdate(
      customerAccessToken: $customerAccessToken
      addressId: $addressId
    ) {
      customer {
        defaultAddress {
          ...MailingAddressFields
        }
      }
      customerUserErrors {
        ...CustomerUserErrorFields
      }
    }
  }
  ${MAILING_ADDRESS_FIELDS_FRAGMENT}
  ${CUSTOMER_USER_ERROR_FRAGMENT}
`;
