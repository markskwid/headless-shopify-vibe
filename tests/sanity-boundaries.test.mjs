import assert from "node:assert/strict";
import test from "node:test";

import {
  footerSettingsSchema,
  headerSettingsSchema,
} from "../src/lib/sanity/schemas.ts";
import {
  editorialPageSchema,
  editorialPageSlugSchema,
} from "../src/lib/sanity/schemas/editorial-page.ts";
import { homePageSettingsSchema } from "../src/lib/sanity/schemas/home-page.ts";
import {
  getEditorialPage,
  getEditorialSitemapEntries,
} from "../src/lib/sanity/services/editorial-page.ts";
import { getHomePageBanners } from "../src/lib/sanity/services/home-page.ts";

function clearSanityEnvironment() {
  delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  delete process.env.NEXT_PUBLIC_SANITY_DATASET;
  delete process.env.SANITY_API_VERSION;
  delete process.env.SANITY_API_READ_TOKEN;
}

test("Sanity site settings accept missing documents and valid safe links", () => {
  assert.equal(headerSettingsSchema.parse(null), null);
  assert.equal(footerSettingsSchema.parse(null), null);

  const header = headerSettingsSchema.parse({
    siteName: "Test shop",
    logo: null,
    navigation: [
      {
        _key: "home",
        label: "Home",
        href: "/",
        openInNewTab: false,
        children: [],
      },
    ],
    announcements: [
      {
        _key: "shipping",
        text: "Free shipping this week",
        href: "/pages/shipping",
        openInNewTab: false,
      },
    ],
  });

  assert.equal(header.announcements[0].text, "Free shipping this week");
});

test("Sanity site settings reject unsafe links and malformed images", () => {
  const invalidHeader = {
    siteName: "Test shop",
    logo: {
      url: "http://cdn.sanity.io/logo.png",
      alt: "",
      width: -1,
      height: 0,
    },
    navigation: [],
    announcements: [
      {
        _key: "unsafe",
        text: "Unsafe",
        href: "javascript:alert(1)",
        openInNewTab: false,
      },
    ],
  };

  assert.equal(headerSettingsSchema.safeParse(invalidHeader).success, false);
});

test("homepage Sanity responses validate nullable content and banner boundaries", () => {
  assert.equal(homePageSettingsSchema.parse(null), null);
  assert.deepEqual(homePageSettingsSchema.parse({ banners: [] }), {
    banners: [],
  });

  const invalidBanner = {
    banners: [
      {
        _key: "banner-1",
        enabled: true,
        image: null,
        title: "Sale",
        description: "Description",
        cta: {
          label: "Shop",
          href: "http://insecure.example.com",
          openInNewTab: false,
        },
      },
    ],
  };
  assert.equal(homePageSettingsSchema.safeParse(invalidBanner).success, false);
  assert.equal(
    homePageSettingsSchema.safeParse({
      banners: Array.from({ length: 6 }, (_, index) => ({
        _key: `banner-${index}`,
        enabled: false,
        image: null,
        title: null,
        description: null,
        cta: null,
      })),
    }).success,
    false,
  );
});

test("editorial Sanity responses allow missing pages and reject invalid slugs", () => {
  assert.equal(editorialPageSchema.parse(null), null);
  assert.equal(editorialPageSlugSchema.safeParse("shipping-and-returns").success, true);
  assert.equal(editorialPageSlugSchema.safeParse("Unsafe/Slug").success, false);
  assert.equal(editorialPageSlugSchema.safeParse("privacy_policy").success, false);
});

test("Sanity services return fallbacks without configuration or network access", async () => {
  clearSanityEnvironment();

  assert.deepEqual(await getHomePageBanners(), []);
  assert.equal(await getEditorialPage("about"), null);
  assert.deepEqual(await getEditorialSitemapEntries(), []);
});
