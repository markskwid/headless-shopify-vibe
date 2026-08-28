import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";

export const newsletterSettings = defineType({
  name: "newsletterSettings",
  title: "Newsletter",
  type: "object",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Join our newsletter",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      initialValue: "Get product news, offers, and inspiration in your inbox.",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "emailPlaceholder",
      title: "Email placeholder",
      type: "string",
      initialValue: "Email address",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "buttonLabel",
      title: "Button label",
      type: "string",
      initialValue: "Subscribe",
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "consentNote",
      title: "Consent note",
      type: "string",
      initialValue: "By subscribing, you agree to receive marketing emails.",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
    prepare({ title, subtitle }) {
      return { title: title || "Newsletter", subtitle };
    },
  },
});
