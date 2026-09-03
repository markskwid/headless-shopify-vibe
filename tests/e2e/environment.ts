import { z } from "zod";

const hostnameSchema = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .transform((value) =>
    value.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, ""),
  )
  .pipe(
    z.string().regex(
      /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|\[?[a-f0-9:]+\]?)$/,
      "must be a hostname without a protocol or path",
    ),
  );

const handleSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const shopifyDomainSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "")
      .toLowerCase(),
  )
  .pipe(
    z.string().regex(
      /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/,
      "must be a permanent myshopify.com hostname",
    ),
  );

const optionalEmailSchema = z
  .union([z.email(), z.literal("")])
  .optional()
  .transform((value) => value || undefined);
const optionalPasswordSchema = z
  .union([z.string().min(1).max(128), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const environmentSchema = z
  .object({
    E2E_BASE_URL: z.url(),
    E2E_PRODUCTION_HOSTNAME: hostnameSchema,
    E2E_PRODUCT_HANDLE: handleSchema,
    E2E_UNAVAILABLE_PRODUCT_HANDLE: handleSchema,
    E2E_COLLECTION_HANDLE: handleSchema,
    E2E_SEARCH_TERM: z.string().trim().min(2).max(100),
    E2E_EDITORIAL_SLUG: handleSchema,
    E2E_EDITORIAL_HEADING: z.string().trim().min(1).max(200),
    E2E_CHECKOUT_HOSTNAME: hostnameSchema,
    E2E_APPROVED_SHOPIFY_STORE_DOMAIN: shopifyDomainSchema,
    E2E_APPROVED_SANITY_PROJECT_ID: z.string().trim().min(1).max(128),
    E2E_APPROVED_SANITY_DATASET: z.string().trim().min(1).max(128),
    E2E_CUSTOMER_EMAIL: optionalEmailSchema,
    E2E_CUSTOMER_PASSWORD: optionalPasswordSchema,
    SHOPIFY_STORE_DOMAIN: shopifyDomainSchema,
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().trim().min(1).max(128),
    NEXT_PUBLIC_SANITY_DATASET: z.string().trim().min(1).max(128),
  })
  .superRefine((environment, context) => {
    const baseUrl = new URL(environment.E2E_BASE_URL);
    const baseHostname = baseUrl.hostname
      .toLowerCase()
      .replace(/^\[|\]$/g, "");
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

    if (baseUrl.pathname !== "/" || baseUrl.search || baseUrl.hash) {
      context.addIssue({
        code: "custom",
        path: ["E2E_BASE_URL"],
        message: "must be an origin URL without a path, query, or hash",
      });
    }

    if (!localHosts.has(baseHostname) && baseUrl.protocol !== "https:") {
      context.addIssue({
        code: "custom",
        path: ["E2E_BASE_URL"],
        message: "must use HTTPS unless it points to localhost",
      });
    }

    if (baseHostname === environment.E2E_PRODUCTION_HOSTNAME) {
      context.addIssue({
        code: "custom",
        path: ["E2E_BASE_URL"],
        message: "must not point to the declared production storefront",
      });
    }

    if (
      environment.E2E_APPROVED_SHOPIFY_STORE_DOMAIN !==
      environment.SHOPIFY_STORE_DOMAIN
    ) {
      context.addIssue({
        code: "custom",
        path: ["E2E_APPROVED_SHOPIFY_STORE_DOMAIN"],
        message: "must exactly match SHOPIFY_STORE_DOMAIN",
      });
    }

    if (
      environment.E2E_APPROVED_SANITY_PROJECT_ID !==
      environment.NEXT_PUBLIC_SANITY_PROJECT_ID
    ) {
      context.addIssue({
        code: "custom",
        path: ["E2E_APPROVED_SANITY_PROJECT_ID"],
        message: "must exactly match NEXT_PUBLIC_SANITY_PROJECT_ID",
      });
    }

    if (
      environment.E2E_APPROVED_SANITY_DATASET !==
      environment.NEXT_PUBLIC_SANITY_DATASET
    ) {
      context.addIssue({
        code: "custom",
        path: ["E2E_APPROVED_SANITY_DATASET"],
        message: "must exactly match NEXT_PUBLIC_SANITY_DATASET",
      });
    }

    if (
      Boolean(environment.E2E_CUSTOMER_EMAIL) !==
      Boolean(environment.E2E_CUSTOMER_PASSWORD)
    ) {
      context.addIssue({
        code: "custom",
        path: ["E2E_CUSTOMER_EMAIL"],
        message: "email and password must either both be set or both be omitted",
      });
    }
  });

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const problems = parsedEnvironment.error.issues
    .map((issue) => `- ${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid Playwright E2E configuration. Add approved development or staging values to .env.e2e.local:\n${problems}`,
  );
}

export const e2eEnvironment = {
  baseUrl: parsedEnvironment.data.E2E_BASE_URL.replace(/\/$/, ""),
  productHandle: parsedEnvironment.data.E2E_PRODUCT_HANDLE,
  unavailableProductHandle:
    parsedEnvironment.data.E2E_UNAVAILABLE_PRODUCT_HANDLE,
  collectionHandle: parsedEnvironment.data.E2E_COLLECTION_HANDLE,
  searchTerm: parsedEnvironment.data.E2E_SEARCH_TERM,
  editorialSlug: parsedEnvironment.data.E2E_EDITORIAL_SLUG,
  editorialHeading: parsedEnvironment.data.E2E_EDITORIAL_HEADING,
  checkoutHostname: parsedEnvironment.data.E2E_CHECKOUT_HOSTNAME,
  customer:
    parsedEnvironment.data.E2E_CUSTOMER_EMAIL &&
    parsedEnvironment.data.E2E_CUSTOMER_PASSWORD
      ? {
          email: parsedEnvironment.data.E2E_CUSTOMER_EMAIL,
          password: parsedEnvironment.data.E2E_CUSTOMER_PASSWORD,
        }
      : null,
};
