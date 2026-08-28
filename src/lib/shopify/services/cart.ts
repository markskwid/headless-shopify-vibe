import { shopifyFetch } from "../client";
import {
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_NOTE_UPDATE_MUTATION,
} from "../graphql/mutations/cart";
import { CART_QUERY } from "../graphql/queries/cart";
import {
  cartBuyerIdentityUpdateResponseSchema,
  cartCreateResponseSchema,
  cartDiscountCodesUpdateResponseSchema,
  cartIdSchema,
  cartLineIdSchema,
  cartLinesAddResponseSchema,
  cartLinesRemoveResponseSchema,
  cartLinesUpdateResponseSchema,
  cartNoteUpdateResponseSchema,
  cartResponseSchema,
  type Cart,
  type CartMutationPayload,
} from "../schemas/cart";
import { customerAccessTokenSchema } from "../schemas/customer";
import { z } from "zod";

const merchandiseIdSchema = z
  .string()
  .startsWith("gid://shopify/ProductVariant/")
  .max(512);
const quantitySchema = z.number().int().min(1).max(250);
const noteSchema = z.string().max(5000);
const discountCodesSchema = z.array(z.string().trim().min(1).max(255)).max(250);

export class ShopifyCartError extends Error {
  constructor(
    message: string,
    public readonly codes: Array<string | null> = [],
  ) {
    super(message);
    this.name = "ShopifyCartError";
  }
}

type CartMutationResult = {
  cart: Cart;
  warnings: string[];
};

function unwrapCartMutation(
  payload: CartMutationPayload | null,
): CartMutationResult {
  if (!payload) {
    throw new ShopifyCartError("Shopify did not return a cart mutation result.");
  }

  if (payload.userErrors.length) {
    throw new ShopifyCartError(
      payload.userErrors.map((error) => error.message).join(" "),
      payload.userErrors.map((error) => error.code),
    );
  }

  if (!payload.cart) {
    throw new ShopifyCartError("Shopify did not return an updated cart.");
  }

  return {
    cart: payload.cart,
    warnings: payload.warnings.map((warning) => warning.message),
  };
}

export async function getCart(input: unknown) {
  const id = cartIdSchema.parse(input);
  const response = await shopifyFetch({
    query: CART_QUERY,
    schema: cartResponseSchema,
    variables: { id },
    revalidate: false,
  });

  return response.cart;
}

export async function createCart(
  input: {
    merchandiseId: unknown;
    quantity?: unknown;
  },
  customerAccessTokenInput?: unknown,
  buyerIp?: string,
) {
  const merchandiseId = merchandiseIdSchema.parse(input.merchandiseId);
  const quantity = quantitySchema.parse(input.quantity ?? 1);
  const customerAccessToken = customerAccessTokenInput
    ? customerAccessTokenSchema.shape.accessToken.parse(customerAccessTokenInput)
    : null;
  const response = await shopifyFetch({
    query: CART_CREATE_MUTATION,
    schema: cartCreateResponseSchema,
    variables: {
      input: {
        lines: [{ merchandiseId, quantity }],
        ...(customerAccessToken
          ? { buyerIdentity: { customerAccessToken } }
          : {}),
      },
    },
    revalidate: false,
    buyerIp,
  });

  return unwrapCartMutation(response.cartCreate);
}

export async function updateCartBuyerIdentity(
  cartIdInput: unknown,
  customerAccessTokenInput: unknown,
  buyerIp?: string,
) {
  const cartId = cartIdSchema.parse(cartIdInput);
  const customerAccessToken =
    customerAccessTokenInput === null
      ? null
      : customerAccessTokenSchema.shape.accessToken.parse(
          customerAccessTokenInput,
        );
  const response = await shopifyFetch({
    query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
    schema: cartBuyerIdentityUpdateResponseSchema,
    variables: {
      cartId,
      buyerIdentity: { customerAccessToken },
    },
    revalidate: false,
    buyerIp,
  });

  return unwrapCartMutation(response.cartBuyerIdentityUpdate);
}

export async function addCartLine(
  cartIdInput: unknown,
  input: { merchandiseId: unknown; quantity?: unknown },
) {
  const cartId = cartIdSchema.parse(cartIdInput);
  const merchandiseId = merchandiseIdSchema.parse(input.merchandiseId);
  const quantity = quantitySchema.parse(input.quantity ?? 1);
  const response = await shopifyFetch({
    query: CART_LINES_ADD_MUTATION,
    schema: cartLinesAddResponseSchema,
    variables: { cartId, lines: [{ merchandiseId, quantity }] },
    revalidate: false,
  });

  return unwrapCartMutation(response.cartLinesAdd);
}

export async function updateCartLine(
  cartIdInput: unknown,
  input: { lineId: unknown; quantity: unknown },
) {
  const cartId = cartIdSchema.parse(cartIdInput);
  const id = cartLineIdSchema.parse(input.lineId);
  const quantity = quantitySchema.parse(input.quantity);
  const response = await shopifyFetch({
    query: CART_LINES_UPDATE_MUTATION,
    schema: cartLinesUpdateResponseSchema,
    variables: { cartId, lines: [{ id, quantity }] },
    revalidate: false,
  });

  return unwrapCartMutation(response.cartLinesUpdate);
}

export async function removeCartLine(
  cartIdInput: unknown,
  lineIdInput: unknown,
) {
  const cartId = cartIdSchema.parse(cartIdInput);
  const lineId = cartLineIdSchema.parse(lineIdInput);
  const response = await shopifyFetch({
    query: CART_LINES_REMOVE_MUTATION,
    schema: cartLinesRemoveResponseSchema,
    variables: { cartId, lineIds: [lineId] },
    revalidate: false,
  });

  return unwrapCartMutation(response.cartLinesRemove);
}

export async function updateCartNote(
  cartIdInput: unknown,
  noteInput: unknown,
) {
  const cartId = cartIdSchema.parse(cartIdInput);
  const note = noteSchema.parse(noteInput);
  const response = await shopifyFetch({
    query: CART_NOTE_UPDATE_MUTATION,
    schema: cartNoteUpdateResponseSchema,
    variables: { cartId, note },
    revalidate: false,
  });

  return unwrapCartMutation(response.cartNoteUpdate);
}

export async function updateCartDiscountCodes(
  cartIdInput: unknown,
  codesInput: unknown,
) {
  const cartId = cartIdSchema.parse(cartIdInput);
  const discountCodes = discountCodesSchema.parse(codesInput);
  const response = await shopifyFetch({
    query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
    schema: cartDiscountCodesUpdateResponseSchema,
    variables: { cartId, discountCodes },
    revalidate: false,
  });

  return unwrapCartMutation(response.cartDiscountCodesUpdate);
}
