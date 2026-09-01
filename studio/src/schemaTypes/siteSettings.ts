import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      description: "Used when no logo is uploaded. Shopify's store name is the final fallback.",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the logo for assistive technology.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return !parent?.asset || value?.trim()
                ? true
                : "Alternative text is required when a logo is uploaded.";
            }),
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO and social sharing",
      type: "seoSettings",
      description:
        "Global search and sharing defaults. Shopify remains the source of product and collection SEO fields.",
    }),
    defineField({
      name: "navigation",
      title: "Primary navigation",
      type: "array",
      of: [defineArrayMember({ type: "navigationItem" })],
      validation: (rule) => rule.max(10),
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "footerSettings",
    }),
  ],
  preview: {
    select: { title: "siteName", media: "logo" },
    prepare({ title, media }) {
      return {
        title: title || "Site settings",
        subtitle: "Header, footer, and SEO defaults",
        media,
      };
    },
  },
});
