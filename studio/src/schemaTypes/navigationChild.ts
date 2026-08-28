import { LinkIcon } from "@sanity/icons/Link";
import { defineType } from "sanity";

import { navigationLinkFields } from "./navigationFields";

export const navigationChild = defineType({
  name: "navigationChild",
  title: "Child navigation link",
  type: "object",
  icon: LinkIcon,
  fields: navigationLinkFields,
  preview: {
    select: {
      title: "label",
      internalPath: "internalPath",
      externalUrl: "externalUrl",
    },
    prepare({ title, internalPath, externalUrl }) {
      return {
        title: title || "Untitled child link",
        subtitle: internalPath || externalUrl || "Missing destination",
      };
    },
  },
});
