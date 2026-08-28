import { redirect } from "next/navigation";

import { hasCustomerSession } from "@/lib/shopify/services/customer-session";

export default async function RegisterAliasPage() {
  redirect(
    (await hasCustomerSession()) ? "/account" : "/account/register",
  );
}
