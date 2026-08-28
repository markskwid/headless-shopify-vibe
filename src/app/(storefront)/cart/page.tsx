import type { Metadata } from "next";

import { CartPage } from "@/components/commerce/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  robots: "noindex, nofollow",
};

export default function CartRoute() {
  return <CartPage />;
}
