import { announcement } from "./announcement";
import { bannerCta } from "./bannerCta";
import { calloutSection } from "./calloutSection";
import { contactSection } from "./contactSection";
import { editorialPage } from "./editorialPage";
import { editorialRichText } from "./editorialRichText";
import { faqSection } from "./faqSection";
import { footerColumn } from "./footerColumn";
import { footerLink } from "./footerLink";
import { footerSettings } from "./footerSettings";
import { homePage } from "./homePage";
import { homePageBanner } from "./homePageBanner";
import { navigationChild } from "./navigationChild";
import { navigationItem } from "./navigationItem";
import { newsletterSettings } from "./newsletterSettings";
import { pageHero } from "./pageHero";
import { pageSeo } from "./pageSeo";
import { richTextSection } from "./richTextSection";
import { socialLink } from "./socialLink";
import { siteSettings } from "./siteSettings";
import { seoSettings } from "./seoSettings";

export const schemaTypes = [
  siteSettings,
  announcement,
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
  editorialPage,
  editorialRichText,
  pageSeo,
  pageHero,
  richTextSection,
  faqSection,
  contactSection,
  calloutSection,
];
