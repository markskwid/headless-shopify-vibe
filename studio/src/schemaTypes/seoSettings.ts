import { defineField, defineType } from "sanity";

export const seoSettings = defineType({
  name: "seoSettings",
  title: "SEO defaults",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Default title",
      type: "string",
      description:
        "Used on the homepage and as the fallback browser title. Product and collection SEO titles remain managed in Shopify.",
      validation: (rule) => rule.max(60).warning("Keep titles near 60 characters so search results are less likely to truncate them."),
    }),
    defineField({
      name: "description",
      title: "Default description",
      type: "text",
      rows: 3,
      description:
        "Used when a page does not provide a more specific description.",
      validation: (rule) => rule.max(160).warning("Keep descriptions near 160 characters so search results are less likely to truncate them."),
    }),
    defineField({
      name: "socialImage",
      title: "Default social sharing image",
      type: "image",
      description: "Recommended size: 1200 × 630 pixels.",
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
  ],
});
