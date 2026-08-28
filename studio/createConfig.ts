import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./src/schemaTypes";
import { structure } from "./structure";

type StudioConfigOptions = {
  projectId: string;
  dataset: string;
  basePath?: string;
};

const singletonTypes = new Set(["homePage", "siteSettings"]);

export function createStudioConfig({
  projectId,
  dataset,
  basePath,
}: StudioConfigOptions) {
  return defineConfig({
    name: "default",
    title: "Headless Vibe Studio",
    projectId,
    dataset,
    basePath,
    plugins: [structureTool({ structure }), visionTool()],
    schema: { types: schemaTypes },
    document: {
      actions: (previousActions, context) =>
        singletonTypes.has(context.schemaType)
          ? previousActions.filter(
              ({ action }) =>
                action &&
                ["publish", "discardChanges", "restore"].includes(action),
            )
          : previousActions,
      newDocumentOptions: (previousOptions) =>
        previousOptions.filter(
          ({ templateId }) => !singletonTypes.has(templateId),
        ),
    },
  });
}
