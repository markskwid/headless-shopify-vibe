import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { defineField, defineType } from "sanity";

export const richTextSection = defineType({
  name: "richTextSection",
  title: "Rich text section",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "body",
      title: "Content",
      type: "editorialRichText",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Rich text", subtitle: "Rich text section" };
    },
  },
});
