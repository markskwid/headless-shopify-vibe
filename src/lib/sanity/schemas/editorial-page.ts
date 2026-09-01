import { z } from "zod";

import { httpsUrlSchema, safeLinkDestinationSchema } from "@/lib/validation/url";

export const editorialPageSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const editorialPageParamsSchema = z.object({
  slug: editorialPageSlugSchema,
});

const editorialLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  href: safeLinkDestinationSchema,
  openInNewTab: z.boolean(),
});

const editorialImageSchema = z.object({
  url: httpsUrlSchema,
  width: z.number().positive(),
  height: z.number().positive(),
  lqip: z.string().startsWith("data:image/").nullable(),
  alt: z.string().trim().min(1).max(300),
});

const portableTextSpanSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("span"),
  text: z.string(),
  marks: z.array(z.string()),
});

const portableTextLinkSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("link"),
  href: safeLinkDestinationSchema,
  openInNewTab: z.boolean(),
});

export const editorialRichTextBlockSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("block"),
  style: z.enum(["normal", "h2", "h3", "blockquote"]),
  listItem: z.enum(["bullet", "number"]).nullable(),
  level: z.number().int().positive().nullable(),
  children: z.array(portableTextSpanSchema),
  markDefs: z.array(portableTextLinkSchema),
});

const richTextSchema = z.array(editorialRichTextBlockSchema);

const pageHeroSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("pageHero"),
  eyebrow: z.string().trim().min(1).max(50).nullable(),
  heading: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(400).nullable(),
  image: editorialImageSchema.nullable(),
  cta: editorialLinkSchema.nullable(),
});

const richTextSectionSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("richTextSection"),
  heading: z.string().trim().min(1).max(120).nullable(),
  body: richTextSchema.min(1),
});

const faqSectionSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("faqSection"),
  heading: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(300).nullable(),
  items: z
    .array(
      z.object({
        _key: z.string().min(1),
        question: z.string().trim().min(1).max(180),
        answer: richTextSchema.min(1),
      }),
    )
    .min(1)
    .max(20),
});

const contactSectionSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("contactSection"),
  heading: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(300).nullable(),
  email: z.email().nullable(),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/).nullable(),
  address: z.string().trim().min(1).max(300).nullable(),
  businessHours: z.string().trim().min(1).max(300).nullable(),
});

const calloutSectionSchema = z.object({
  _key: z.string().min(1),
  _type: z.literal("calloutSection"),
  heading: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  cta: editorialLinkSchema.nullable(),
});

export const editorialPageSchema = z
  .object({
    _id: z.string().min(1),
    _updatedAt: z.iso.datetime({ offset: true }),
    title: z.string().trim().min(1).max(100),
    slug: editorialPageSlugSchema,
    pageBuilder: z
      .array(
        z.discriminatedUnion("_type", [
          pageHeroSchema,
          richTextSectionSchema,
          faqSectionSchema,
          contactSectionSchema,
          calloutSectionSchema,
        ]),
      )
      .min(1)
      .max(20),
    seo: z.object({
      title: z.string().trim().min(1).max(100),
      description: z.string().trim().min(1).max(160).nullable(),
      socialImage: editorialImageSchema.nullable(),
      noIndex: z.boolean(),
    }),
  })
  .nullable();

export const editorialSitemapSchema = z.array(
  z.object({
    slug: editorialPageSlugSchema,
    _updatedAt: z.iso.datetime({ offset: true }),
  }),
);

export type EditorialPage = NonNullable<z.infer<typeof editorialPageSchema>>;
export type EditorialPageBlock = EditorialPage["pageBuilder"][number];
export type EditorialRichText = z.infer<typeof richTextSchema>;
