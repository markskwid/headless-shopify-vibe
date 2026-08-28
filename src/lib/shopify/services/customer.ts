import { shopifyFetch } from "../client";
import {
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_DELETE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_RECOVER_MUTATION,
  CUSTOMER_UPDATE_MUTATION,
} from "../graphql/mutations/customer";
import {
  CUSTOMER_NEWSLETTER_PROFILE_QUERY,
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_QUERY,
} from "../graphql/queries/customer";
import {
  customerAddressCreateResponseSchema,
  customerAddressDeleteResponseSchema,
  customerAddressIdSchema,
  customerAddressInputSchema,
  customerAddressUpdateResponseSchema,
  customerAccessTokenCreateResponseSchema,
  customerAccessTokenDeleteResponseSchema,
  customerAccessTokenSchema,
  customerCreateResponseSchema,
  customerDetailsUpdateInputSchema,
  customerDefaultAddressUpdateResponseSchema,
  customerEmailSchema,
  customerLoginInputSchema,
  customerMarketingSubscriptionInputSchema,
  customerNewsletterProfileResponseSchema,
  customerOrdersResponseSchema,
  customerRecoverResponseSchema,
  customerRegistrationInputSchema,
  customerResponseSchema,
  customerSchema,
  customerUpdateResponseSchema,
  type CustomerAddressInput,
  type CustomerDetailsUpdateInput,
  type CustomerRegistrationInput,
} from "../schemas/customer";

type CustomerUserError = {
  message: string;
};

export class ShopifyCustomerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyCustomerError";
  }
}

function throwCustomerErrors(
  errors: CustomerUserError[],
  fallback: string,
): never {
  if (errors.length) {
    throw new ShopifyCustomerError(errors.map((error) => error.message).join(" "));
  }

  throw new ShopifyCustomerError(fallback);
}

export async function loginCustomer(input: unknown, buyerIp?: string) {
  const credentials = customerLoginInputSchema.parse(input);
  const response = await shopifyFetch({
    query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
    schema: customerAccessTokenCreateResponseSchema,
    variables: { input: credentials },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerAccessTokenCreate;

  if (!payload?.customerAccessToken) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The email or password is incorrect.",
    );
  }

  return customerAccessTokenSchema.parse(payload.customerAccessToken);
}

export async function registerCustomer(input: unknown, buyerIp?: string) {
  const customer = customerRegistrationInputSchema.parse(input);
  const response = await shopifyFetch({
    query: CUSTOMER_CREATE_MUTATION,
    schema: customerCreateResponseSchema,
    variables: { input: customer satisfies CustomerRegistrationInput },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerCreate;

  if (!payload?.customer) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The customer account could not be created.",
    );
  }

  return payload.customer;
}

export async function updateCustomerDetails(
  customerAccessTokenInput: unknown,
  input: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const customer = customerDetailsUpdateInputSchema.parse(input);
  const response = await shopifyFetch({
    query: CUSTOMER_UPDATE_MUTATION,
    schema: customerUpdateResponseSchema,
    variables: {
      customerAccessToken,
      customer: customer satisfies CustomerDetailsUpdateInput,
    },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerUpdate;

  if (!payload?.customer) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The customer details could not be updated.",
    );
  }

  return {
    customer: payload.customer,
    customerAccessToken: payload.customerAccessToken,
  };
}

export async function subscribeCustomerToEmailMarketing(
  customerAccessTokenInput: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const customer = customerMarketingSubscriptionInputSchema.parse({
    acceptsMarketing: true,
  });
  const response = await shopifyFetch({
    query: CUSTOMER_UPDATE_MUTATION,
    schema: customerUpdateResponseSchema,
    variables: { customerAccessToken, customer },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerUpdate;

  if (!payload?.customer) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The Shopify email-marketing preference could not be updated.",
    );
  }

  return payload.customer;
}

export async function recoverCustomer(input: unknown, buyerIp?: string) {
  const email = customerEmailSchema.parse(input);
  const response = await shopifyFetch({
    query: CUSTOMER_RECOVER_MUTATION,
    schema: customerRecoverResponseSchema,
    variables: { email },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerRecover;

  if (!payload) {
    throw new ShopifyCustomerError(
      "The recovery request could not be completed.",
    );
  }

  if (payload.customerUserErrors.length) {
    throw new ShopifyCustomerError(
      payload.customerUserErrors.map((error) => error.message).join(" "),
    );
  }
}

export async function getCustomerNewsletterProfile(
  customerAccessTokenInput: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const response = await shopifyFetch({
    query: CUSTOMER_NEWSLETTER_PROFILE_QUERY,
    schema: customerNewsletterProfileResponseSchema,
    variables: { customerAccessToken },
    revalidate: false,
    buyerIp,
  });

  return response.customer;
}

export async function getCustomer(
  customerAccessToken: unknown,
  buyerIp?: string,
) {
  const token = customerAccessTokenSchema.shape.accessToken.parse(
    customerAccessToken,
  );
  const [profileResponse, firstOrdersResponse] = await Promise.all([
    shopifyFetch({
      query: CUSTOMER_QUERY,
      schema: customerResponseSchema,
      variables: { customerAccessToken: token },
      revalidate: false,
      buyerIp,
    }),
    shopifyFetch({
      query: CUSTOMER_ORDERS_QUERY,
      schema: customerOrdersResponseSchema,
      variables: { customerAccessToken: token, first: 100, after: null },
      revalidate: false,
      buyerIp,
    }),
  ]);

  if (!profileResponse.customer || !firstOrdersResponse.customer) return null;

  const orders = [...firstOrdersResponse.customer.orders.nodes];
  let pageInfo = firstOrdersResponse.customer.orders.pageInfo;
  const visitedCursors = new Set<string>();

  while (pageInfo.hasNextPage) {
    const after = pageInfo.endCursor;

    if (!after || visitedCursors.has(after)) {
      throw new ShopifyCustomerError(
        "Shopify returned an invalid customer order cursor.",
      );
    }

    visitedCursors.add(after);
    const nextResponse = await shopifyFetch({
      query: CUSTOMER_ORDERS_QUERY,
      schema: customerOrdersResponseSchema,
      variables: { customerAccessToken: token, first: 100, after },
      revalidate: false,
      buyerIp,
    });

    if (!nextResponse.customer) return null;

    orders.push(...nextResponse.customer.orders.nodes);
    pageInfo = nextResponse.customer.orders.pageInfo;
  }

  return customerSchema.parse({
    ...profileResponse.customer,
    orders: { nodes: orders },
  });
}

export async function createCustomerAddress(
  customerAccessTokenInput: unknown,
  addressInput: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const address = customerAddressInputSchema.parse(addressInput);
  const response = await shopifyFetch({
    query: CUSTOMER_ADDRESS_CREATE_MUTATION,
    schema: customerAddressCreateResponseSchema,
    variables: {
      customerAccessToken,
      address: address satisfies CustomerAddressInput,
    },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerAddressCreate;

  if (!payload?.customerAddress) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The address could not be added.",
    );
  }

  return payload.customerAddress;
}

export async function updateCustomerAddress(
  customerAccessTokenInput: unknown,
  addressIdInput: unknown,
  addressInput: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const addressId = customerAddressIdSchema.parse(addressIdInput);
  const address = customerAddressInputSchema.parse(addressInput);
  const response = await shopifyFetch({
    query: CUSTOMER_ADDRESS_UPDATE_MUTATION,
    schema: customerAddressUpdateResponseSchema,
    variables: {
      customerAccessToken,
      addressId,
      address: address satisfies CustomerAddressInput,
    },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerAddressUpdate;

  if (!payload?.customerAddress) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The address could not be updated.",
    );
  }

  return payload.customerAddress;
}

export async function deleteCustomerAddress(
  customerAccessTokenInput: unknown,
  addressIdInput: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const addressId = customerAddressIdSchema.parse(addressIdInput);
  const response = await shopifyFetch({
    query: CUSTOMER_ADDRESS_DELETE_MUTATION,
    schema: customerAddressDeleteResponseSchema,
    variables: { customerAccessToken, addressId },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerAddressDelete;

  if (!payload?.deletedCustomerAddressId) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The address could not be deleted.",
    );
  }

  return payload.deletedCustomerAddressId;
}

export async function setDefaultCustomerAddress(
  customerAccessTokenInput: unknown,
  addressIdInput: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput);
  const addressId = customerAddressIdSchema.parse(addressIdInput);
  const response = await shopifyFetch({
    query: CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
    schema: customerDefaultAddressUpdateResponseSchema,
    variables: { customerAccessToken, addressId },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerDefaultAddressUpdate;

  if (!payload?.customer?.defaultAddress) {
    throwCustomerErrors(
      payload?.customerUserErrors ?? [],
      "The default address could not be updated.",
    );
  }

  return payload.customer.defaultAddress;
}

export async function deleteCustomerAccessToken(
  input: unknown,
  buyerIp?: string,
) {
  const customerAccessToken =
    customerAccessTokenSchema.shape.accessToken.parse(input);
  const response = await shopifyFetch({
    query: CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
    schema: customerAccessTokenDeleteResponseSchema,
    variables: { customerAccessToken },
    revalidate: false,
    buyerIp,
  });
  const payload = response.customerAccessTokenDelete;

  if (payload?.userErrors.length) {
    throw new ShopifyCustomerError(
      payload.userErrors.map((error) => error.message).join(" "),
    );
  }
}
