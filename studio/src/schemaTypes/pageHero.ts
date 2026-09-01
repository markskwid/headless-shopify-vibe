import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

export const pageHero = defineType({
  name: "pageHero",
  title: "Page hero",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      validation: (rule) => rule.max(50),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().min(1).max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return !parent?.asset || value?.trim()
                ? true
                : "Alternative text is required when an image is uploaded.";
            }),
        }),
      ],
    }),
    defineField({
      name: "cta",
      title: "Optional call to action",
      type: "bannerCta",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow", media: "image" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Untitled page hero",
        subtitle: subtitle || "Page hero",
        media,
      };
    },
  },
});
