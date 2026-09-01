import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/account-shell";
import { RegisterForm } from "@/components/account/account-forms";
import { hasCustomerSession } from "@/lib/shopify/services/customer-session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a customer account for this store.",
  robots: "noindex, nofollow",
};

export default async function RegisterPage() {
  if (await hasCustomerSession()) redirect("/account");

  return (
    <AccountShell
      title="Create your account"
      description="Save your contact details and use the same account when you return to the store."
    >
      <RegisterForm />
    </AccountShell>
  );
}
