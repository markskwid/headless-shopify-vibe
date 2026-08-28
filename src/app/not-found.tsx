import type { Metadata } from "next";

import { NotFoundContent } from "@/components/layout/not-found-content";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function GlobalNotFound() {
  return (
    <StorefrontShell>
      <NotFoundContent />
    </StorefrontShell>
  );
}
