import { z } from "zod";

import {
  httpsUrlSchema,
  safeLinkDestinationSchema,
} from "@/lib/validation/url";

const navigationLinkSchema = z.object({
  _key: z.string().min(1),
  label: z.string().min(1),
  href: safeLinkDestinationSchema,
  openInNewTab: z.boolean(),
});

const sanityImageSchema = z.object({
  url: httpsUrlSchema,
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

const announcementSchema = z.object({
  _key: z.string().min(1),
  text: z.string().min(1).max(160),
  href: safeLinkDestinationSchema.nullable(),
  openInNewTab: z.boolean(),
});

export const headerSettingsSchema = z
  .object({
    siteName: z.string().min(1).nullable(),
    logo: sanityImageSchema.nullable(),
    navigation: z.array(
      navigationLinkSchema.extend({
        children: z.array(navigationLinkSchema),
      }),
    ),
    announcements: z.array(announcementSchema).max(5),
  })
  .nullable();

export type HeaderSettings = NonNullable<z.infer<typeof headerSettingsSchema>>;
export type HeaderNavigationItem = HeaderSettings["navigation"][number];
export type HeaderAnnouncement = HeaderSettings["announcements"][number];

const socialPlatformSchema = z.enum([
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "x",
  "pinterest",
]);

export const footerSettingsSchema = z
  .object({
    siteName: z.string().min(1).nullable(),
    headerLogo: sanityImageSchema.nullable(),
    footer: z
      .object({
        logo: sanityImageSchema.nullable(),
        description: z.string().max(240).nullable(),
        socialLinks: z.array(
          z.object({
            _key: z.string().min(1),
            platform: socialPlatformSchema,
            url: httpsUrlSchema,
          }),
        ),
        columns: z.array(
          z.object({
            _key: z.string().min(1),
            title: z.string().min(1),
            links: z.array(navigationLinkSchema),
          }),
        ),
        newsletter: z
          .object({
            title: z.string().max(80).nullable(),
            description: z.string().max(240).nullable(),
            emailPlaceholder: z.string().max(60).nullable(),
            buttonLabel: z.string().max(30).nullable(),
            consentNote: z.string().max(160).nullable(),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable();

export type FooterSettings = NonNullable<z.infer<typeof footerSettingsSchema>>;
export type FooterLinkColumn = NonNullable<FooterSettings["footer"]>["columns"][number];
export type FooterSocialLink = NonNullable<FooterSettings["footer"]>["socialLinks"][number];

export const seoSettingsSchema = z
  .object({
    siteName: z.string().min(1).max(60).nullable(),
    logo: sanityImageSchema.nullable(),
    seo: z
      .object({
        title: z.string().min(1).max(60).nullable(),
        description: z.string().min(1).max(160).nullable(),
        socialImage: sanityImageSchema.nullable(),
      })
      .nullable(),
    socialProfiles: z.array(httpsUrlSchema),
  })
  .nullable();

export type SeoSettings = NonNullable<z.infer<typeof seoSettingsSchema>>;
