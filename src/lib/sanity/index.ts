import "server-only";

import { sanityFetch } from "./client";
import { getSanityConfig } from "./env";
import {
  FOOTER_SETTINGS_QUERY,
  HEADER_SETTINGS_QUERY,
  SEO_SETTINGS_QUERY,
} from "./queries";
import {
  footerSettingsSchema,
  headerSettingsSchema,
  seoSettingsSchema,
} from "./schemas";

export { getHomePageBanners } from "./services/home-page";
export type { HomePageBannerSlide } from "./services/home-page";

export type {
  FooterLinkColumn,
  FooterSettings,
  FooterSocialLink,
  HeaderNavigationItem,
  HeaderSettings,
  SeoSettings,
} from "./schemas";

export async function getHeaderSettings() {
  if (!getSanityConfig().configured) return null;

  return sanityFetch({
    query: HEADER_SETTINGS_QUERY,
    schema: headerSettingsSchema,
    revalidate: 60,
    tags: ["sanity-site-settings"],
  });
}

export async function getFooterSettings() {
  if (!getSanityConfig().configured) return null;

  return sanityFetch({
    query: FOOTER_SETTINGS_QUERY,
    schema: footerSettingsSchema,
    revalidate: 60,
    tags: ["sanity-site-settings"],
  });
}

export async function getSeoSettings() {
  if (!getSanityConfig().configured) return null;

  return sanityFetch({
    query: SEO_SETTINGS_QUERY,
    schema: seoSettingsSchema,
    revalidate: 60,
    tags: ["sanity-site-settings"],
  });
}
