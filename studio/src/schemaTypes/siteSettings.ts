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
      name: "showAnnouncementBar",
      title: "Show announcement bar",
      type: "boolean",
      description:
        "Show published announcements above the header. Two or more announcements become an autoplaying carousel.",
      initialValue: false,
    }),
    defineField({
      name: "announcements",
      title: "Announcements",
      type: "array",
      description:
        "Add up to five announcements and drag them into the order customers should see.",
      of: [defineArrayMember({ type: "announcement" })],
      hidden: ({ document }) => document?.showAnnouncementBar !== true,
      validation: (rule) =>
        rule.max(5).custom((value, context) =>
          context.document?.showAnnouncementBar !== true || value?.length
            ? true
            : "Add at least one announcement before showing the bar.",
        ),
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
        subtitle: "Announcement bar, header, footer, and SEO defaults",
        media,
      };
    },
  },
});
