import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditorialPageBuilder } from "@/components/editorial/page-builder";
import { JsonLd } from "@/components/seo/json-ld";
import { storefrontUrl } from "@/lib/seo/env";
import { socialMetadata } from "@/lib/seo/metadata";
import { editorialPageParamsSchema, getEditorialPage } from "@/lib/sanity";

type EditorialPageRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: EditorialPageRouteProps): Promise<Metadata> {
  const parsed = editorialPageParamsSchema.safeParse(await params);
  if (!parsed.success) return {};

  try {
    const page = await getEditorialPage(parsed.data.slug);
    if (!page) return {};

    const pathname = `/${page.slug}`;
    const image = page.seo.socialImage
      ? {
          url: page.seo.socialImage.url,
          width: page.seo.socialImage.width,
          height: page.seo.socialImage.height,
          altText: page.seo.socialImage.alt,
        }
      : null;

    return {
      title: page.seo.title,
      description: page.seo.description || undefined,
      robots: page.seo.noIndex ? { index: false, follow: false } : undefined,
      ...socialMetadata({
        title: page.seo.title,
        description: page.seo.description,
        pathname,
        image,
      }),
    };
  } catch {
    return {};
  }
}

export default async function EditorialPageRoute({ params }: EditorialPageRouteProps) {
  const parsed = editorialPageParamsSchema.safeParse(await params);
  if (!parsed.success) notFound();

  const page = await getEditorialPage(parsed.data.slug);
  if (!page) notFound();

  const pageUrl = storefrontUrl(`/${page.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: storefrontUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: page.title,
              item: pageUrl,
            },
          ],
        }}
      />
      <EditorialPageBuilder page={page} />
    </>
  );
}
