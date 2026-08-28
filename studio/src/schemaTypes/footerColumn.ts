import { ListIcon } from "@sanity/icons/List";
import { defineArrayMember, defineField, defineType } from "sanity";

export const footerColumn = defineType({
  name: "footerColumn",
  title: "Footer link column",
  type: "object",
  icon: ListIcon,
  fields: [
    defineField({
      name: "title",
      title: "Column title",
      type: "string",
      validation: (rule) => rule.required().min(1).max(40),
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [defineArrayMember({ type: "footerLink" })],
      validation: (rule) => rule.max(10),
    }),
  ],
  preview: {
    select: { title: "title", links: "links" },
    prepare({ title, links }) {
      const count = Array.isArray(links) ? links.length : 0;
      return {
        title: title || "Untitled column",
        subtitle: `${count} ${count === 1 ? "link" : "links"}`,
      };
    },
  },
});
