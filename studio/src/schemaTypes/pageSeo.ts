import { defineField, defineType } from "sanity";

export const pageSeo = defineType({
  name: "pageSeo",
  title: "Search and social sharing",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO title",
      type: "string",
      description: "Optional override. The page title is used when this is blank.",
      validation: (rule) =>
        rule.max(60).warning("Keep titles near 60 characters to reduce truncation."),
    }),
    defineField({
      name: "description",
      title: "SEO description",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning("Keep descriptions near 160 characters to reduce truncation."),
    }),
    defineField({
      name: "socialImage",
      title: "Social sharing image",
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
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description: "Excludes this page from the sitemap and adds noindex metadata.",
      initialValue: false,
    }),
  ],
});
