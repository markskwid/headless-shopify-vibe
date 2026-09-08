"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { AccountMenu } from "@/components/layout/account-menu";
import { useCart } from "@/components/commerce/cart-provider";
import { PredictiveSearch } from "@/components/commerce/predictive-search";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeaderActions({
  accountUrl,
}: {
  accountUrl: string;
}) {
  const pathname = usePathname();
  const { cart, setOpen } = useCart();
  const quantity = cart?.totalQuantity ?? 0;
  const cartClassName = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "relative size-9 rounded-full sm:size-10",
  );
  const cartContent = (
    <>
      <ShoppingBag aria-hidden="true" />
      {quantity ? (
        <span className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-foreground px-1 text-[10px] leading-4 font-semibold text-background tabular-nums">
          {quantity > 99 ? "99+" : quantity}
        </span>
      ) : null}
    </>
  );

  return (
    <div className="flex items-center justify-self-end">
      <PredictiveSearch />
      <AccountMenu accountUrl={accountUrl} />
      {pathname === "/cart" ? (
        <Link
          href="/cart"
          aria-label={`Cart, ${quantity} ${quantity === 1 ? "item" : "items"}`}
          className={cartClassName}
        >
          {cartContent}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={`Open cart, ${quantity} ${quantity === 1 ? "item" : "items"}`}
          className={cartClassName}
          onClick={() => setOpen(true)}
        >
          {cartContent}
        </button>
      )}
    </div>
  );
}
