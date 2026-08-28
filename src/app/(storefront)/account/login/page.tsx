import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AccountShell } from "@/components/account/account-shell";
import { LoginForm } from "@/components/account/account-forms";
import { hasCustomerSession } from "@/lib/shopify/services/customer-session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your customer account.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await hasCustomerSession()) redirect("/account");

  const registered = z
    .object({
      registered: z.preprocess(
        (value) => (Array.isArray(value) ? value[0] : value),
        z.literal("1").optional(),
      ),
    })
    .loose()
    .safeParse(await searchParams);

  return (
    <AccountShell
      title="Welcome back"
      description="Sign in with the email and password attached to your Shopify customer account."
    >
      <LoginForm
        notice={
          registered.success && registered.data.registered
            ? "Your account was created. You can sign in now."
            : undefined
        }
      />
    </AccountShell>
  );
}
