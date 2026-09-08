import { redirect } from "next/navigation";

import { getHostedCustomerAccountUrl } from "@/lib/shopify/services/customer-account";

export default function LoginPage() {
  redirect(getHostedCustomerAccountUrl());
}
