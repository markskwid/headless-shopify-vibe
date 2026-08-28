import "server-only";

import { cookies } from "next/headers";

import {
  customerAccessTokenSchema,
  type CustomerAccessToken,
} from "../schemas/customer";

const CUSTOMER_COOKIE_NAME = "shopify_customer_access_token";
const CUSTOMER_REMEMBER_COOKIE_NAME = "shopify_customer_session_remembered";
const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 7;

export async function getCustomerAccessTokenFromCookies() {
  const value = (await cookies()).get(CUSTOMER_COOKIE_NAME)?.value;
  const parsed = customerAccessTokenSchema.shape.accessToken.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export async function hasCustomerSession() {
  return Boolean(await getCustomerAccessTokenFromCookies());
}

export async function isCustomerSessionRemembered() {
  return (
    (await cookies()).get(CUSTOMER_REMEMBER_COOKIE_NAME)?.value === "1"
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

  cookieStore.set(CUSTOMER_COOKIE_NAME, "", removalOptions);
  cookieStore.set(CUSTOMER_REMEMBER_COOKIE_NAME, "", removalOptions);
}
