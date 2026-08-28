import { Suspense, type ReactNode } from "react";

import { CartDrawer } from "@/components/commerce/cart-drawer";
import { CartProvider } from "@/components/commerce/cart-provider";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/layout/site-header";
import {
  SiteFooter,
  SiteFooterFallback,
} from "@/components/layout/site-footer";
import { getCartSnapshotFromCookies } from "@/lib/shopify";

export async function StorefrontShell({ children }: { children: ReactNode }) {
  const cart = await getCartSnapshotFromCookies().catch(() => null);

  return (
    <CartProvider initialCart={cart}>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        {children}
        <Suspense fallback={<SiteFooterFallback />}>
          <SiteFooter />
        </Suspense>
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
