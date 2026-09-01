import { defineQuery } from "next-sanity";

const navigationFields = /* groq */ `
  _key,
  label,
  "href": select(
    linkType == "external" => externalUrl,
    linkType == "editorialPage" => "/" + editorialPage->slug.current,
    internalPath
  ),
  "openInNewTab": linkType == "external" && openInNewTab == true
`;

export const HEADER_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    "siteName": coalesce(siteName, null),
    "logo": select(
      defined(logo.asset) => logo {
        alt,
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      null
    ),
    "navigation": coalesce(navigation[] {
      ${navigationFields},
      "children": coalesce(children[] {
        ${navigationFields}
      }, [])
    }, [])
  }
`);

export const FOOTER_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    "siteName": coalesce(siteName, null),
    "headerLogo": select(
      defined(logo.asset) => logo {
        "alt": coalesce(alt, "Store logo"),
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      null
    ),
    "footer": select(
      defined(footer) => footer {
        "logo": select(
          defined(logo.asset) => logo {
            "alt": coalesce(alt, "Store logo"),
            "url": asset->url,
            "width": asset->metadata.dimensions.width,
            "height": asset->metadata.dimensions.height
          },
          null
        ),
        "description": coalesce(description, null),
        "socialLinks": coalesce(socialLinks[] {
          _key,
          platform,
          url
        }, []),
        "columns": coalesce(columns[] {
          _key,
          title,
          "links": coalesce(links[] {
            ${navigationFields}
          }, [])
        }, []),
        "newsletter": select(
          defined(newsletter) => newsletter {
            "title": coalesce(title, null),
            "description": coalesce(description, null),
            "emailPlaceholder": coalesce(emailPlaceholder, null),
            "buttonLabel": coalesce(buttonLabel, null),
            "consentNote": coalesce(consentNote, null)
          },
          null
        )
      },
      null
    )
  }
`);

export const SEO_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    "siteName": coalesce(siteName, null),
    "logo": select(
      defined(logo.asset) => logo {
        "alt": coalesce(alt, "Store logo"),
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      null
    ),
    "seo": select(
      defined(seo) => seo {
        "title": coalesce(title, null),
        "description": coalesce(description, null),
        "socialImage": select(
          defined(socialImage.asset) => socialImage {
            "alt": coalesce(alt, "Store social sharing image"),
            "url": asset->url,
            "width": asset->metadata.dimensions.width,
            "height": asset->metadata.dimensions.height
          },
          null
        )
      },
      null
    ),
    "socialProfiles": coalesce(footer.socialLinks[].url, [])
  }
`);
