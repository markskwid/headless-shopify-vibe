import { z } from "zod";

const navigationHrefSchema = z.string().min(1).refine(
  (value) =>
    value.startsWith("/") ||
    value.startsWith("#") ||
    /^https?:\/\//i.test(value),
  "Navigation destinations must be an internal path, anchor, or HTTP(S) URL.",
);

const navigationLinkSchema = z.object({
  _key: z.string().min(1),
  label: z.string().min(1),
  href: navigationHrefSchema,
  openInNewTab: z.boolean(),
});

const sanityImageSchema = z.object({
  url: z.url(),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
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
  })
  .nullable();

export type HeaderSettings = NonNullable<z.infer<typeof headerSettingsSchema>>;
export type HeaderNavigationItem = HeaderSettings["navigation"][number];

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
            url: z.url(),
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
