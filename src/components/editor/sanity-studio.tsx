"use client";

import { useMemo } from "react";
import { NextStudio } from "next-sanity/studio/client-component";

import { createStudioConfig } from "../../../studio/createConfig";

type SanityStudioProps = {
  projectId: string;
  dataset: string;
};

export function SanityStudio({ projectId, dataset }: SanityStudioProps) {
  const config = useMemo(
    () => createStudioConfig({ projectId, dataset, basePath: "/studio" }),
    [dataset, projectId],
  );

  return <NextStudio config={config} />;
}
