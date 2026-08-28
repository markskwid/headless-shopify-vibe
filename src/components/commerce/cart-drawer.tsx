"use client";

import {
  CartCompactList,
  CartEmptyState,
  CartMessages,
  CartTotals,
} from "@/components/commerce/cart-components";
import { useCart } from "@/components/commerce/cart-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const { cart, open, setOpen } = useCart();
  const hasItems = Boolean(cart?.lines.nodes.length);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full! data-[side=right]:sm:max-w-md!"
        aria-describedby="cart-drawer-description"
      >
        <SheetHeader className="min-h-(--header-height) justify-center border-b px-5 py-3">
          <SheetTitle className="pr-10 text-lg">
            Your cart{cart?.totalQuantity ? ` (${cart.totalQuantity})` : ""}
          </SheetTitle>
          <SheetDescription id="cart-drawer-description" className="sr-only">
            Review products in your cart and continue to checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {hasItems && cart ? (
            <>
              <div className="px-5 pt-4">
                <CartMessages />
              </div>
              <CartCompactList cart={cart} />
            </>
          ) : (
            <CartEmptyState compact onNavigate={() => setOpen(false)} />
          )}
        </div>

        {hasItems && cart ? (
          <SheetFooter className="border-t bg-background p-5">
            <CartTotals
              cart={cart}
              showViewCart
              onNavigate={() => setOpen(false)}
            />
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
