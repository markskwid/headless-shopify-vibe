import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

type BannerParent = {
  enabled?: boolean;
};

type ImageValue = {
  asset?: unknown;
};

export const homePageBanner = defineType({
  name: "homePageBanner",
  title: "Homepage banner",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "enabled",
      title: "Show homepage banner",
      type: "boolean",
      description:
        "When enabled and published, this replaces the default Shopify store introduction.",
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Banner image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the image for customers using assistive technology.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as ImageValue | undefined;
              return !parent?.asset || value?.trim()
                ? true
                : "Alternative text is required when an image is uploaded.";
            }),
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as BannerParent | undefined;
          const image = value as ImageValue | undefined;
          return !parent?.enabled || image?.asset
            ? true
            : "Upload a banner image before enabling the banner.";
        }),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) =>
        rule.max(100).custom((value, context) => {
          const parent = context.parent as BannerParent | undefined;
          return !parent?.enabled || value?.trim()
            ? true
            : "Add a title before enabling the banner.";
        }),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.max(320).custom((value, context) => {
          const parent = context.parent as BannerParent | undefined;
          return !parent?.enabled || value?.trim()
            ? true
            : "Add a description before enabling the banner.";
        }),
    }),
    defineField({
      name: "cta",
      title: "Call to action (optional)",
      type: "bannerCta",
      description:
        "Add one optional button using an internal store path or external website URL.",
    }),
  ],
  preview: {
    select: { title: "title", enabled: "enabled", media: "image" },
    prepare({ title, enabled, media }) {
      return {
        title: title || "Homepage banner",
        subtitle: enabled ? "Enabled" : "Disabled",
        media,
      };
    },
  },
});
