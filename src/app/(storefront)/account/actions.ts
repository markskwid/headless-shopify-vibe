"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createCustomerAddress,
  deleteCustomerAddress,
  deleteCustomerAccessToken,
  loginCustomer,
  recoverCustomer,
  registerCustomer,
  setDefaultCustomerAddress,
  ShopifyCustomerError,
  updateCustomerAddress,
  updateCustomerDetails,
} from "@/lib/shopify/services/customer";
import { updateCartBuyerIdentity } from "@/lib/shopify/services/cart";
import { getCartIdFromCookies } from "@/lib/shopify/services/cart-session";
import {
  clearCustomerSessionCookie,
  getCustomerAccessTokenFromCookies,
  isCustomerSessionRemembered,
  setCustomerSessionCookie,
} from "@/lib/shopify/services/customer-session";
import {
  customerAddressInputSchema,
  customerAddressIdSchema,
  customerEmailSchema,
  customerDetailsUpdateInputSchema,
  customerLoginInputSchema,
  customerRegistrationInputSchema,
} from "@/lib/shopify/schemas/customer";
import {
  LocationInputError,
  normalizeAddressLocation,
} from "@/lib/locations/services";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { getRequestSecurityContext } from "@/lib/security/request";

export type AccountActionState = {
  message: string | null;
  fieldErrors: Record<string, string[] | undefined>;
  success: boolean;
};

function validationFailure(error: z.ZodError): AccountActionState {
  return {
    message: "Review the highlighted fields and try again.",
    fieldErrors: z.flattenError(error).fieldErrors,
    success: false,
  };
}

function actionFailure(
  error: unknown,
  fallback: string,
): AccountActionState {
  return {
    message: error instanceof ShopifyCustomerError ? error.message : fallback,
    fieldErrors: {},
    success: false,
  };
}

async function synchronizeCartCustomer(
  customerAccessToken: string | null,
  buyerIp?: string,
) {
  const cartId = await getCartIdFromCookies();

  if (!cartId) return;

  try {
    await updateCartBuyerIdentity(cartId, customerAccessToken, buyerIp);
  } catch {
    // A stale or temporarily unavailable cart must not block account access.
  }
}

function rateLimitFailure(): AccountActionState {
  return {
    message: "Too many requests. Wait a while and try again.",
    fieldErrors: {},
    success: false,
  };
}

async function checkAuthenticationRateLimit(
  kind: "login" | "recover" | "register",
  email: string,
) {
  const context = await getRequestSecurityContext();
  const result = await checkRateLimits([
    { policy: `auth-${kind}-ip`, identifier: context.clientKey },
    { policy: `auth-${kind}-account`, identifier: email },
  ]);

  return { context, allowed: result.allowed };
}

async function checkAccountWriteRateLimit(customerAccessToken: string) {
  const context = await getRequestSecurityContext();
  const result = await checkRateLimits([
    { policy: "account-write", identifier: context.clientKey },
    {
      policy: "account-write",
      identifier: `customer:${customerAccessToken}`,
    },
  ]);

  return { context, allowed: result.allowed };
}

export async function loginCustomerAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = customerLoginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  let token;

  try {
    const rateLimit = await checkAuthenticationRateLimit(
      "login",
      parsed.data.email,
    );
    if (!rateLimit.allowed) return rateLimitFailure();

    token = await loginCustomer(parsed.data, rateLimit.context.buyerIp);
    await setCustomerSessionCookie(token, formData.get("remember") === "on");
    await synchronizeCartCustomer(token.accessToken, rateLimit.context.buyerIp);
  } catch (error) {
    return {
      message:
        error instanceof ShopifyCustomerError
          ? "The email or password is incorrect."
          : "Sign in is temporarily unavailable.",
      fieldErrors: {},
      success: false,
    };
  }

  redirect("/account");
}

const registrationFormSchema = customerRegistrationInputSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function registerCustomerAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const phoneValue = formData.get("phone");
  const parsed = registrationFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone:
      typeof phoneValue === "string" && phoneValue.trim()
        ? phoneValue
        : undefined,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
  });

  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const rateLimit = await checkAuthenticationRateLimit(
      "register",
      parsed.data.email,
    );
    if (!rateLimit.allowed) return rateLimitFailure();

    const { confirmPassword: _confirmPassword, ...customer } = parsed.data;
    void _confirmPassword;
    await registerCustomer(customer, rateLimit.context.buyerIp);
  } catch (error) {
    return {
      message:
        error instanceof ShopifyCustomerError
          ? "The account could not be created with those details."
          : "Account creation is temporarily unavailable. Please try again.",
      fieldErrors: {},
      success: false,
    };
  }

  redirect("/account/login?registered=1");
}

export async function recoverCustomerAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = customerEmailSchema.safeParse(formData.get("email"));

  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const rateLimit = await checkAuthenticationRateLimit(
      "recover",
      parsed.data,
    );
    if (!rateLimit.allowed) return rateLimitFailure();

    await recoverCustomer(parsed.data, rateLimit.context.buyerIp);
  } catch (error) {
    if (!(error instanceof ShopifyCustomerError)) {
      return actionFailure(
        error,
        "Password recovery is temporarily unavailable.",
      );
    }
  }

  return {
    message:
      "If an account exists for that email, Shopify will send password reset instructions.",
    fieldErrors: {},
    success: true,
  };
}

export async function logoutCustomerAction() {
  const token = await getCustomerAccessTokenFromCookies();
  const { buyerIp } = await getRequestSecurityContext();

  await synchronizeCartCustomer(null, buyerIp);

  try {
    if (token) await deleteCustomerAccessToken(token, buyerIp);
  } catch {
    // The local session must still be cleared if Shopify is unavailable.
  }

  await clearCustomerSessionCookie();
  redirect("/account/login");
}

export type CustomerDetailsActionState = AccountActionState & {
  revision: number;
};

const customerDetailsFormSchema = customerDetailsUpdateInputSchema
  .extend({
    confirmPassword: z.string().max(128).optional(),
  })
  .refine(
    ({ password, confirmPassword }) => password === confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

function nullableFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" && value.trim() ? value : null;
}

export async function updateCustomerDetailsAction(
  previousState: CustomerDetailsActionState,
  formData: FormData,
): Promise<CustomerDetailsActionState> {
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");
  const parsed = customerDetailsFormSchema.safeParse({
    firstName: nullableFormValue(formData, "firstName"),
    lastName: nullableFormValue(formData, "lastName"),
    phone: nullableFormValue(formData, "phone"),
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
    password:
      typeof passwordValue === "string" && passwordValue
        ? passwordValue
        : undefined,
    confirmPassword:
      typeof confirmPasswordValue === "string" && confirmPasswordValue
        ? confirmPasswordValue
        : undefined,
  });

  if (!parsed.success) {
    return {
      ...validationFailure(parsed.error),
      revision: previousState.revision,
    };
  }

  const token = await getCustomerAccessTokenFromCookies();

  if (!token) {
    return {
      message: "Your session expired. Sign in again to update your details.",
      fieldErrors: {},
      success: false,
      revision: previousState.revision,
    };
  }

  try {
    const rateLimit = await checkAccountWriteRateLimit(token);
    if (!rateLimit.allowed) {
      return {
        ...rateLimitFailure(),
        revision: previousState.revision,
      };
    }

    const { confirmPassword: _confirmPassword, ...customerInput } = parsed.data;
    void _confirmPassword;
    const buyerIp = rateLimit.context.buyerIp;
    const result = await updateCustomerDetails(token, customerInput, buyerIp);

    if (customerInput.password) {
      if (!result.customerAccessToken) {
        throw new ShopifyCustomerError(
          "Shopify changed the password without returning a replacement session.",
        );
      }

      await setCustomerSessionCookie(
        result.customerAccessToken,
        await isCustomerSessionRemembered(),
      );
      await synchronizeCartCustomer(
        result.customerAccessToken.accessToken,
        buyerIp,
      );
    }

    revalidatePath("/account");
    const needsMarketingConfirmation =
      customerInput.acceptsMarketing && !result.customer.acceptsMarketing;

    return {
      message: needsMarketingConfirmation
        ? "Details saved. Shopify did not subscribe the account immediately. If double opt-in is enabled, check your email to confirm the subscription."
        : customerInput.password
          ? "Customer details and password updated."
          : "Customer details updated.",
      fieldErrors: {},
      success: true,
      revision: previousState.revision + 1,
    };
  } catch (error) {
    return {
      ...actionFailure(error, "The customer details could not be updated."),
      revision: previousState.revision,
    };
  }
}

const addressFormSchema = customerAddressInputSchema.extend({
  setDefault: z.boolean(),
});

const addressUpdateFormSchema = addressFormSchema.extend({
  addressId: customerAddressIdSchema,
});

export type AddressActionState = AccountActionState;

function optionalFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" && value.trim() ? value : undefined;
}

function addressFormValue(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: optionalFormValue(formData, "company"),
    address1: formData.get("address1"),
    address2: optionalFormValue(formData, "address2"),
    city: formData.get("city"),
    country: formData.get("country"),
    province: optionalFormValue(formData, "province"),
    zip: formData.get("zip"),
    phone: optionalFormValue(formData, "phone"),
    setDefault: formData.get("setDefault") === "on",
  };
}

function locationFailure(error: LocationInputError): AddressActionState {
  return {
    message: error.message,
    fieldErrors: error.fieldErrors,
    success: false,
  };
}

async function normalizeAddressInput(
  input: z.infer<typeof addressFormSchema>,
) {
  const { setDefault, ...address } = input;
  const location = await normalizeAddressLocation(address);

  return {
    setDefault,
    address: { ...address, ...location },
  };
}

export async function addCustomerAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressFormSchema.safeParse(addressFormValue(formData));

  if (!parsed.success) return validationFailure(parsed.error);

  const token = await getCustomerAccessTokenFromCookies();

  if (!token) {
    return {
      message: "Your session expired. Sign in again before adding an address.",
      fieldErrors: {},
      success: false,
    };
  }

  try {
    const rateLimit = await checkAccountWriteRateLimit(token);
    if (!rateLimit.allowed) return rateLimitFailure();

    const { setDefault, address } = await normalizeAddressInput(parsed.data);
    const buyerIp = rateLimit.context.buyerIp;
    const createdAddress = await createCustomerAddress(token, address, buyerIp);

    if (setDefault) {
      try {
        await setDefaultCustomerAddress(token, createdAddress.id, buyerIp);
      } catch (error) {
        revalidatePath("/account");
        return {
          message:
            error instanceof ShopifyCustomerError
              ? `Address added, but it was not set as primary. ${error.message}`
              : "Address added, but Shopify could not set it as primary.",
          fieldErrors: {},
          success: false,
        };
      }
    }

    revalidatePath("/account");
    return {
      message: setDefault
        ? "Address added and set as your primary shipping address."
        : "Address added.",
      fieldErrors: {},
      success: true,
    };
  } catch (error) {
    if (error instanceof LocationInputError) return locationFailure(error);

    return actionFailure(error, "The address could not be added. Try again.");
  }
}

export async function updateCustomerAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressUpdateFormSchema.safeParse({
    ...addressFormValue(formData),
    addressId: formData.get("addressId"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const token = await getCustomerAccessTokenFromCookies();

  if (!token) {
    return {
      message: "Your session expired. Sign in again before editing an address.",
      fieldErrors: {},
      success: false,
    };
  }

  try {
    const rateLimit = await checkAccountWriteRateLimit(token);
    if (!rateLimit.allowed) return rateLimitFailure();

    const { addressId, ...addressFields } = parsed.data;
    const { setDefault, address } = await normalizeAddressInput(addressFields);
    const buyerIp = rateLimit.context.buyerIp;
    await updateCustomerAddress(token, addressId, address, buyerIp);

    if (setDefault) {
      try {
        await setDefaultCustomerAddress(token, addressId, buyerIp);
      } catch (error) {
        revalidatePath("/account");
        return {
          message:
            error instanceof ShopifyCustomerError
              ? `Address updated, but it was not set as primary. ${error.message}`
              : "Address updated, but Shopify could not set it as primary.",
          fieldErrors: {},
          success: false,
        };
      }
    }

    revalidatePath("/account");
    return {
      message: setDefault
        ? "Address updated and set as your primary shipping address."
        : "Address updated.",
      fieldErrors: {},
      success: true,
    };
  } catch (error) {
    if (error instanceof LocationInputError) return locationFailure(error);

    return actionFailure(error, "The address could not be updated. Try again.");
  }
}

export async function setPrimaryCustomerAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const addressId = customerAddressIdSchema.safeParse(
    formData.get("addressId"),
  );

  if (!addressId.success) return validationFailure(addressId.error);

  const token = await getCustomerAccessTokenFromCookies();

  if (!token) {
    return {
      message: "Your session expired. Sign in again to change your address.",
      fieldErrors: {},
      success: false,
    };
  }

  try {
    const rateLimit = await checkAccountWriteRateLimit(token);
    if (!rateLimit.allowed) return rateLimitFailure();

    await setDefaultCustomerAddress(
      token,
      addressId.data,
      rateLimit.context.buyerIp,
    );
    revalidatePath("/account");
    return {
      message: "Primary shipping address updated.",
      fieldErrors: {},
      success: true,
    };
  } catch (error) {
    return actionFailure(
      error,
      "The primary shipping address could not be changed.",
    );
  }
}

export async function deleteCustomerAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const addressId = customerAddressIdSchema.safeParse(
    formData.get("addressId"),
  );

  if (!addressId.success) return validationFailure(addressId.error);

  const token = await getCustomerAccessTokenFromCookies();

  if (!token) {
    return {
      message: "Your session expired. Sign in again to delete this address.",
      fieldErrors: {},
      success: false,
    };
  }

  try {
    const rateLimit = await checkAccountWriteRateLimit(token);
    if (!rateLimit.allowed) return rateLimitFailure();

    await deleteCustomerAddress(
      token,
      addressId.data,
      rateLimit.context.buyerIp,
    );
    revalidatePath("/account");
    return {
      message: "Address deleted.",
      fieldErrors: {},
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "The address could not be deleted.");
  }
}
