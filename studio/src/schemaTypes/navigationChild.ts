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
      editorialPageTitle: "editorialPage.title",
    },
    prepare({ title, internalPath, externalUrl, editorialPageTitle }) {
      return {
        title: title || "Untitled child link",
        subtitle: editorialPageTitle
          ? `Page: ${editorialPageTitle}`
          : internalPath || externalUrl || "Missing destination",
      };
    },
  },
});
