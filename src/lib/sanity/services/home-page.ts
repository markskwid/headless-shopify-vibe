import "server-only";

import { sanityFetch } from "../client";
import { getSanityConfig } from "../env";
import { buildSanityImageUrl } from "../image";
import { HOME_PAGE_SETTINGS_QUERY } from "../queries/home-page";
import { homePageSettingsSchema } from "../schemas/home-page";

type ImageGeometry = {
  width: number;
  height: number;
  crop: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null;
  hotspot: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

export type HomePageBannerSlide = {
  _key: string;
  title: string;
  description: string;
  image: {
    alt: string;
    lqip: string | null;
    objectPosition: string;
    sourceWidth: number;
    url: string;
  };
  cta: {
    label: string;
    href: string;
    openInNewTab: boolean;
  } | null;
};

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getImagePresentation(image: ImageGeometry) {
  const crop = image.crop ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const cropWidth = Math.max(1 - crop.left - crop.right, 0.001);
  const cropHeight = Math.max(1 - crop.top - crop.bottom, 0.001);
  const focalX = image.hotspot
    ? ((image.hotspot.x - crop.left) / cropWidth) * 100
    : 50;
  const focalY = image.hotspot
    ? ((image.hotspot.y - crop.top) / cropHeight) * 100
    : 50;

  return {
    objectPosition: `${clampPercentage(focalX).toFixed(2)}% ${clampPercentage(focalY).toFixed(2)}%`,
    sourceWidth: Math.max(1, Math.floor(image.width * cropWidth)),
  };
}

export async function getHomePageBanners(): Promise<HomePageBannerSlide[]> {
  if (!getSanityConfig().configured) return [];

  const settings = await sanityFetch({
    query: HOME_PAGE_SETTINGS_QUERY,
    schema: homePageSettingsSchema,
    revalidate: 60,
    tags: ["sanity-home-page"],
  });
  return (settings?.banners ?? []).flatMap((banner) => {
    if (
      !banner.enabled ||
      !banner.image ||
      !banner.title ||
      !banner.description
    ) {
      return [];
    }

    const imageUrl = buildSanityImageUrl({
      asset: banner.image.asset,
      crop: banner.image.crop ?? undefined,
      hotspot: banner.image.hotspot ?? undefined,
    })
      .auto("format")
      .url();
    const presentation = getImagePresentation(banner.image);

    return [
      {
        _key: banner._key,
        title: banner.title,
        description: banner.description,
        image: {
          alt: banner.image.alt,
          lqip: banner.image.lqip,
          objectPosition: presentation.objectPosition,
          sourceWidth: presentation.sourceWidth,
          url: imageUrl,
        },
        cta: banner.cta,
      },
    ];
  });
}
