import "server-only";

import {
  KlaviyoConfigurationError,
  requireKlaviyoConfig,
} from "../env";
import {
  klaviyoErrorResponseSchema,
  newsletterEmailSchema,
} from "../schemas";

const KLAVIYO_SUBSCRIPTIONS_ENDPOINT =
  "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";
const KLAVIYO_API_REVISION = "2026-07-15";
const KLAVIYO_REQUEST_TIMEOUT_MS = 10_000;

export class KlaviyoSubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KlaviyoSubscriptionError";
  }
}

function errorMessageForStatus(status: number) {
  if (status === 401 || status === 403) {
    return "Newsletter configuration needs attention. Please try again later.";
  }

  if (status === 429) {
    return "Too many subscription requests. Please wait a moment and try again.";
  }

  return "We could not add you to the newsletter. Please try again.";
}

export async function subscribeToNewsletter(emailInput: unknown) {
  const email = newsletterEmailSchema.parse(emailInput);

  let config;
  try {
    config = requireKlaviyoConfig();
  } catch (error) {
    if (error instanceof KlaviyoConfigurationError) {
      throw new KlaviyoSubscriptionError(
        "Newsletter signup is not configured yet. Please try again later.",
      );
    }
    throw error;
  }

  let response: Response;

  try {
    response = await fetch(KLAVIYO_SUBSCRIPTIONS_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Klaviyo-API-Key ${config.apiKey}`,
        "Content-Type": "application/vnd.api+json",
        revision: KLAVIYO_API_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            custom_source: "Storefront footer",
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: {
                      email: {
                        marketing: { consent: "SUBSCRIBED" },
                      },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: {
              data: { type: "list", id: config.listId },
            },
          },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(KLAVIYO_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new KlaviyoSubscriptionError(
      "Newsletter signup is temporarily unavailable. Please try again.",
    );
  }

  if (response.status === 202) return;

  const body: unknown = await response.json().catch(() => null);
  const parsedError = klaviyoErrorResponseSchema.safeParse(body);

  if (!parsedError.success) {
    throw new KlaviyoSubscriptionError(
      "The newsletter provider returned an unexpected response. Please try again.",
    );
  }

  throw new KlaviyoSubscriptionError(errorMessageForStatus(response.status));
}
