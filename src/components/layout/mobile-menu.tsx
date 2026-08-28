"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import { HeaderBrand } from "@/components/layout/header-brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { HeaderNavigationItem } from "@/lib/sanity/schemas";

type MobileMenuProps = {
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
  name: string;
  navigation: HeaderNavigationItem[];
};

function linkTarget(item: Pick<HeaderNavigationItem, "openInNewTab">) {
  return item.openInNewTab
    ? { target: "_blank", rel: "noreferrer" }
    : {};
}

function ClosingLink({
  item,
  className,
  children,
}: {
  item: Pick<HeaderNavigationItem, "href" | "openInNewTab">;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <SheetClose
      nativeButton={false}
      render={
        <Link
          href={item.href}
          className={className}
          {...linkTarget(item)}
        />
      }
    >
      {children}
    </SheetClose>
  );
}

export function MobileMenu({ logo, name, navigation }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 justify-self-start rounded-full sm:size-10"
          />
        }
      >
        <Menu aria-hidden="true" />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(88vw,22rem)] gap-0 p-0"
      >
        <SheetHeader className="min-h-(--header-height) justify-center border-b px-5 py-3">
          <SheetTitle className="sr-only">Primary navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse the store navigation.
          </SheetDescription>
          <HeaderBrand logo={logo} name={name} className="max-w-[15rem]" />
        </SheetHeader>
        <nav aria-label="Mobile primary" className="overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {navigation.map((item) =>
              item.children.length ? (
                <li key={item._key}>
                  <details className="group/nav">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-base font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDown className="size-4 transition-transform group-open/nav:rotate-180" />
                    </summary>
                    <div className="ml-3 space-y-1 border-l pl-3">
                      <ClosingLink
                        item={item}
                        className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        View all {item.label}
                      </ClosingLink>
                      {item.children.map((child) => (
                        <ClosingLink
                          key={child._key}
                          item={child}
                          className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {child.label}
                        </ClosingLink>
                      ))}
                    </div>
                  </details>
                </li>
              ) : (
                <li key={item._key}>
                  <ClosingLink
                    item={item}
                    className="block min-h-11 rounded-lg px-3 py-2.5 text-base font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </ClosingLink>
                </li>
              ),
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
