import { bannerCta } from "./bannerCta";
import { footerColumn } from "./footerColumn";
import { footerLink } from "./footerLink";
import { footerSettings } from "./footerSettings";
import { homePage } from "./homePage";
import { homePageBanner } from "./homePageBanner";
import { navigationChild } from "./navigationChild";
import { navigationItem } from "./navigationItem";
import { newsletterSettings } from "./newsletterSettings";
import { socialLink } from "./socialLink";
import { siteSettings } from "./siteSettings";
import { seoSettings } from "./seoSettings";

export const schemaTypes = [
  siteSettings,
  seoSettings,
  homePage,
  navigationItem,
  navigationChild,
  footerSettings,
  footerColumn,
  footerLink,
  socialLink,
  newsletterSettings,
  homePageBanner,
  bannerCta,
];
