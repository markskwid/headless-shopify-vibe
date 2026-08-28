import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";
import { RecoverPasswordForm } from "@/components/account/account-forms";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request password reset instructions for your customer account.",
};

export default function ForgotPasswordPage() {
  return (
    <AccountShell
      title="Reset your password"
      description="Enter your account email and Shopify will send reset instructions if a matching account exists."
    >
      <RecoverPasswordForm />
    </AccountShell>
  );
}
