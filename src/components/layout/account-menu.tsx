"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, UserPlus, UserRound } from "lucide-react";

import { logoutCustomerAction } from "@/app/(storefront)/account/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccountMenu({ authenticated }: { authenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Customer account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9 rounded-full sm:size-10",
        )}
      >
        <UserRound aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-52 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl"
        >
          {authenticated ? (
            <>
              <Link
                href="/account"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <UserRound className="size-4" aria-hidden="true" />
                My account
              </Link>
              <form action={logoutCustomerAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/account/login"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <LogIn className="size-4" aria-hidden="true" />
                Sign in
              </Link>
              <Link
                href="/account/register"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <UserPlus className="size-4" aria-hidden="true" />
                Create account
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
