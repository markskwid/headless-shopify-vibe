import "server-only";

import { sanityFetch } from "./client";
import { getSanityConfig } from "./env";
import { FOOTER_SETTINGS_QUERY, HEADER_SETTINGS_QUERY } from "./queries";
import { footerSettingsSchema, headerSettingsSchema } from "./schemas";

export { getHomePageBanners } from "./services/home-page";
export type { HomePageBannerSlide } from "./services/home-page";

export type {
  FooterLinkColumn,
  FooterSettings,
  FooterSocialLink,
  HeaderNavigationItem,
  HeaderSettings,
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
