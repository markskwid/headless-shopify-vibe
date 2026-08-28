"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, PackageOpen, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/commerce/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import type {
  CartLine,
  CartSnapshot,
} from "@/lib/shopify/schemas/cart";
import { getCartSubtotal } from "@/lib/shopify/utils/cart-pricing";
import { formatMoney } from "@/lib/shopify/utils/format-money";
import { cn } from "@/lib/utils";

function linePrices(line: CartLine) {
  const lineSubtotal = Number(line.cost.subtotalAmount.amount);
  const compareAt = line.cost.compareAtAmountPerQuantity
    ? Number(line.cost.compareAtAmountPerQuantity.amount) * line.quantity
    : 0;
  const original = Math.max(lineSubtotal, compareAt);
  const current = Number(line.cost.totalAmount.amount);

  return {
    original,
    current,
    currencyCode: line.cost.totalAmount.currencyCode,
    discounted: current < original - 0.005,
  };
}

function variantLabel(line: CartLine) {
  if (
    line.merchandise.title === "Default Title" ||
    !line.merchandise.selectedOptions.length
  ) {
    return null;
  }

  return line.merchandise.selectedOptions
    .map((option) => option.value)
    .join(" / ");
}

export function CartMessages() {
  const { error, warning, dismissMessage } = useCart();

  if (!error && !warning) return null;

  return (
    <button
      type="button"
      onClick={dismissMessage}
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-left text-xs leading-5",
        error
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-border bg-muted text-muted-foreground",
      )}
      aria-live="polite"
    >
      {error ?? warning} <span className="underline">Dismiss</span>
    </button>
  );
}

export function CartEmptyState({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "min-h-80 px-6 py-12" : "min-h-[50svh] px-5 py-20",
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <PackageOpen className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">
        Your cart is empty
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Discover something you love and add it to your bag.
      </p>
      <Link
        href="/collections/all"
        onClick={onNavigate}
        className={cn(buttonVariants({ size: "lg" }), "mt-6")}
      >
        Shop all products
      </Link>
    </div>
  );
}

function QuantityControls({
  line,
  roomy = false,
}: {
  line: CartLine;
  roomy?: boolean;
}) {
  const { isPending, updateItem, removeItem } = useCart();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border bg-background",
        roomy && "h-10",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={roomy ? "icon" : "icon-sm"}
        className="rounded-full"
        disabled={isPending}
        onClick={() =>
          void (line.quantity === 1
            ? removeItem(line.id)
            : updateItem(line.id, line.quantity - 1))
        }
        aria-label={
          line.quantity === 1
            ? `Remove ${line.merchandise.product.title}`
            : `Decrease ${line.merchandise.product.title} quantity`
        }
      >
        <Minus aria-hidden="true" />
      </Button>
      <span className="min-w-8 text-center text-xs font-medium tabular-nums">
        {line.quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size={roomy ? "icon" : "icon-sm"}
        className="rounded-full"
        disabled={isPending || !line.merchandise.availableForSale}
        onClick={() => void updateItem(line.id, line.quantity + 1)}
        aria-label={`Increase ${line.merchandise.product.title} quantity`}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}

function LinePrice({ line, className }: { line: CartLine; className?: string }) {
  const prices = linePrices(line);

  return (
    <div className={cn("text-sm", className)}>
      {prices.discounted ? (
        <span className="mr-2 text-xs text-muted-foreground line-through">
          {formatMoney(prices.original, prices.currencyCode)}
        </span>
      ) : null}
      <span className="font-medium">
        {formatMoney(prices.current, prices.currencyCode)}
      </span>
    </div>
  );
}

function LineProduct({
  line,
  imageSize = "size-20",
}: {
  line: CartLine;
  imageSize?: string;
}) {
  const optionLabel = variantLabel(line);

  return (
    <div className="flex min-w-0 gap-3">
      <Link
        href={`/products/${line.merchandise.product.handle}`}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          imageSize,
        )}
      >
        {line.merchandise.image ? (
          <Image
            src={line.merchandise.image.url}
            alt={
              line.merchandise.image.altText ??
              line.merchandise.product.title
            }
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <span className="grid h-full place-items-center text-muted-foreground">
            <PackageOpen className="size-5" aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className="min-w-0 py-0.5">
        <Link
          href={`/products/${line.merchandise.product.handle}`}
          className="line-clamp-2 text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {line.merchandise.product.title}
        </Link>
        {optionLabel ? (
          <p className="mt-1 text-xs text-muted-foreground">{optionLabel}</p>
        ) : null}
        {!line.merchandise.availableForSale ? (
          <p className="mt-1 text-xs text-destructive">Unavailable</p>
        ) : null}
      </div>
    </div>
  );
}

export function CartCompactList({ cart }: { cart: CartSnapshot }) {
  const { isPending, removeItem } = useCart();

  return (
    <ul className="divide-y" aria-label="Cart products">
      {cart.lines.nodes.map((line) => (
        <li key={line.id} className="px-5 py-6">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-x-4">
            <Link
              href={`/products/${line.merchandise.product.handle}`}
              className="relative size-20 overflow-hidden rounded-xl bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-24"
            >
              {line.merchandise.image ? (
                <Image
                  src={line.merchandise.image.url}
                  alt={
                    line.merchandise.image.altText ??
                    line.merchandise.product.title
                  }
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="grid h-full place-items-center text-muted-foreground">
                  <PackageOpen className="size-5" aria-hidden="true" />
                </span>
              )}
            </Link>

            <div className="min-w-0">
              <Link
                href={`/products/${line.merchandise.product.handle}`}
                className="line-clamp-2 text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-base"
              >
                {line.merchandise.product.title}
              </Link>
              {variantLabel(line) ? (
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {variantLabel(line)}
                </p>
              ) : null}
              <LinePrice line={line} className="mt-2 text-base" />
            </div>

            <div className="col-start-2 flex shrink-0 items-center gap-1 sm:col-start-3 sm:row-start-1 sm:gap-2">
              <QuantityControls line={line} roomy />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => void removeItem(line.id)}
                aria-label={`Remove ${line.merchandise.product.title}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartTable({ cart }: { cart: CartSnapshot }) {
  const { isPending, removeItem } = useCart();

  return (
    <table className="block w-full sm:table">
      <thead className="hidden border-b text-left text-xs tracking-wide text-muted-foreground uppercase sm:table-header-group">
        <tr>
          <th className="pb-3 font-medium">Product</th>
          <th className="pb-3 font-medium">Price</th>
          <th className="pb-3 text-center font-medium">Quantity</th>
          <th className="pb-3 text-right font-medium">Total</th>
          <th className="w-10 pb-3">
            <span className="sr-only">Remove</span>
          </th>
        </tr>
      </thead>
      <tbody className="block divide-y sm:table-row-group">
        {cart.lines.nodes.map((line) => {
          const unitPrice = line.cost.amountPerQuantity;

          return (
            <tr
              key={line.id}
              className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-4 py-6 sm:table-row"
            >
              <td className="col-span-2 block sm:table-cell sm:py-6 sm:pr-6">
                <LineProduct line={line} imageSize="size-24 sm:size-28" />
              </td>
              <td className="hidden sm:table-cell sm:py-6 sm:pr-6 sm:align-middle">
                <span className="text-sm">
                  {formatMoney(unitPrice.amount, unitPrice.currencyCode)}
                </span>
              </td>
              <td className="block sm:table-cell sm:py-6 sm:pr-6 sm:text-center sm:align-middle">
                <QuantityControls line={line} />
              </td>
              <td className="block self-center text-right sm:table-cell sm:py-6 sm:align-middle">
                <LinePrice line={line} />
              </td>
              <td className="col-span-2 block text-right sm:table-cell sm:py-6 sm:pl-2 sm:align-middle">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => void removeItem(line.id)}
                  aria-label={`Remove ${line.merchandise.product.title}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function CartTotals({
  cart,
  showViewCart = false,
  onNavigate,
}: {
  cart: CartSnapshot;
  showViewCart?: boolean;
  onNavigate?: () => void;
}) {
  const subtotal = getCartSubtotal(cart);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">Subtotal</span>
        <div className="text-right">
          {subtotal.hasDiscount ? (
            <span className="mr-2 text-sm text-muted-foreground line-through">
              {formatMoney(subtotal.originalAmount, subtotal.currencyCode)}
            </span>
          ) : null}
          <span className="text-base font-semibold">
            {formatMoney(subtotal.discountedAmount, subtotal.currencyCode)}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Taxes and shipping are calculated and applied at checkout.
      </p>
      <div className={cn("mt-5 grid gap-2", showViewCart && "sm:grid-cols-2")}>
        {showViewCart ? (
          <Link
            href="/cart"
            onClick={onNavigate}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            View cart
          </Link>
        ) : null}
        <a
          href={cart.checkoutUrl}
          className={buttonVariants({ size: "lg" })}
        >
          Checkout
        </a>
      </div>
    </div>
  );
}
