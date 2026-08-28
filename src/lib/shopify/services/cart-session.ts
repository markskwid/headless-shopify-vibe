import "server-only";

import { cookies } from "next/headers";

import { cartIdSchema, type Cart, type CartSnapshot } from "../schemas/cart";
import { getCart } from "./cart";

const CART_COOKIE_NAME = "shopify_cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function getCartIdFromCookies() {
  const value = (await cookies()).get(CART_COOKIE_NAME)?.value;
  const parsed = cartIdSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export async function setCartIdCookie(cartId: unknown) {
  const value = cartIdSchema.parse(cartId);

  (await cookies()).set(CART_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export function toCartSnapshot(cart: Cart): CartSnapshot {
  const { id: _id, ...snapshot } = cart;
  void _id;
  return snapshot;
}

export async function getCartFromCookies() {
  const cartId = await getCartIdFromCookies();
  return cartId ? getCart(cartId) : null;
}

export async function getCartSnapshotFromCookies() {
  const cart = await getCartFromCookies();
  return cart ? toCartSnapshot(cart) : null;
}
