import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { defineField, defineType } from "sanity";

export const calloutSection = defineType({
  name: "calloutSection",
  title: "Callout",
  type: "object",
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "cta",
      title: "Optional call to action",
      type: "bannerCta",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Untitled callout", subtitle: "Callout" };
    },
  },
});
