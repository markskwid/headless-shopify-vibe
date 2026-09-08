"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  addCartLineAction,
  removeCartDiscountAction,
  removeCartLineAction,
  updateCartDiscountAction,
  updateCartLineAction,
  updateCartNoteAction,
  type CartActionResult,
} from "@/app/(storefront)/cart/actions";
import type { CartSnapshot } from "@/lib/shopify/schemas/cart";

type CartContextValue = {
  cart: CartSnapshot | null;
  open: boolean;
  isPending: boolean;
  error: string | null;
  warning: string | null;
  setOpen: (open: boolean) => void;
  dismissMessage: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  updateItem: (lineId: string, quantity: number) => Promise<boolean>;
  removeItem: (lineId: string) => Promise<boolean>;
  saveNote: (note: string) => Promise<boolean>;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartSnapshot | null;
  children: ReactNode;
}) {
  const [cart, setCart] = useState(initialCart);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const runAction = useCallback(
    async (
      action: () => Promise<CartActionResult>,
      options?: { openCart?: boolean },
    ) => {
      if (pendingRef.current) return false;

      pendingRef.current = true;
      setIsPending(true);
      setError(null);
      setWarning(null);

      try {
        const result = await action();

        if (result.cart) setCart(result.cart);
        setError(result.error);
        setWarning(result.warning);

        if (options?.openCart) setOpen(true);
        return !result.error;
      } catch {
        setError("The cart could not be updated. Please try again.");
        if (options?.openCart) setOpen(true);
        return false;
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [],
  );

  const value: CartContextValue = {
    cart,
    open,
    isPending,
    error,
    warning,
    setOpen,
    dismissMessage: () => {
      setError(null);
      setWarning(null);
    },
    addItem: (merchandiseId, quantity = 1) =>
      runAction(
        () => addCartLineAction({ merchandiseId, quantity }),
        { openCart: true },
      ),
    updateItem: (lineId, quantity) =>
      runAction(() => updateCartLineAction({ lineId, quantity })),
    removeItem: (lineId) => runAction(() => removeCartLineAction(lineId)),
    saveNote: (note) => runAction(() => updateCartNoteAction(note)),
    applyDiscount: (code) =>
      runAction(() => updateCartDiscountAction(code)),
    removeDiscount: () => runAction(() => removeCartDiscountAction()),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
