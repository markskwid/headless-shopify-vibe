import { defineField } from "sanity";

type NavigationLinkParent = {
  linkType?: "external" | "internal";
};

export const navigationLinkFields = [
  defineField({
    name: "label",
    title: "Label",
    type: "string",
    validation: (rule) => rule.required().min(1).max(40),
  }),
  defineField({
    name: "linkType",
    title: "Destination type",
    type: "string",
    initialValue: "internal",
    description: "Choose Internal path for storefront routes, including Home (/).",
    options: {
      layout: "radio",
      list: [
        { title: "Internal store path", value: "internal" },
        { title: "External website URL", value: "external" },
      ],
    },
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "internalPath",
    title: "Internal path",
    type: "string",
    description: "Use / for Home, /collections/all for a store page, or #products for an anchor.",
    hidden: ({ parent }) =>
      (parent as NavigationLinkParent | undefined)?.linkType !== "internal",
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as NavigationLinkParent | undefined;

        if (parent?.linkType !== "internal") return true;
        if (!value) return "Add an internal path.";
        if (
          (!value.startsWith("/") && !value.startsWith("#")) ||
          value.startsWith("//")
        ) {
          return "Internal paths must start with / or #.";
        }

        return true;
      }),
  }),
  defineField({
    name: "externalUrl",
    title: "External URL",
    type: "url",
    hidden: ({ parent }) =>
      (parent as NavigationLinkParent | undefined)?.linkType !== "external",
    description: "Enter a complete URL such as https://example.com. For / routes, choose Internal store path above.",
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as NavigationLinkParent | undefined;

        if (parent?.linkType !== "external") return true;
        if (!value) return "Add an external URL.";
        if (value.startsWith("/") || value.startsWith("#")) {
          return "Choose Internal store path for / routes and # anchors.";
        }

        try {
          const url = new URL(value);
          return url.protocol === "https:"
            ? true
            : "External URLs must start with https://.";
        } catch {
          return "Enter a complete external URL starting with https://.";
        }
      }),
  }),
  defineField({
    name: "openInNewTab",
    title: "Open in a new tab",
    type: "boolean",
    initialValue: false,
    hidden: ({ parent }) =>
      (parent as NavigationLinkParent | undefined)?.linkType !== "external",
  }),
];
