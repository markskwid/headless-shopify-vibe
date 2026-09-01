import { LinkIcon } from "@sanity/icons/Link";
import { defineType } from "sanity";

import { navigationLinkFields } from "./navigationFields";

export const bannerCta = defineType({
  name: "bannerCta",
  title: "Banner call to action",
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
        title: title || "Untitled call to action",
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
