"use client";

import Image from "next/image";
import {
  CircleDollarSign,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Mail,
  MapPin,
  Megaphone,
  Package,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteCustomerAddressAction,
  logoutCustomerAction,
  setPrimaryCustomerAddressAction,
  type AddressActionState,
} from "@/app/(storefront)/account/actions";
import { AddressForm } from "@/components/account/address-form";
import { CustomerDetailsDialog } from "@/components/account/customer-details-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Customer,
  CustomerAddress,
  CustomerOrder,
} from "@/lib/shopify/schemas/customer";
import { getFulfilledOrderCount } from "@/lib/shopify/utils/customer-orders";
import { cn } from "@/lib/utils";

const initialAddressState: AddressActionState = {
  message: null,
  fieldErrors: {},
  success: false,
};

const terminalFulfillmentStatuses = new Set(["FULFILLED", "RESTOCKED"]);
const terminalFinancialStatuses = new Set(["REFUNDED", "VOIDED"]);

function humanizeStatus(status: string | null) {
  if (!status) return "Not available";

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getSpendTotals(orders: CustomerOrder[]) {
  const totals = new Map<string, number>();

  for (const order of orders) {
    const { amount, currencyCode } = order.totalPrice;
    const refunded =
      order.totalRefunded.currencyCode === currencyCode
        ? Number(order.totalRefunded.amount)
        : 0;
    const netAmount = Math.max(0, Number(amount) - refunded);
    totals.set(currencyCode, (totals.get(currencyCode) ?? 0) + netAmount);
  }

  return [...totals.entries()].map(([currencyCode, amount]) =>
    formatMoney(String(amount), currencyCode),
  );
}

function isPendingOrder(order: CustomerOrder) {
  return (
    !terminalFulfillmentStatuses.has(order.fulfillmentStatus) &&
    !terminalFinancialStatuses.has(order.financialStatus ?? "")
  );
}

function AddressLines({ address }: { address: CustomerAddress }) {
  const recipient = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <address className="not-italic">
      {recipient ? <span className="block font-medium">{recipient}</span> : null}
      {address.company ? <span className="block">{address.company}</span> : null}
      {address.formatted.map((line, index) => (
        <span className="block" key={`${line}-${index}`}>
          {line}
        </span>
      ))}
      {address.phone ? <span className="mt-1 block">{address.phone}</span> : null}
    </address>
  );
}

function OrderItems({ order }: { order: CustomerOrder }) {
  return (
    <ul className="mt-4 divide-y border-t">
      {order.lineItems.nodes.map((item, index) => {
        const image = item.variant?.image;

        return (
          <li
            key={`${item.title}-${index}`}
            className="flex items-center gap-3 py-2.5"
          >
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-secondary">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.altText || item.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <Package
                  className="absolute inset-0 m-auto size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="min-w-0 flex-1 truncate text-xs font-medium">
              {item.title}
            </p>
            <p className="shrink-0 text-xs font-medium tabular-nums">
              {formatMoney(
                item.discountedTotalPrice.amount,
                item.discountedTotalPrice.currencyCode,
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function OrdersDialog({ orders }: { orders: CustomerOrder[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        Show all orders
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(88dvh,48rem)] flex-col overflow-hidden">
        <div className="border-b px-5 py-5 pr-14 sm:px-7">
          <DialogTitle>Order history</DialogTitle>
          <DialogDescription className="mt-1">
            {orders.length
              ? `${orders.length} order${orders.length === 1 ? "" : "s"} available.`
              : "No orders yet."}
          </DialogDescription>
        </div>
        <div className="overflow-y-auto p-5 sm:p-7">
          {orders.length ? (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatOrderDate(order.processedAt)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatMoney(
                        order.currentTotalPrice.amount,
                        order.currentTotalPrice.currencyCode,
                      )}
                    </p>
                  </div>

                  <OrderItems order={order} />

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-2.5 py-1">
                      {humanizeStatus(order.financialStatus)}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1">
                      {humanizeStatus(order.fulfillmentStatus)}
                    </span>
                    <a
                      href={order.statusUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                    >
                      View order
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
              Your orders will appear here after checkout.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrimaryAddressSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
      ) : (
        <MapPin aria-hidden="true" />
      )}
      {pending ? "Updating…" : "Make primary"}
    </Button>
  );
}

function SetPrimaryAddressForm({ addressId }: { addressId: string }) {
  const [state, action] = useActionState(
    setPrimaryCustomerAddressAction,
    initialAddressState,
  );

  return (
    <form action={action}>
      <input type="hidden" name="addressId" value={addressId} />
      <PrimaryAddressSubmitButton />
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          className={cn(
            "mt-2 text-xs",
            state.success ? "text-emerald-700 dark:text-emerald-300" : "text-destructive",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function DeleteAddressSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
      ) : (
        <Trash2 aria-hidden="true" />
      )}
      {pending ? "Deleting…" : "Delete address"}
    </Button>
  );
}

function DeleteAddressDialog({ address }: { address: CustomerAddress }) {
  const [state, action] = useActionState(
    deleteCustomerAddressAction,
    initialAddressState,
  );
  const recipient = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${recipient ? `${recipient}'s` : "this"} address`}
          />
        }
      >
        <Trash2 aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 sm:p-7">
        <DialogTitle>Delete this address?</DialogTitle>
        <DialogDescription className="mt-2">
          This removes the saved address from your account. This action cannot
          be undone.
        </DialogDescription>
        <form action={action} className="mt-6">
          <input type="hidden" name="addressId" value={address.id} />
          {state.message && !state.success ? (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <DeleteAddressSubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddressesDialog({
  addresses,
  defaultAddressId,
}: {
  addresses: CustomerAddress[];
  defaultAddressId: string | null;
}) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );

  function startNewAddress() {
    setEditingAddress(null);
    setShowForm(true);
  }

  function startEditing(address: CustomerAddress) {
    setEditingAddress(address);
    setShowForm(true);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        Show all addresses
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90dvh,52rem)] flex-col overflow-hidden">
        <div className="border-b px-5 py-5 pr-14 sm:px-7">
          <DialogTitle>Shipping addresses</DialogTitle>
          <DialogDescription className="mt-1">
            Review, edit, or change your primary shipping address.
          </DialogDescription>
        </div>
        <div className="overflow-y-auto p-5 sm:p-7">
          {addresses.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => {
                const isDefault = address.id === defaultAddressId;

                return (
                  <li
                    key={address.id}
                    className="relative rounded-xl border p-4 text-sm leading-6"
                  >
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit address"
                        onClick={() => startEditing(address)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <DeleteAddressDialog address={address} />
                    </div>
                    <div className="pr-16">
                      <AddressLines address={address} />
                    </div>
                    <div className="mt-4">
                      {isDefault ? (
                        <span className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          Primary
                        </span>
                      ) : (
                        <SetPrimaryAddressForm addressId={address.id} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl bg-secondary/50 p-5 text-sm text-muted-foreground">
              No saved addresses yet.
            </p>
          )}

          {!showForm ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="mt-5"
              onClick={startNewAddress}
            >
              <Plus aria-hidden="true" />
              Add a new address
            </Button>
          ) : (
            <AddressForm
              key={editingAddress?.id ?? "new-address"}
              address={editingAddress}
              isDefault={editingAddress?.id === defaultAddressId}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AccountDashboard({ customer }: { customer: Customer }) {
  const orders = customer.orders.nodes;
  const fulfilledOrderCount = getFulfilledOrderCount(orders);
  const pendingOrders = orders.filter(isPendingOrder);
  const spendTotals = getSpendTotals(orders);
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Customer account
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {name ? `Welcome, ${customer.firstName ?? name}` : "Your account"}
          </h1>
        </div>
        <form action={logoutCustomerAction}>
          <button
            type="submit"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Overview
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Your orders
            </h2>
          </div>
          <OrdersDialog orders={orders} />
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <PackageCheck className="size-4" aria-hidden="true" />
              Total fulfilled orders
            </dt>
            <dd className="mt-3 text-3xl font-semibold tracking-tight">
              {fulfilledOrderCount}
            </dd>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleDollarSign className="size-4" aria-hidden="true" />
              Total spent
            </dt>
            <dd className="mt-3 text-xl font-semibold tracking-tight">
              {spendTotals.length
                ? spendTotals.map((total) => (
                    <span key={total} className="block">{total}</span>
                  ))
                : "No spend yet"}
            </dd>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" aria-hidden="true" />
              Pending orders
            </dt>
            <dd className="mt-3 text-3xl font-semibold tracking-tight">
              {pendingOrders.length}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Account details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact details and primary shipping information.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CustomerDetailsDialog
              firstName={customer.firstName}
              lastName={customer.lastName}
              phone={customer.phone}
              acceptsMarketing={customer.acceptsMarketing}
            />
            <AddressesDialog
              addresses={customer.addresses.nodes}
              defaultAddressId={customer.defaultAddress?.id ?? null}
            />
          </div>
        </div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-secondary/60 p-4">
            <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <UserRound className="size-4" aria-hidden="true" /> Name
            </dt>
            <dd className="mt-2 font-medium">{name || "Not provided"}</dd>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Mail className="size-4" aria-hidden="true" /> Email
            </dt>
            <dd className="mt-2 break-all font-medium">
              {customer.email || "Not provided"}
            </dd>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Phone className="size-4" aria-hidden="true" /> Phone
            </dt>
            <dd className="mt-2 font-medium">
              {customer.phone || "Not provided"}
            </dd>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Megaphone className="size-4" aria-hidden="true" /> Email marketing
            </dt>
            <dd className="mt-2 font-medium">
              {customer.acceptsMarketing ? "Subscribed" : "Not subscribed"}
            </dd>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <MapPin className="size-4" aria-hidden="true" /> Primary shipping address
            </dt>
            <dd className="mt-3 text-sm leading-6">
              {customer.defaultAddress ? (
                <AddressLines address={customer.defaultAddress} />
              ) : (
                <span className="text-muted-foreground">
                  No primary shipping address saved.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
