import { z } from "zod";

import { safeLinkDestinationSchema } from "@/lib/validation/url";

const cropSchema = z.object({
  top: z.number().min(0).max(1),
  right: z.number().min(0).max(1),
  bottom: z.number().min(0).max(1),
  left: z.number().min(0).max(1),
});

const hotspotSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
});

export const homePageSettingsSchema = z
  .object({
    banners: z
      .array(
        z.object({
          _key: z.string().trim().min(1),
          enabled: z.boolean(),
          image: z
            .object({
              asset: z.object({
                _ref: z.string().startsWith("image-"),
                _type: z.literal("reference"),
              }),
              crop: cropSchema.nullable(),
              hotspot: hotspotSchema.nullable(),
              alt: z.string().trim().min(1).max(300),
              width: z.number().positive(),
              height: z.number().positive(),
              lqip: z.string().startsWith("data:image/").nullable(),
            })
            .nullable(),
          title: z.string().trim().min(1).max(100).nullable(),
          description: z.string().trim().min(1).max(320).nullable(),
          cta: z
            .object({
              label: z.string().trim().min(1).max(40),
              href: safeLinkDestinationSchema,
              openInNewTab: z.boolean(),
            })
            .nullable(),
        }),
      )
      .max(5),
  })
  .nullable();

export type HomePageSettingsSource = z.infer<typeof homePageSettingsSchema>;
