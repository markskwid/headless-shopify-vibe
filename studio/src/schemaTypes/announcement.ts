import { BellIcon } from "@sanity/icons/Bell";
import { defineField, defineType } from "sanity";

type AnnouncementParent = {
  linkType?: "editorialPage" | "external" | "internal" | "none";
};

export const announcement = defineType({
  name: "announcement",
  title: "Announcement",
  type: "object",
  icon: BellIcon,
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "string",
      validation: (rule) => rule.required().min(1).max(160),
    }),
    defineField({
      name: "linkType",
      title: "Destination",
      type: "string",
      initialValue: "none",
      options: {
        layout: "radio",
        list: [
          { title: "No link", value: "none" },
          { title: "Editorial page", value: "editorialPage" },
          { title: "Internal store path", value: "internal" },
          { title: "External website URL", value: "external" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "editorialPage",
      title: "Editorial page",
      type: "reference",
      to: [{ type: "editorialPage" }],
      hidden: ({ parent }) =>
        (parent as AnnouncementParent | undefined)?.linkType !==
        "editorialPage",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as AnnouncementParent | undefined;
          return parent?.linkType !== "editorialPage" || value
            ? true
            : "Choose an editorial page.";
        }),
    }),
    defineField({
      name: "internalPath",
      title: "Internal path",
      type: "string",
      description: "Use / for Home, /collections/all for a store page, or #products for an anchor.",
      hidden: ({ parent }) =>
        (parent as AnnouncementParent | undefined)?.linkType !== "internal",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as AnnouncementParent | undefined;

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
      description: "Enter a complete HTTPS URL.",
      hidden: ({ parent }) =>
        (parent as AnnouncementParent | undefined)?.linkType !== "external",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as AnnouncementParent | undefined;

          if (parent?.linkType !== "external") return true;
          if (!value) return "Add an external URL.";

          try {
            return new URL(value).protocol === "https:"
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
        (parent as AnnouncementParent | undefined)?.linkType !== "external",
    }),
  ],
  preview: {
    select: {
      title: "text",
      linkType: "linkType",
      internalPath: "internalPath",
      externalUrl: "externalUrl",
      editorialPageTitle: "editorialPage.title",
    },
    prepare({ title, linkType, internalPath, externalUrl, editorialPageTitle }) {
      const destination =
        linkType === "editorialPage"
          ? `Page: ${editorialPageTitle || "Missing page"}`
          : linkType === "external"
            ? externalUrl
            : linkType === "internal"
              ? internalPath
              : "No link";

      return { title: title || "Untitled announcement", subtitle: destination };
    },
  },
});
