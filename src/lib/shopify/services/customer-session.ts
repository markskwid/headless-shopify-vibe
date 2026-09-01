import "server-only";

import { cookies } from "next/headers";

import {
  customerAccessTokenSchema,
  type CustomerAccessToken,
} from "../schemas/customer";

const LEGACY_CUSTOMER_COOKIE_NAME = "shopify_customer_access_token";
const LEGACY_CUSTOMER_REMEMBER_COOKIE_NAME =
  "shopify_customer_session_remembered";
const CUSTOMER_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-shopify_customer_access_token"
    : LEGACY_CUSTOMER_COOKIE_NAME;
const CUSTOMER_REMEMBER_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-shopify_customer_session_remembered"
    : LEGACY_CUSTOMER_REMEMBER_COOKIE_NAME;
const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 7;

function cookieValue(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  currentName: string,
  legacyName: string,
) {
  return (
    cookieStore.get(currentName)?.value ?? cookieStore.get(legacyName)?.value
  );
}

export async function getCustomerAccessTokenFromCookies() {
  const cookieStore = await cookies();
  const value = cookieValue(
    cookieStore,
    CUSTOMER_COOKIE_NAME,
    LEGACY_CUSTOMER_COOKIE_NAME,
  );
  const parsed = customerAccessTokenSchema.shape.accessToken.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export async function hasCustomerSession() {
  return Boolean(await getCustomerAccessTokenFromCookies());
}

export async function isCustomerSessionRemembered() {
  const cookieStore = await cookies();
  return (
    cookieValue(
      cookieStore,
      CUSTOMER_REMEMBER_COOKIE_NAME,
      LEGACY_CUSTOMER_REMEMBER_COOKIE_NAME,
    ) === "1"
  );
}

export async function setCustomerSessionCookie(
  input: CustomerAccessToken,
  remember: boolean,
) {
  const token = customerAccessTokenSchema.parse(input);
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_COOKIE_NAME, token.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    priority: "high",
    ...(remember ? { maxAge: REMEMBERED_SESSION_SECONDS } : {}),
  });

  if (CUSTOMER_COOKIE_NAME !== LEGACY_CUSTOMER_COOKIE_NAME) {
    cookieStore.set(LEGACY_CUSTOMER_COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      priority: "high",
      maxAge: 0,
    });
  }

  if (remember) {
    cookieStore.set(CUSTOMER_REMEMBER_COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      priority: "high",
      maxAge: REMEMBERED_SESSION_SECONDS,
    });
  } else {
    cookieStore.set(CUSTOMER_REMEMBER_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      priority: "high",
      maxAge: 0,
    });
  }

  if (CUSTOMER_REMEMBER_COOKIE_NAME !== LEGACY_CUSTOMER_REMEMBER_COOKIE_NAME) {
    cookieStore.set(LEGACY_CUSTOMER_REMEMBER_COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      priority: "high",
      maxAge: 0,
    });
  }
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  const removalOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    priority: "high",
    maxAge: 0,
  } as const;

  for (const name of new Set([
    CUSTOMER_COOKIE_NAME,
    CUSTOMER_REMEMBER_COOKIE_NAME,
    LEGACY_CUSTOMER_COOKIE_NAME,
    LEGACY_CUSTOMER_REMEMBER_COOKIE_NAME,
  ])) {
    cookieStore.set(name, "", removalOptions);
  }
}
