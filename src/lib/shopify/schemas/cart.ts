import { z } from "zod";

import { moneySchema, productImageSchema } from "./product";

export const cartIdSchema = z
  .string()
  .startsWith("gid://shopify/Cart/")
  .max(2048);

export const cartLineIdSchema = z.string().min(1).max(2048);

export const cartLineSchema = z.object({
  id: cartLineIdSchema,
  quantity: z.number().int().positive(),
  cost: z.object({
    amountPerQuantity: moneySchema,
    compareAtAmountPerQuantity: moneySchema.nullable(),
    subtotalAmount: moneySchema,
    totalAmount: moneySchema,
  }),
  discountAllocations: z.array(
    z.object({
      discountedAmount: moneySchema,
    }),
  ),
  merchandise: z.object({
    id: z.string(),
    title: z.string(),
    availableForSale: z.boolean(),
    image: productImageSchema.nullable(),
    selectedOptions: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    ),
    product: z.object({
      handle: z.string(),
      title: z.string(),
    }),
  }),
});

export const cartSchema = z.object({
  id: cartIdSchema,
  checkoutUrl: z.url(),
  totalQuantity: z.number().int().nonnegative(),
  note: z.string().nullable(),
  discountCodes: z.array(
    z.object({
      code: z.string(),
      applicable: z.boolean(),
    }),
  ),
  cost: z.object({
    subtotalAmount: moneySchema,
    totalAmount: moneySchema,
  }),
  lines: z.object({
    nodes: z.array(cartLineSchema),
  }),
});

export const cartSnapshotSchema = cartSchema.omit({ id: true });

export const cartResponseSchema = z.object({
  cart: cartSchema.nullable(),
});

const cartUserErrorSchema = z.object({
  code: z.string().nullable(),
  field: z.array(z.string()).nullable(),
  message: z.string(),
});

const cartWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  target: z.string(),
});

const cartMutationPayloadSchema = z.object({
  cart: cartSchema.nullable(),
  userErrors: z.array(cartUserErrorSchema),
  warnings: z.array(cartWarningSchema),
});

export const cartCreateResponseSchema = z.object({
  cartCreate: cartMutationPayloadSchema.nullable(),
});

export const cartLinesAddResponseSchema = z.object({
  cartLinesAdd: cartMutationPayloadSchema.nullable(),
});

export const cartLinesUpdateResponseSchema = z.object({
  cartLinesUpdate: cartMutationPayloadSchema.nullable(),
});

export const cartLinesRemoveResponseSchema = z.object({
  cartLinesRemove: cartMutationPayloadSchema.nullable(),
});

export const cartNoteUpdateResponseSchema = z.object({
  cartNoteUpdate: cartMutationPayloadSchema.nullable(),
});

export const cartDiscountCodesUpdateResponseSchema = z.object({
  cartDiscountCodesUpdate: cartMutationPayloadSchema.nullable(),
});

export const cartBuyerIdentityUpdateResponseSchema = z.object({
  cartBuyerIdentityUpdate: cartMutationPayloadSchema.nullable(),
});

export type Cart = z.infer<typeof cartSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;
export type CartSnapshot = z.infer<typeof cartSnapshotSchema>;
export type CartMutationPayload = z.infer<typeof cartMutationPayloadSchema>;
