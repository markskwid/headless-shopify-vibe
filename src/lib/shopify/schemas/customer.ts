import { z } from "zod";

import { httpsUrlSchema } from "@/lib/validation/url";

import { moneySchema } from "./product";

export const customerEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."))
  .pipe(z.string().max(254));

export const customerPasswordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must contain 128 characters or fewer.");

export const customerPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+[1-9]\d{7,14}$/,
    "Use international format, such as +16135551111.",
  );

export const customerAccessTokenSchema = z.object({
  accessToken: z.string().min(1).max(2048),
  expiresAt: z.string().datetime({ offset: true }),
});

export const customerProfileSchema = z.object({
  id: z.string().startsWith("gid://shopify/Customer/"),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: customerEmailSchema.nullable(),
  phone: z.string().nullable(),
  acceptsMarketing: z.boolean(),
});

export const customerAddressIdSchema = z
  .string()
  .startsWith("gid://shopify/MailingAddress/")
  .max(512);

export const customerAddressSchema = z.object({
  id: customerAddressIdSchema,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  company: z.string().nullable(),
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string().nullable(),
  zip: z.string().nullable(),
  phone: z.string().nullable(),
  formatted: z.array(z.string()),
});

const customerOrderSchema = z.object({
  id: z.string().startsWith("gid://shopify/Order/"),
  orderNumber: z.number().int().positive(),
  processedAt: z.string().datetime({ offset: true }),
  financialStatus: z
    .enum([
      "AUTHORIZED",
      "PAID",
      "PARTIALLY_PAID",
      "PARTIALLY_REFUNDED",
      "PENDING",
      "REFUNDED",
      "VOIDED",
    ])
    .nullable(),
  fulfillmentStatus: z.enum([
    "FULFILLED",
    "IN_PROGRESS",
    "ON_HOLD",
    "OPEN",
    "PARTIALLY_FULFILLED",
    "PENDING_FULFILLMENT",
    "RESTOCKED",
    "SCHEDULED",
    "UNFULFILLED",
  ]),
  currentTotalPrice: moneySchema,
  totalPrice: moneySchema,
  totalRefunded: moneySchema,
  lineItems: z.object({
    nodes: z.array(
      z.object({
        title: z.string(),
        discountedTotalPrice: moneySchema,
        variant: z
          .object({
            image: z
              .object({
                url: httpsUrlSchema,
                altText: z.string().nullable(),
                width: z.number().int().positive().nullable(),
                height: z.number().int().positive().nullable(),
              })
              .nullable(),
          })
          .nullable(),
      }),
    ),
  }),
  statusUrl: httpsUrlSchema,
});

export const customerAccountProfileSchema = customerProfileSchema.extend({
  defaultAddress: customerAddressSchema.nullable(),
  addresses: z.object({
    nodes: z.array(customerAddressSchema),
  }),
});

export const customerSchema = customerAccountProfileSchema.extend({
  orders: z.object({
    nodes: z.array(customerOrderSchema),
  }),
});

const customerUserErrorSchema = z.object({
  code: z.string().nullable(),
  field: z.array(z.string()).nullable(),
  message: z.string(),
});

const customerMutationUserErrorSchema = z.object({
  field: z.array(z.string()).nullable(),
  message: z.string(),
});

export const customerAccessTokenCreateResponseSchema = z.object({
  customerAccessTokenCreate: z
    .object({
      customerAccessToken: customerAccessTokenSchema.nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerCreateResponseSchema = z.object({
  customerCreate: z
    .object({
      customer: customerProfileSchema.nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerRecoverResponseSchema = z.object({
  customerRecover: z
    .object({
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerAccessTokenDeleteResponseSchema = z.object({
  customerAccessTokenDelete: z
    .object({
      deletedAccessToken: z.string().nullable(),
      deletedCustomerAccessTokenId: z.string().nullable(),
      userErrors: z.array(customerMutationUserErrorSchema),
    })
    .nullable(),
});

export const customerAddressCreateResponseSchema = z.object({
  customerAddressCreate: z
    .object({
      customerAddress: customerAddressSchema.nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerAddressUpdateResponseSchema = z.object({
  customerAddressUpdate: z
    .object({
      customerAddress: customerAddressSchema.nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerAddressDeleteResponseSchema = z.object({
  customerAddressDelete: z
    .object({
      deletedCustomerAddressId: customerAddressIdSchema.nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerDefaultAddressUpdateResponseSchema = z.object({
  customerDefaultAddressUpdate: z
    .object({
      customer: z
        .object({
          defaultAddress: customerAddressSchema.nullable(),
        })
        .nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

export const customerResponseSchema = z.object({
  customer: customerAccountProfileSchema.nullable(),
});

export const customerNewsletterProfileSchema = z.object({
  email: customerEmailSchema.nullable(),
  acceptsMarketing: z.boolean(),
});

export const customerNewsletterProfileResponseSchema = z.object({
  customer: customerNewsletterProfileSchema.nullable(),
});

export const customerOrdersResponseSchema = z.object({
  customer: z
    .object({
      orders: z.object({
        nodes: z.array(customerOrderSchema),
        pageInfo: z.object({
          hasNextPage: z.boolean(),
          endCursor: z.string().nullable(),
        }),
      }),
    })
    .nullable(),
});

export const customerLoginInputSchema = z.object({
  email: customerEmailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
});

export const customerRegistrationInputSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: customerEmailSchema,
  phone: customerPhoneSchema.optional(),
  password: customerPasswordSchema,
  acceptsMarketing: z.boolean().default(false),
});

export const customerDetailsUpdateInputSchema = z.object({
  firstName: z.string().trim().max(80).nullable(),
  lastName: z.string().trim().max(80).nullable(),
  phone: customerPhoneSchema.nullable(),
  acceptsMarketing: z.boolean(),
  password: customerPasswordSchema.optional(),
});

export const customerMarketingSubscriptionInputSchema = z.object({
  acceptsMarketing: z.literal(true),
});

export const customerUpdateResponseSchema = z.object({
  customerUpdate: z
    .object({
      customer: customerProfileSchema.nullable(),
      customerAccessToken: customerAccessTokenSchema.nullable(),
      customerUserErrors: z.array(customerUserErrorSchema),
    })
    .nullable(),
});

const requiredAddressField = (label: string, maximum = 255) =>
  z.string().trim().min(1, `Enter ${label}.`).max(maximum);

export const customerAddressInputSchema = z.object({
  firstName: requiredAddressField("a first name", 80),
  lastName: requiredAddressField("a last name", 80),
  company: z.string().trim().max(255).optional(),
  address1: requiredAddressField("an address"),
  address2: z.string().trim().max(255).optional(),
  city: requiredAddressField("a city", 120),
  country: requiredAddressField("a country", 120),
  province: z.string().trim().max(120).optional(),
  zip: requiredAddressField("a postal code", 32),
  phone: customerPhoneSchema.optional(),
});

export type Customer = z.infer<typeof customerSchema>;
export type CustomerAddress = z.infer<typeof customerAddressSchema>;
export type CustomerAddressInput = z.infer<typeof customerAddressInputSchema>;
export type CustomerOrder = z.infer<typeof customerOrderSchema>;
export type CustomerAccessToken = z.infer<typeof customerAccessTokenSchema>;
export type CustomerRegistrationInput = z.infer<
  typeof customerRegistrationInputSchema
>;
export type CustomerDetailsUpdateInput = z.infer<
  typeof customerDetailsUpdateInputSchema
>;
export type CustomerNewsletterProfile = z.infer<
  typeof customerNewsletterProfileSchema
>;
