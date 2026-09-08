"use client";

import { UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccountMenu({ accountUrl }: { accountUrl: string }) {
  return (
    <a
      href={accountUrl}
      aria-label="Customer account"
      rel="nofollow"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-9 rounded-full sm:size-10",
      )}
    >
      <UserRound aria-hidden="true" />
    </a>
  );
}
