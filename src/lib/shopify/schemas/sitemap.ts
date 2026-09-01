import { z } from "zod";

export const sitemapResourceTypeSchema = z.enum(["PRODUCT", "COLLECTION"]);

export const sitemapResponseSchema = z.object({
  sitemap: z.object({
    pagesCount: z.object({
      count: z.number().int().nonnegative(),
    }),
    resources: z.object({
      hasNextPage: z.boolean(),
      items: z.array(
        z.object({
          handle: z.string().trim().min(1).max(255),
          updatedAt: z.iso.datetime(),
        }),
      ),
    }),
  }),
});

export type SitemapResource = z.infer<
  typeof sitemapResponseSchema
>["sitemap"]["resources"]["items"][number];
export type SitemapResourceType = z.infer<typeof sitemapResourceTypeSchema>;
