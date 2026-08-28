# Headless Vibe Studio

This standalone Sanity Studio owns editorial storefront content such as the
homepage banner carousel, global logo, primary navigation, footer identity, social
profiles, link columns, and newsletter copy. Shopify remains the source of
truth for commerce data.

## Connect the Studio

1. Create or select a project at [sanity.io/manage](https://www.sanity.io/manage).
2. Copy `.env.example` to `.env.local` in this directory.
3. Add the Sanity project ID and dataset.
4. Add the same project ID and dataset to the root `.env.local` using the
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` keys.
5. For the embedded editor, run `npm run dev` and open
   [http://localhost:3000/studio](http://localhost:3000/studio).
6. For the faster standalone editor, run `npm run studio:dev` and open
   [http://localhost:3333](http://localhost:3333).
7. Open the **Homepage** singleton and add up to five items to **Banner
   carousel**. Each banner supports an image with hotspot and alternative text,
   title, description, enable toggle, and optional CTA. Reorder the items as
   needed, enable the slides that should appear, and publish. The storefront
   keeps its Shopify introduction until at least one complete banner is enabled
   and published.
8. Open the **Site settings** singleton, configure the header and footer, then
   publish. Footer link columns accept single-level internal or external links.

The storefront caches the public homepage banner carousel for 60 seconds under
a dedicated cache tag. Published header and footer content is also cached for
60 seconds under the site-settings tag. A private dataset requires
`SANITY_API_READ_TOKEN` in the root `.env.local`. Klaviyo list and API
credentials belong only in the root app env; they are not Studio configuration.
