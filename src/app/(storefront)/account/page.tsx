import type { Metadata } from "next";
import { headers } from "next/headers";
import { UserRound } from "lucide-react";

import { logoutCustomerAction } from "@/app/(storefront)/account/actions";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { buttonVariants } from "@/components/ui/button";
import { getCustomer } from "@/lib/shopify/services/customer";
import { getCustomerAccessTokenFromCookies } from "@/lib/shopify/services/customer-session";
import { parseBuyerIp } from "@/lib/shopify/utils/buyer-ip";

export const metadata: Metadata = {
  title: "My account",
  description: "View your Shopify customer account details.",
  robots: "noindex, nofollow",
};

export default async function AccountPage() {
  const token = await getCustomerAccessTokenFromCookies();
  const requestHeaders = await headers();
  const buyerIp = parseBuyerIp(
    requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for"),
  );
  const customer = token ? await getCustomer(token, buyerIp) : null;

  if (!customer) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16 sm:px-8">
        <div className="w-full rounded-2xl border bg-card p-8 text-center sm:p-12">
          <UserRound className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">
            Your session is missing or has expired. Continue to sign in with
            your customer email and password.
          </p>
          <form action={logoutCustomerAction} className="mt-7">
            <button
              type="submit"
              className={buttonVariants({ size: "lg" })}
            >
              Continue to sign in
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <AccountDashboard customer={customer} />;
}
