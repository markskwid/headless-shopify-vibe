"use client";

import { useState, type FormEvent } from "react";
import { Tag, X } from "lucide-react";

import {
  CartEmptyState,
  CartMessages,
  CartTable,
  CartTotals,
} from "@/components/commerce/cart-components";
import { useCart } from "@/components/commerce/cart-provider";
import { Button } from "@/components/ui/button";

function CartForms({ note }: { note: string }) {
  const {
    cart,
    isPending,
    saveNote,
    applyDiscount,
    removeDiscount,
  } = useCart();
  const [noteValue, setNoteValue] = useState(note);
  const [discountCode, setDiscountCode] = useState("");

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveNote(noteValue);
  }

  async function submitDiscount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const applied = await applyDiscount(discountCode);
    if (applied) setDiscountCode("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submitNote}>
        <label htmlFor="cart-note" className="text-sm font-medium">
          Order note
        </label>
        <textarea
          id="cart-note"
          value={noteValue}
          onChange={(event) => setNoteValue(event.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="Add delivery or order instructions"
          className="mt-2 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          type="submit"
          variant="outline"
          className="mt-2"
          disabled={isPending || noteValue === (cart?.note ?? "")}
        >
          {isPending ? "Saving…" : "Save note"}
        </Button>
      </form>

      <form onSubmit={submitDiscount}>
        <label htmlFor="discount-code" className="text-sm font-medium">
          Discount code
        </label>
        <div className="mt-2 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Tag
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="discount-code"
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value)}
              maxLength={255}
              placeholder="Enter code"
              className="h-9 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !discountCode.trim()}
          >
            Apply
          </Button>
        </div>
        {cart?.discountCodes.length ? (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Discount codes">
            {cart.discountCodes.map((discount) => (
              <li
                key={discount.code}
                className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-1 text-xs"
              >
                <span className={discount.applicable ? "" : "line-through"}>
                  {discount.code}
                </span>
                <button
                  type="button"
                  onClick={() => void removeDiscount()}
                  disabled={isPending}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
                  aria-label={`Remove discount ${discount.code}`}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </form>
    </div>
  );
}

export function CartPage() {
  const { cart } = useCart();

  if (!cart?.lines.nodes.length) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Your cart
        </h1>
        <CartEmptyState />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <div className="flex items-end justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Shopping bag
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Your cart
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-label="Cart items">
          <CartTable cart={cart} />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-[calc(var(--site-header-height)+2rem)]">
          <CartMessages />
          <div className="rounded-xl border p-5">
            <CartForms key={cart.note ?? "empty-note"} note={cart.note ?? ""} />
          </div>
          <div className="rounded-xl border bg-secondary/40 p-5">
            <CartTotals cart={cart} />
          </div>
        </aside>
      </div>
    </main>
  );
}
