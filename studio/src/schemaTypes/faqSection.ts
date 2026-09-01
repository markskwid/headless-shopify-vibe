import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { defineArrayMember, defineField, defineType } from "sanity";

export const faqSection = defineType({
  name: "faqSection",
  title: "Frequently asked questions",
  type: "object",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      type: "string",
      initialValue: "Frequently asked questions",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Introduction",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [
        defineArrayMember({
          name: "faqItem",
          title: "Question and answer",
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required().max(180),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "editorialRichText",
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: "question" },
            prepare({ title }) {
              return { title: title || "Untitled question" };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(20),
    }),
  ],
  preview: {
    select: { title: "heading", items: "items" },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title || "Frequently asked questions",
        subtitle: `${count} ${count === 1 ? "question" : "questions"}`,
      };
    },
  },
});
