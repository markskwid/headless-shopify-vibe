import Link from "next/link";
import { connection } from "next/server";
import { ChevronDown, Search, ShoppingBag, UserRound } from "lucide-react";

import { HeaderActions } from "@/components/layout/header-actions";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { HeaderBrand } from "@/components/layout/header-brand";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { buttonVariants } from "@/components/ui/button";
import { getHeaderSettings } from "@/lib/sanity";
import type { HeaderNavigationItem } from "@/lib/sanity/schemas";
import {
  getHostedCustomerAccountUrl,
  getStorefrontIdentity,
} from "@/lib/shopify";
import { cn } from "@/lib/utils";

const defaultNavigation: HeaderNavigationItem[] = [
  {
    _key: "home",
    label: "Home",
    href: "/",
    openInNewTab: false,
    children: [],
  },
  {
    _key: "products",
    label: "Products",
    href: "/#products",
    openInNewTab: false,
    children: [],
  },
];

function navigationTarget(item: HeaderNavigationItem) {
  return item.openInNewTab
    ? { target: "_blank", rel: "noreferrer" }
    : {};
}

function DesktopNavigation({
  navigation,
}: {
  navigation: HeaderNavigationItem[];
}) {
  return (
    <nav aria-label="Primary" className="justify-self-center">
      <ul className="flex items-center gap-1">
        {navigation.map((item) => (
          <li key={item._key} className="group/nav relative">
            <Link
              href={item.href}
              className="flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-haspopup={item.children.length ? "menu" : undefined}
              {...navigationTarget(item)}
            >
              {item.label}
              {item.children.length ? (
                <ChevronDown
                  className="size-3.5 transition-transform group-hover/nav:rotate-180 group-focus-within/nav:rotate-180"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
            {item.children.length ? (
              <div className="pointer-events-none invisible absolute top-full left-1/2 z-50 w-56 -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] group-hover/nav:pointer-events-auto group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:pointer-events-auto group-focus-within/nav:visible group-focus-within/nav:opacity-100">
                <ul className="rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg">
                  {item.children.map((child) => (
                    <li key={child._key}>
                      <Link
                        href={child.href}
                        className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        {...navigationTarget({ ...item, ...child, children: [] })}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function SiteHeader() {
  await connection();

  const [sanityResult, shopifyResult, customerAccountUrlResult] =
    await Promise.allSettled([
      getHeaderSettings(),
      getStorefrontIdentity(),
      Promise.resolve().then(getHostedCustomerAccountUrl),
    ]);
  const settings =
    sanityResult.status === "fulfilled" ? sanityResult.value : null;
  const shopName =
    shopifyResult.status === "fulfilled"
      ? shopifyResult.value.shop.name
      : "Headless Vibe";
  const name = settings?.siteName || shopName;
  const navigation = settings?.navigation.length
    ? settings.navigation
    : defaultNavigation;
  const logo = settings?.logo ?? null;
  const accountUrl =
    customerAccountUrlResult.status === "fulfilled"
      ? customerAccountUrlResult.value
      : "/account/login";

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
      <AnnouncementBar announcements={settings?.announcements ?? []} />
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="hidden h-(--header-height) grid-cols-[1fr_auto_1fr] items-center lg:grid">
          <HeaderBrand logo={logo} name={name} className="justify-self-start" />
          <DesktopNavigation navigation={navigation} />
          <HeaderActions accountUrl={accountUrl} />
        </div>
        <div className="grid h-(--header-height) grid-cols-[1fr_minmax(0,auto)_1fr] items-center lg:hidden">
          <MobileMenu logo={logo} name={name} navigation={navigation} />
          <HeaderBrand
            logo={logo}
            name={name}
            className="max-w-20 justify-self-center sm:max-w-48 [&_img]:max-w-full"
          />
          <HeaderActions accountUrl={accountUrl} />
        </div>
      </div>
    </header>
  );
}

export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid h-(--header-height) w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 lg:px-8">
        <span className="size-8 animate-pulse rounded-full bg-muted lg:hidden" />
        <HeaderBrand
          logo={null}
          name="Headless Vibe"
          className="max-w-20 justify-self-center sm:max-w-48 lg:max-w-none lg:justify-self-start"
        />
        <div className="flex justify-self-end">
          <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
            <Search aria-hidden="true" />
          </span>
          <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
            <UserRound aria-hidden="true" />
          </span>
          <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
            <ShoppingBag aria-hidden="true" />
          </span>
        </div>
      </div>
    </header>
  );
}
