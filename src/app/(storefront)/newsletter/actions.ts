"use server";

import { z } from "zod";

import {
  KlaviyoSubscriptionError,
  subscribeToNewsletter,
} from "@/lib/klaviyo";
import { newsletterEmailSchema } from "@/lib/klaviyo/schemas";
import {
  getCustomerAccessTokenFromCookies,
  getCustomerNewsletterProfile,
  subscribeCustomerToEmailMarketing,
} from "@/lib/shopify";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { getRequestSecurityContext } from "@/lib/security/request";

export type NewsletterActionState = {
  message: string | null;
  fieldErrors: { email?: string[] };
  success: boolean;
};

const newsletterFormSchema = z.object({
  email: newsletterEmailSchema,
  company: z.string().max(0).optional(),
});

type ShopifySyncStatus =
  | "already-subscribed"
  | "different-email"
  | "guest"
  | "pending"
  | "unavailable";

function klaviyoFailureMessage(error: unknown) {
  return error instanceof KlaviyoSubscriptionError
    ? error.message
    : "Newsletter signup is temporarily unavailable. Please try again.";
}

export async function subscribeToNewsletterAction(
  _previousState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const company = formData.get("company");

  if (typeof company === "string" && company) {
    return {
      message:
        "Thanks for signing up. Check your inbox if confirmation is required.",
      fieldErrors: {},
      success: true,
    };
  }

  const parsed = newsletterFormSchema.safeParse({
    email: formData.get("email"),
    company: company || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    return {
      message: "Enter a valid email address and try again.",
      fieldErrors: { email: fieldErrors.email },
      success: false,
    };
  }

  const requestContext = await getRequestSecurityContext();
  const rateLimit = await checkRateLimits([
    { policy: "newsletter-ip", identifier: requestContext.clientKey },
    { policy: "newsletter-account", identifier: parsed.data.email },
  ]);

  if (!rateLimit.allowed) {
    return {
      message: "Too many signup attempts. Wait a while and try again.",
      fieldErrors: {},
      success: false,
    };
  }

  const customerAccessToken = await getCustomerAccessTokenFromCookies();
  const buyerIp = requestContext.buyerIp;
  let shopifySyncStatus: ShopifySyncStatus = customerAccessToken
    ? "unavailable"
    : "guest";
  let shopifyUpdate: ReturnType<
    typeof subscribeCustomerToEmailMarketing
  > | null = null;

  if (customerAccessToken) {
    try {
      const customer = await getCustomerNewsletterProfile(
        customerAccessToken,
        buyerIp,
      );

      if (customer?.email) {
        if (customer.email !== parsed.data.email) {
          shopifySyncStatus = "different-email";
        } else if (customer.acceptsMarketing) {
          shopifySyncStatus = "already-subscribed";
        } else {
          shopifySyncStatus = "pending";
          shopifyUpdate = subscribeCustomerToEmailMarketing(
            customerAccessToken,
            buyerIp,
          );
        }
      }
    } catch {
      shopifySyncStatus = "unavailable";
    }
  }

  const [klaviyoResult, shopifyResult] = await Promise.allSettled([
    subscribeToNewsletter(parsed.data.email),
    shopifyUpdate ?? Promise.resolve(null),
  ] as const);

  if (klaviyoResult.status === "rejected") {
    const shopifyWasUpdated =
      shopifySyncStatus === "pending" &&
      shopifyResult.status === "fulfilled" &&
      shopifyResult.value?.acceptsMarketing;

    return {
      message: shopifyWasUpdated
        ? `${klaviyoFailureMessage(klaviyoResult.reason)} Your Shopify email-marketing preference was updated.`
        : klaviyoFailureMessage(klaviyoResult.reason),
      fieldErrors: {},
      success: false,
    };
  }

  if (shopifySyncStatus === "unavailable") {
    return {
      message:
        "Subscribed with Klaviyo, but the Shopify account preference could not be synchronized. Try again or update it from My account.",
      fieldErrors: {},
      success: false,
    };
  }

  if (shopifySyncStatus === "different-email") {
    return {
      message:
        "This email was subscribed with Klaviyo. Your Shopify account preference was unchanged because its email is different.",
      fieldErrors: {},
      success: true,
    };
  }

  if (shopifySyncStatus === "pending") {
    if (shopifyResult.status === "rejected") {
      return {
        message:
          "Subscribed with Klaviyo, but Shopify could not update the account preference. Try again or update it from My account.",
        fieldErrors: {},
        success: false,
      };
    }

    if (!shopifyResult.value?.acceptsMarketing) {
      return {
        message:
          "Subscribed with Klaviyo. Shopify may require you to confirm the account subscription by email.",
        fieldErrors: {},
        success: true,
      };
    }

    return {
      message: "You are subscribed in both Klaviyo and Shopify.",
      fieldErrors: {},
      success: true,
    };
  }

  if (shopifySyncStatus === "already-subscribed") {
    return {
      message: "Subscribed with Klaviyo. Your Shopify account was already opted in.",
      fieldErrors: {},
      success: true,
    };
  }

  return {
    message:
      "Thanks for signing up. Check your inbox if confirmation is required.",
    fieldErrors: {},
    success: true,
  };
}
