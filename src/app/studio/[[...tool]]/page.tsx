import Link from "next/link";
import type { Metadata, Viewport } from "next";

import { SanityStudioLoader } from "@/components/editor/sanity-studio-loader";
import { getSanityConfig } from "@/lib/sanity/env";

export const metadata: Metadata = {
  referrer: "same-origin",
  robots: "noindex",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function StudioPage() {
  const configuration = getSanityConfig();

  if (!configuration.configured) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted/40 px-6 py-16">
        <section className="w-full max-w-xl rounded-2xl border bg-background p-8 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Sanity Studio setup
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Connect a Sanity project
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add your public Sanity project ID and dataset to the root
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-foreground">
              .env.local
            </code>
            file, restart the development server, then reload this page.
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {configuration.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Back to storefront
          </Link>
        </section>
      </main>
    );
  }

  return (
    <SanityStudioLoader
      projectId={configuration.config.projectId}
      dataset={configuration.config.dataset}
    />
  );
}
