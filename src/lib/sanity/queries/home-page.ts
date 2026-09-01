import { defineQuery } from "next-sanity";

const HOME_PAGE_BANNER_PROJECTION = /* groq */ `
  "_key": coalesce(_key, "legacy-homepage-banner"),
  "enabled": coalesce(enabled, false),
  "image": select(
    defined(image.asset) => image {
      "asset": asset {
        _ref,
        _type
      },
      "crop": select(
        defined(crop) => crop {
          top,
          right,
          bottom,
          left
        },
        null
      ),
      "hotspot": select(
        defined(hotspot) => hotspot {
          x,
          y,
          width,
          height
        },
        null
      ),
      "alt": coalesce(alt, "Homepage banner"),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      "lqip": coalesce(asset->metadata.lqip, null)
    },
    null
  ),
  "title": coalesce(title, null),
  "description": coalesce(description, null),
  "cta": select(
    defined(cta.label) => cta {
      label,
      "href": select(
        linkType == "external" => externalUrl,
        linkType == "editorialPage" => "/" + editorialPage->slug.current,
        internalPath
      ),
      "openInNewTab": linkType == "external" && openInNewTab == true
    },
    null
  )
`;

export const HOME_PAGE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "homePage" && _id == "homePage"][0] {
    "banners": select(
      count(banners) > 0 => banners[] {
        ${HOME_PAGE_BANNER_PROJECTION}
      },
      defined(banner) => [banner {
        ${HOME_PAGE_BANNER_PROJECTION}
      }],
      []
    )
  }
`);
