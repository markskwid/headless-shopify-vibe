import { PanelLeftIcon } from "@sanity/icons/PanelLeft";
import { defineArrayMember, defineField, defineType } from "sanity";

type SocialLinkValue = { platform?: string };

export const footerSettings = defineType({
  name: "footerSettings",
  title: "Footer",
  type: "object",
  icon: PanelLeftIcon,
  fields: [
    defineField({
      name: "logo",
      title: "Footer logo",
      type: "image",
      description: "Optional. The header logo and then the site name are used as fallbacks.",
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
                : "Alternative text is required when a footer logo is uploaded.";
            }),
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "socialLinks",
      title: "Social media",
      type: "array",
      of: [defineArrayMember({ type: "socialLink" })],
      validation: (rule) =>
        rule.max(6).custom((items: SocialLinkValue[] | undefined) => {
          if (!items) return true;
          const platforms = items
            .map((item) => item.platform)
            .filter((platform): platform is string => Boolean(platform));
          return new Set(platforms).size === platforms.length
            ? true
            : "Add each social platform only once.";
        }),
    }),
    defineField({
      name: "columns",
      title: "Link columns",
      type: "array",
      of: [defineArrayMember({ type: "footerColumn" })],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "newsletter",
      title: "Newsletter",
      type: "newsletterSettings",
    }),
  ],
});
