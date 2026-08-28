"use client";

import dynamic from "next/dynamic";

type SanityStudioLoaderProps = {
  projectId: string;
  dataset: string;
};

const EmbeddedSanityStudio = dynamic(
  () =>
    import("@/components/editor/sanity-studio").then(
      (module) => module.SanityStudio,
    ),
  {
    ssr: false,
    loading: () => (
      <main className="grid min-h-screen place-items-center bg-muted/40">
        <p className="text-sm text-muted-foreground" role="status">
          Loading Sanity Studio…
        </p>
      </main>
    ),
  },
);

export function SanityStudioLoader(props: SanityStudioLoaderProps) {
  return <EmbeddedSanityStudio {...props} />;
}
