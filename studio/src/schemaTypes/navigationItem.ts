import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";

import { navigationLinkFields } from "./navigationFields";

export const navigationItem = defineType({
  name: "navigationItem",
  title: "Navigation item",
  type: "object",
  icon: LinkIcon,
  fields: [
    ...navigationLinkFields,
    defineField({
      name: "children",
      title: "Child links",
      type: "array",
      description: "Optional second-level links shown in the desktop dropdown and mobile accordion.",
      of: [defineArrayMember({ type: "navigationChild" })],
      validation: (rule) => rule.max(10),
    }),
  ],
  preview: {
    select: {
      title: "label",
      internalPath: "internalPath",
      externalUrl: "externalUrl",
      editorialPageTitle: "editorialPage.title",
      children: "children",
    },
    prepare({ title, internalPath, externalUrl, editorialPageTitle, children }) {
      const childCount = Array.isArray(children) ? children.length : 0;
      const destination = editorialPageTitle
        ? `Page: ${editorialPageTitle}`
        : internalPath || externalUrl || "Missing destination";

      return {
        title: title || "Untitled navigation item",
        subtitle: childCount
          ? `${destination} · ${childCount} child ${childCount === 1 ? "link" : "links"}`
          : destination,
      };
    },
  },
});
