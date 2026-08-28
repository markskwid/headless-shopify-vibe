import { redirect } from "next/navigation";

import { hasCustomerSession } from "@/lib/shopify/services/customer-session";

export default async function LoginAliasPage() {
  redirect(
    (await hasCustomerSession()) ? "/account" : "/account/login",
  );
}
