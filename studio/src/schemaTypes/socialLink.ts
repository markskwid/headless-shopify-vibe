import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { defineField, defineType } from "sanity";

const socialPlatforms = [
  { title: "Facebook", value: "facebook" },
  { title: "Instagram", value: "instagram" },
  { title: "TikTok", value: "tiktok" },
  { title: "YouTube", value: "youtube" },
  { title: "X", value: "x" },
  { title: "Pinterest", value: "pinterest" },
] as const;

export const socialLink = defineType({
  name: "socialLink",
  title: "Social media link",
  type: "object",
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: { list: [...socialPlatforms] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Profile URL",
      type: "url",
      validation: (rule) =>
        rule.required().uri({ scheme: ["https"] }),
    }),
  ],
  preview: {
    select: { platform: "platform", url: "url" },
    prepare({ platform, url }) {
      const title = socialPlatforms.find(
        (option) => option.value === platform,
      )?.title;

      return { title: title || "Social link", subtitle: url };
    },
  },
});
