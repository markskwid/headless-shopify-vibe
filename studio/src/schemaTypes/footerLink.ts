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
    },
    prepare({ title, linkType, internalPath, externalUrl }) {
      return {
        title: title || "Untitled link",
        subtitle: linkType === "external" ? externalUrl : internalPath,
      };
    },
  },
});
