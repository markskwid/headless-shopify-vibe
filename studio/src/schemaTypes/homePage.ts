import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "banners",
      title: "Banner carousel",
      type: "array",
      description:
        "Add, remove, and reorder up to five banners. Only enabled banners appear on the storefront.",
      of: [defineArrayMember({ type: "homePageBanner" })],
      validation: (rule) =>
        rule.max(5).error("The homepage carousel supports up to five banners."),
    }),
    defineField({
      name: "banner",
      title: "Legacy homepage banner",
      type: "homePageBanner",
      deprecated: {
        reason:
          "Use Banner carousel instead. Existing content remains available as a one-slide fallback until carousel banners are added.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
  ],
  preview: {
    select: {
      firstTitle: "banners.0.title",
      firstMedia: "banners.0.image",
      legacyTitle: "banner.title",
      legacyMedia: "banner.image",
    },
    prepare({ firstTitle, firstMedia, legacyTitle, legacyMedia }) {
      const title = firstTitle || legacyTitle;

      return {
        title: "Homepage",
        subtitle: title ? `Banner carousel: ${title}` : "No banners configured",
        media: firstMedia || legacyMedia,
      };
    },
  },
});
