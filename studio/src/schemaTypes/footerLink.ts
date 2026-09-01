import { LinkIcon } from "@sanity/icons/Link";
import { defineType } from "sanity";

import { navigationLinkFields } from "./navigationFields";

export const footerLink = defineType({
  name: "footerLink",
  title: "Footer link",
  type: "object",
  icon: LinkIcon,
  fields: navigationLinkFields,
  preview: {
    select: {
      title: "label",
      linkType: "linkType",
      internalPath: "internalPath",
      externalUrl: "externalUrl",
      editorialPageTitle: "editorialPage.title",
    },
    prepare({ title, linkType, internalPath, externalUrl, editorialPageTitle }) {
      return {
        title: title || "Untitled link",
        subtitle:
          linkType === "editorialPage"
            ? `Page: ${editorialPageTitle || "Missing page"}`
            : linkType === "external"
              ? externalUrl
              : internalPath,
      };
    },
  },
});
