"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ProductBackLink() {
  const router = useRouter();

  return (
    <Link
      href="/"
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        if (window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
      className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back
    </Link>
  );
}
