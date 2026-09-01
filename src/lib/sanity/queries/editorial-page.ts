import { defineQuery } from "next-sanity";

const LINK_PROJECTION = /* groq */ `
  label,
  "href": select(
    linkType == "external" => externalUrl,
    linkType == "editorialPage" => "/" + editorialPage->slug.current,
    internalPath
  ),
  "openInNewTab": linkType == "external" && openInNewTab == true
`;

const IMAGE_PROJECTION = /* groq */ `
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": coalesce(asset->metadata.lqip, null),
  "alt": coalesce(alt, "")
`;

const PORTABLE_TEXT_PROJECTION = /* groq */ `
  _key,
  _type,
  style,
  "listItem": coalesce(listItem, null),
  "level": coalesce(level, null),
  children[] {
    _key,
    _type,
    text,
    "marks": coalesce(marks, [])
  },
  "markDefs": coalesce(markDefs[] {
    _key,
    _type,
    href,
    "openInNewTab": coalesce(openInNewTab, false)
  }, [])
`;

export const EDITORIAL_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "editorialPage" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    "pageBuilder": coalesce(pageBuilder[] {
      _key,
      _type,
      _type == "pageHero" => {
        "eyebrow": coalesce(eyebrow, null),
        heading,
        "description": coalesce(description, null),
        "image": select(defined(image.asset) => image { ${IMAGE_PROJECTION} }, null),
        "cta": select(defined(cta.label) => cta { ${LINK_PROJECTION} }, null)
      },
      _type == "richTextSection" => {
        "heading": coalesce(heading, null),
        "body": coalesce(body[] { ${PORTABLE_TEXT_PROJECTION} }, [])
      },
      _type == "faqSection" => {
        heading,
        "description": coalesce(description, null),
        "items": coalesce(items[] {
          _key,
          question,
          "answer": coalesce(answer[] { ${PORTABLE_TEXT_PROJECTION} }, [])
        }, [])
      },
      _type == "contactSection" => {
        heading,
        "description": coalesce(description, null),
        "email": coalesce(email, null),
        "phone": coalesce(phone, null),
        "address": coalesce(address, null),
        "businessHours": coalesce(businessHours, null)
      },
      _type == "calloutSection" => {
        heading,
        description,
        "cta": select(defined(cta.label) => cta { ${LINK_PROJECTION} }, null)
      }
    }, []),
    "seo": {
      "title": coalesce(seo.title, title),
      "description": coalesce(seo.description, null),
      "socialImage": select(
        defined(seo.socialImage.asset) => seo.socialImage { ${IMAGE_PROJECTION} },
        null
      ),
      "noIndex": seo.noIndex == true
    }
  }
`);

export const EDITORIAL_SITEMAP_QUERY = defineQuery(/* groq */ `
  *[
    _type == "editorialPage" &&
    defined(slug.current) &&
    seo.noIndex != true
  ] | order(_updatedAt desc) {
    "slug": slug.current,
    _updatedAt
  }
`);
