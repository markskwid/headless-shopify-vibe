"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addCartLine,
  createCart,
  getCart,
  removeCartLine,
  ShopifyCartError,
  updateCartDiscountCodes,
  updateCartLine,
  updateCartNote,
  updateCartBuyerIdentity,
} from "@/lib/shopify/services/cart";
import {
  getCartIdFromCookies,
  setCartIdCookie,
  toCartSnapshot,
} from "@/lib/shopify/services/cart-session";
import type { Cart, CartSnapshot } from "@/lib/shopify/schemas/cart";
import { getCustomerAccessTokenFromCookies } from "@/lib/shopify/services/customer-session";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { getRequestSecurityContext } from "@/lib/security/request";

const merchandiseIdSchema = z
  .string()
  .startsWith("gid://shopify/ProductVariant/")
  .max(512);
const lineIdSchema = z.string().min(1).max(2048);
const quantitySchema = z.number().int().min(1).max(250);
const noteSchema = z.string().max(5000);
const discountCodeSchema = z.string().trim().min(1).max(255);

export type CartActionResult = {
  cart: CartSnapshot | null;
  error: string | null;
  warning: string | null;
};

function success(
  cart: Cart,
  warnings: string[] = [],
  error: string | null = null,
): CartActionResult {
  revalidatePath("/cart");
  return {
    cart: toCartSnapshot(cart),
    error,
    warning: warnings[0] ?? null,
  };
}

function failure(error: unknown): CartActionResult {
  return {
    cart: null,
    error:
      error instanceof ShopifyCartError
        ? error.message
        : "The cart could not be updated. Please try again.",
    warning: null,
  };
}

function rateLimitFailure(): CartActionResult {
  return {
    cart: null,
    error: "Too many cart updates. Wait a moment and try again.",
    warning: null,
  };
}

async function checkCartRateLimit(cartId?: string | null) {
  const context = await getRequestSecurityContext();
  const result = await checkRateLimits([
    { policy: "cart-write", identifier: context.clientKey },
    ...(cartId
      ? [{ policy: "cart-write" as const, identifier: `cart:${cartId}` }]
      : []),
  ]);

  return { context, allowed: result.allowed };
}

async function requireCurrentCart() {
  const cartId = await getCartIdFromCookies();
  if (!cartId) throw new ShopifyCartError("Your cart is empty.");

  const cart = await getCart(cartId);
  if (!cart) throw new ShopifyCartError("Your cart has expired.");

  return cart;
}

export async function addCartLineAction(input: unknown) {
  try {
    const parsed = z
      .object({
        merchandiseId: merchandiseIdSchema,
        quantity: quantitySchema.default(1),
      })
      .parse(input);
    const cartId = await getCartIdFromCookies();
    const rateLimit = await checkCartRateLimit(cartId);
    if (!rateLimit.allowed) return rateLimitFailure();

    const currentCart = cartId ? await getCart(cartId) : null;
    const customerAccessToken = await getCustomerAccessTokenFromCookies();
    const buyerIp = rateLimit.context.buyerIp;

    if (currentCart && customerAccessToken) {
      await updateCartBuyerIdentity(cartId, customerAccessToken, buyerIp);
    }

    const result = currentCart
      ? await addCartLine(cartId, parsed)
      : await createCart(parsed, customerAccessToken, buyerIp);

    if (!currentCart) await setCartIdCookie(result.cart.id);

    return success(result.cart, result.warnings);
  } catch (error) {
    return failure(error);
  }
}

export async function updateCartLineAction(input: unknown) {
  try {
    const parsed = z
      .object({ lineId: lineIdSchema, quantity: quantitySchema })
      .parse(input);
    const rateLimit = await checkCartRateLimit(await getCartIdFromCookies());
    if (!rateLimit.allowed) return rateLimitFailure();

    const cart = await requireCurrentCart();
    const result = await updateCartLine(cart.id, parsed);
    return success(result.cart, result.warnings);
  } catch (error) {
    return failure(error);
  }
}

export async function removeCartLineAction(input: unknown) {
  try {
    const lineId = lineIdSchema.parse(input);
    const rateLimit = await checkCartRateLimit(await getCartIdFromCookies());
    if (!rateLimit.allowed) return rateLimitFailure();

    const cart = await requireCurrentCart();
    const result = await removeCartLine(cart.id, lineId);
    return success(result.cart, result.warnings);
  } catch (error) {
    return failure(error);
  }
}

export async function updateCartNoteAction(input: unknown) {
  try {
    const note = noteSchema.parse(input);
    const rateLimit = await checkCartRateLimit(await getCartIdFromCookies());
    if (!rateLimit.allowed) return rateLimitFailure();

    const cart = await requireCurrentCart();
    const result = await updateCartNote(cart.id, note);
    return success(result.cart, result.warnings);
  } catch (error) {
    return failure(error);
  }
}

export async function updateCartDiscountAction(input: unknown) {
  try {
    const code = discountCodeSchema.parse(input);
    const rateLimit = await checkCartRateLimit(await getCartIdFromCookies());
    if (!rateLimit.allowed) return rateLimitFailure();

    const cart = await requireCurrentCart();
    const result = await updateCartDiscountCodes(cart.id, [code]);
    const appliedCode = result.cart.discountCodes.find(
      (discount) => discount.code.toLowerCase() === code.toLowerCase(),
    );

    return success(
      result.cart,
      result.warnings,
      appliedCode?.applicable
        ? null
        : "That discount code could not be applied to this cart.",
    );
  } catch (error) {
    return failure(error);
  }
}

export async function removeCartDiscountAction() {
  try {
    const rateLimit = await checkCartRateLimit(await getCartIdFromCookies());
    if (!rateLimit.allowed) return rateLimitFailure();

    const cart = await requireCurrentCart();
    const result = await updateCartDiscountCodes(cart.id, []);
    return success(result.cart, result.warnings);
  } catch (error) {
    return failure(error);
  }
}
