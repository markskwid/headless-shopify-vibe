import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";

export const contactSection = defineType({
  name: "contactSection",
  title: "Contact details",
  type: "object",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description: "Include the country code when possible.",
      validation: (rule) =>
        rule.regex(/^\+?[0-9 ()-]{7,24}$/, {
          name: "phone number",
          invert: false,
        }),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "businessHours",
      title: "Business hours",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const section = value as
        | { email?: string; phone?: string; address?: string; businessHours?: string }
        | undefined;
      return section?.email || section?.phone || section?.address || section?.businessHours
        ? true
        : "Add at least one contact method, address, or business-hours value.";
    }),
  preview: {
    select: { title: "heading", subtitle: "email" },
    prepare({ title, subtitle }) {
      return { title: title || "Contact details", subtitle: subtitle || "Contact section" };
    },
  },
});
