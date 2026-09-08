# Headless Vibe

A reusable, theme-like Shopify headless storefront starter built with Next.js,
TypeScript, Tailwind CSS, shadcn/ui, Zod, Motion, and Embla Carousel.

Shopify supplies commerce data and Sanity supplies editorial content. The site
runs with graceful fallbacks when either service is not configured. Private
tokens stay in server-only modules and are never exposed with `NEXT_PUBLIC_`
variables.

This repository maintains two distributions. `main` is the secured storefront
and may include deployment-specific hardening such as shared rate limiting and
security headers. `clean/shopify-sanity-core` tracks the same reusable Shopify,
Sanity, editorial-page, SEO, sitemap, and authenticated webhook capabilities
without selecting a rate-limit vendor, WAF/CDN policy, CSP, or proxy-trust
strategy. New generally reusable commerce and editorial features should be
ported to both branches; security-provider choices remain on `main`.

The Sanity-editable global header includes an optional announcement bar and Shopify-powered predictive product search. One announcement renders statically; two or more become a draggable Embla carousel that autoplays, includes pause and navigation controls, pauses during interaction, and respects reduced-motion preferences. Announcement text can optionally link to an editorial page, storefront path, or HTTPS website. Predictive search waits
300 ms after typing, previews up to six products, handles empty and failed
searches, and links to a complete `/search` results page. Search result products
open theme-native `/products/[handle]` pages with a draggable Embla image gallery,
thumbnails, variant-driven image and price updates, a Shopify Cart API-backed
add-to-cart control, and an Embla carousel of Shopify-generated related
products.

The homepage can use a Sanity-managed carousel containing up to five reorderable
banners. Every banner has an image, title, description, enable toggle, and
optional call to action. The carousel supports dragging, previous/next controls,
and direct slide selectors. When no complete banner is enabled or Sanity is
unavailable, the Shopify store introduction remains as the fallback. The
homepage also presents the six most recently updated Shopify collections with
their title, description, featured image, and a built-in fallback image. Every
collection route, including `/collections/all`, supports Shopify-native Search
& Discovery filters, a currency-aware price-range slider, and automatic
URL-based sorting for shareable browse states. Cursor-based Previous and Next
pagination loads 24 products at a time while retaining the active sort and all
selected filters in the URL.

Root-level editorial and legal pages are also built in Sanity. Editors can
compose About, Contact, FAQ, Shipping and returns, Privacy policy, Terms, and
other pages from ordered hero, rich-text, FAQ, contact-details, and callout
sections. Each page owns its slug, search metadata, social image, and optional
`noindex` setting. Header, child-navigation, footer, hero, and callout links can
reference an editorial page directly, so a later slug change updates those
destinations automatically.

Missing routes and unavailable Shopify products or collections render a branded
404 page with the normal storefront shell and recovery links. Unmatched routes
return HTTP 404; Next.js can stream an explicit product/collection `notFound()`
boundary with noindex metadata after the storefront shell has begun rendering.

The Shopify Cart API powers add-to-cart, a right-side cart drawer, responsive
`/cart` management, quantities, order notes, discount codes, live discounted
subtotals, and Shopify-hosted checkout. The cart ID remains in an HTTP-only
cookie and is never exposed to browser JavaScript.

The header account icon and `/account/login` now enter Shopify's hosted,
passwordless customer accounts. The custom account dashboard and its legacy
Storefront API services remain in the codebase during the Customer Account API
migration, but a hosted Shopify session does not authenticate that dashboard
yet. The completed migration will exchange Shopify's OAuth authorization code
for a server-held Customer Account API session and attach that session to the
active cart buyer identity.

The order-history modal includes a compact image, name, and discounted price
list for each order. Saved addresses can be edited, deleted after confirmation,
or made primary directly from the address modal. Address forms use cascading
country and state/province options backed by an offline server-side dataset,
while the city remains a freely editable field.

The responsive global footer is also managed from Sanity. Editors can set a
footer-specific logo and description, add Facebook, Instagram, TikTok, YouTube,
X, and Pinterest profiles, build up to four single-level link columns, and edit
the newsletter copy. Newsletter submissions are sent to a configured Klaviyo
list through a server-only action; matching signed-in customers are also opted
into Shopify email marketing. The private API key never reaches the browser.

## Requirements

- Node.js 24.x (CI uses 24.11.1)
- npm
- A Shopify store with products published to the Headless sales channel
- Shopify customer accounts enabled for the hosted passwordless login
- A Sanity project for editable homepage, editorial pages, navigation, footer,
  and SEO defaults
- A Klaviyo list and scoped private API key for newsletter subscriptions
- An Upstash Redis database for shared production rate limits

## Quick start

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

On macOS or Linux, replace the copy command with:

```bash
cp .env.example .env.local
```

Open [http://localhost:3000](http://localhost:3000).

If Windows PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`.

## Connect a Shopify store

1. In Shopify admin, install the **Headless** sales channel.
2. Create a storefront and grant the Storefront API permissions your theme will
   use.
3. Copy `.env.example` to `.env.local`.
4. Set the permanent `your-store.myshopify.com` domain.
5. Add either a private or public Storefront API access token. A private token is
   preferred because all API calls in this starter run on the server.
6. Set `STOREFRONT_BASE_URL` to the public headless storefront URL. This is the
   canonical origin used in metadata, structured data, `robots.txt`, and
   `sitemap.xml`; do not use the `myshopify.com` domain unless it is genuinely
   the customer-facing headless URL.
7. Restart `npm run dev` after changing environment variables.

```dotenv
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN=your_private_token
SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN=
SHOPIFY_STOREFRONT_API_VERSION=2026-07
STOREFRONT_BASE_URL=https://www.example.com
```

Basic product and collection queries can use Shopify's tokenless Storefront API,
so the domain alone is enough for the included preview on stores that permit
those queries. Add a token when using features that require authenticated access.
If both tokens are set, the private token takes precedence.

Never commit `.env.local` or a private Storefront API token. The repository only
tracks `.env.example`, which contains placeholders.

## Configure cache-revalidation webhooks

Time-based revalidation remains active as a fallback, but authenticated
webhooks make published Shopify and Sanity changes invalidate their server data
caches immediately. Both endpoints accept only JSON, enforce bounded bodies,
return `Cache-Control: no-store`, and reject unsigned deliveries.

### Shopify

Add the client secret belonging to the Shopify app that owns the webhook
subscriptions. This is not the Storefront API token:

```dotenv
SHOPIFY_WEBHOOK_SECRET=your_shopify_app_client_secret
```

Point HTTPS subscriptions at:

```text
https://your-storefront.example/api/webhooks/shopify
```

Subscribe to the public-catalog events used by this storefront:

- `products/create`, `products/update`, and `products/delete`
- `collections/create`, `collections/update`, and `collections/delete`
- `product_listings/add`, `product_listings/update`, and
  `product_listings/remove`
- `collection_listings/add`, `collection_listings/update`, and
  `collection_listings/remove`
- `inventory_levels/update`
- `shop/update`

Manage these as app-specific subscriptions in `shopify.app.toml` when this
storefront is paired with a Shopify app, or create shop-specific subscriptions
with the GraphQL Admin API. The endpoint verifies Shopify's
`X-Shopify-Hmac-Sha256` against the untouched request bytes, validates the topic
and payload boundaries, and confirms `X-Shopify-Shop-Domain` matches
`SHOPIFY_STORE_DOMAIN`. Any valid subscribed topic expires the shared `shopify`
cache tag and the generated sitemap; carts, customers, and mutations are
unaffected because they use `no-store`.

Use Shopify CLI to send a test delivery after deployment:

```bash
shopify app webhook trigger --api-version=2026-07 --address=https://your-storefront.example/api/webhooks/shopify --topic=products/update
```

### Sanity

Generate a separate random secret of at least 32 characters and add it to the
storefront environment:

```dotenv
SANITY_REVALIDATE_SECRET=your_random_sanity_webhook_secret
```

In **Sanity Manage → API → Webhooks**, create a GROQ-powered webhook with:

- URL: `https://your-storefront.example/api/webhooks/sanity`
- Dataset: the value of `NEXT_PUBLIC_SANITY_DATASET`
- Trigger on: create, update, and delete
- Filter: `coalesce(after()._type, before()._type) in ["siteSettings", "homePage", "editorialPage"]`
- Projection: `{ "_id": coalesce(after()._id, before()._id), "_type": coalesce(after()._type, before()._type) }`
- Secret: the same `SANITY_REVALIDATE_SECRET`
- Drafts and release versions: disabled

The endpoint uses Sanity's signed-body verifier, checks the delivery dataset,
waits briefly for Content Lake/CDN propagation, validates the projected body,
and expires the shared `sanity` cache tag. Restricting the webhook to the two
published document types currently queried by the storefront avoids a delivery
for every Studio keystroke. Use Sanity's webhook attempts log to verify a `200`
response after publishing and deleting test content.

## Customer account migration status

In Shopify admin, open **Settings → Customer accounts**, enable customer
accounts, and keep `SHOPIFY_STORE_DOMAIN` set to the store's validated
`*.myshopify.com` domain. Clicking the header user icon now navigates directly
to that store's `/account` entry point. Shopify shows its passwordless login to
signed-out customers and the hosted account to customers who already have a
Shopify session. The canonical `/account/login` route performs the same hosted
redirect, so saved links no longer render the legacy password form.

This is the first migration slice, not the completed hybrid integration. The
existing `/account` dashboard, registration, password recovery, address,
profile, and legacy session services are intentionally retained for the next
Customer Account API work. Until OAuth/PKCE callback and token storage are
implemented, signing in on Shopify does not authenticate the custom `/account`
dashboard or associate its customer identity with the headless cart.

The retained legacy implementation uses a secure HTTP-only customer access
token, associates an existing cart through Shopify buyer identity, and removes
that association on logout. It should not be treated as the active sign-in path
once the store is switched to new customer accounts.

The next migration slice will add the Customer Account API OAuth authorization
and callback routes, PKCE/state/nonce validation, encrypted server-side session
cookies, token refresh and logout, and authenticated cart buyer identity.

## Connect Sanity and edit storefront content

The repository contains a standalone Sanity Studio in `studio/`. It owns the
homepage banner, header logo, optional site-name override, primary navigation
with one level of child links, and the complete footer.

1. Create or select a project at [sanity.io/manage](https://www.sanity.io/manage).
2. Add the project values to the root `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=
   SANITY_API_VERSION=2026-08-27
   ```

3. Copy `studio/.env.example` to `studio/.env.local` and add the same project ID
   and dataset.
4. Restart `npm run dev`, then open
   [http://localhost:3000/studio](http://localhost:3000/studio).
5. Open the **Homepage** singleton and add up to five items under **Banner
   carousel**. Upload each image, add its alternative text, title, description,
   and optional CTA, then turn on **Show homepage banner** for every slide that
   should appear. Drag items to reorder them and publish the document. The
   existing Shopify introduction remains visible until at least one complete,
   enabled banner is published.
6. Open the **Site settings** singleton, optionally enable **Show announcement
   bar** and add up to five ordered announcements, then edit the header, footer, and **SEO and
   social sharing** defaults, then publish it. The SEO block accepts the default
   homepage title, description, and a recommended 1200 × 630 sharing image.
   Footer link columns are single-level; social-platform icons are selected
   automatically from each configured platform.
7. Open **Editorial pages** and create documents for `About`, `Contact`, `FAQ`,
   `Shipping and returns`, `Privacy policy`, and `Terms`. Generate a lowercase
   slug for each document, add at least one page-builder section, complete the
   optional page-level SEO fields, and publish. A Page hero is optional, but if
   used it must be the first section; the storefront otherwise renders the page
   title as its heading.
8. Return to **Site settings** to expose those pages. Choose **Editorial page**
   as a link destination, select the published document, and publish the
   settings. The same reference destination is available for primary links,
   child links, footer links, homepage/banner CTAs, and page-builder CTAs.

To add a Home link, set **Label** to `Home`, choose **Internal store path**, and
enter `/` in **Internal path**. The **External website URL** option is only for
complete `https://` destinations; entering `/` there intentionally
shows a validation message directing the editor back to the internal option.
Store routes such as `/collections/all` also remain **Internal store path**
destinations; use **Editorial page** for Sanity documents rather than copying
their slug into a path field.

The Studio is embedded at `/studio` for convenient theme setup. You can also run
the standalone Vite-powered editor with `npm run studio:dev` and open
[http://localhost:3333](http://localhost:3333); this remains the faster option
for day-to-day schema work and TypeGen workflows.

The project ID and dataset are public identifiers. Keep
`SANITY_API_READ_TOKEN` server-only; it is only required for a private dataset.
Published homepage, editorial-page, header, and footer content is projected
explicitly and validated with Zod. Editorial pages use a five-minute fallback
revalidation plus shared and slug-specific cache tags; published webhook
deliveries expire the provider-wide Sanity tag immediately. The homepage
carousel uses its own 60-second
`sanity-home-page` cache tag, while the header and footer share the 60-second
site-settings cache tag. Banner images use responsive URLs served directly by
Sanity's image CDN, capped at each uploaded asset's available width; this avoids
unnecessary upscaling and a second pass through the Next.js image optimizer.
Until Sanity is connected and the relevant singleton is published, these
regions use Shopify-aware and theme-safe fallback content.

## SEO and discovery

The root metadata uses the Sanity SEO defaults, with the Sanity site name and
Shopify shop identity as fallbacks. Product and collection titles and
descriptions continue to come from Shopify's native search-engine listing
fields, and their featured images populate Open Graph and X/Twitter cards.
Canonical URLs intentionally omit collection filters, sort choices, and cursor
parameters so those browsing states do not compete with the collection URL.

`/sitemap.xml` is generated from Shopify's Storefront sitemap resources for the
product and collection routes this application implements. It is cached for one
hour and includes Shopify's `updatedAt` timestamps. `/robots.txt` references the
sitemap and excludes carts, search, account/authentication, APIs, and Studio;
those customer-specific pages also emit `noindex` metadata. The homepage emits
Organization and WebSite JSON-LD, product pages emit Product/Offer and
breadcrumb data, and collection pages emit breadcrumbs. Structured-data scripts
carry the request CSP nonce and escape HTML-significant characters.

During `npm run dev`, the CSP permits inline styles because Next.js DevTools
injects the development indicator styles at runtime. Production keeps the
stricter nonce-only `style-src` policy. The development badge itself is expected
and is never part of the production storefront.

## Connect Klaviyo newsletter signup

The footer submits newsletter signups to Klaviyo's server-side bulk profile
subscription endpoint. Create a private API key with `lists:write`,
`profiles:write`, and `subscriptions:write` scopes, then add the target list and
key to the root `.env.local`:

```dotenv
KLAVIYO_LIST_ID=your_list_id
KLAVIYO_API_KEY=your_private_api_key
```

Restart the app after changing these values. Keep the `pk_` private key out of
source control and never rename it with a `NEXT_PUBLIC_` prefix. Newsletter
requests use `no-store`; Klaviyo applies the selected list's single- or
double-opt-in behavior, so a subscriber may need to confirm by email.

Shopify records email-marketing consent on customer profiles and can send
campaigns through Shopify Email, but the Storefront API does not provide an
email-only guest newsletter mutation for a headless storefront. The footer
therefore uses Klaviyo for every valid address. When a legacy customer is signed
in, the form is prefilled with their uncached Shopify email. Submitting that
same address also updates the account's `acceptsMarketing` preference through
the authenticated `customerUpdate` mutation. If the entered address differs
from the account email, Klaviyo receives the subscription but the Shopify
account remains unchanged. Store-level double opt-in can still require email
confirmation.

## Security hardening and deployment

The starter validates every public input and external response, keeps Shopify,
Sanity, Klaviyo, Redis, cart, and customer credentials server-only, and applies
separate sliding-window limits to authentication accounts and client IPs. Cart,
account, newsletter, predictive-search, and location requests are also limited.
Local development uses a bounded in-process fallback; production should use
Upstash so every server instance shares the same counters.

```dotenv
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_server_only_token
RATE_LIMIT_KEY_SALT=at_least_32_random_characters
TRUSTED_PROXY_IP_HEADER=x-vercel-forwarded-for
SERVER_ACTION_ALLOWED_ORIGINS=
```

Generate a salt with Node and store it only in the deployment environment:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Set `TRUSTED_PROXY_IP_HEADER` to a header that the production edge or reverse
proxy always removes and rewrites. Use `x-vercel-forwarded-for` on Vercel or
`cf-connecting-ip` behind Cloudflare. The default `x-forwarded-for` is suitable
only when that header is controlled by the deployment proxy; accepting a
client-supplied forwarding header lets attackers evade IP-based limits and
weakens Shopify's buyer-level bot protection.

Next.js already compares Server Action `Origin` and `Host` values to prevent
cross-site invocation. Leave `SERVER_ACTION_ALLOWED_ORIGINS` blank for normal
same-origin deployments. If a trusted reverse proxy changes that relationship,
add only its hostnames, without protocols or paths. Server Action request bodies
are capped at 64 KB.

Storefront documents receive a nonce-based Content Security Policy plus HSTS in
production, same-origin framing, MIME-sniffing protection, a restrictive
permissions policy, safe referrer behavior, and no framework branding header.
The embedded `/studio` route keeps the shared browser-security headers but is
excluded from the storefront CSP because Sanity Studio has its own authenticated
cross-origin runtime. Production cart and customer cookies use the `__Host-`
prefix, `Secure`, `HttpOnly`, `SameSite=Lax`, root path, and high priority;
legacy cookie names are accepted temporarily and replaced on the next write.

External Shopify, Sanity, and Klaviyo calls have finite timeouts. All rendered
external links and commerce URLs are restricted to HTTPS, while internal CMS
links reject protocol-relative destinations. Run `npm audit`, lint, type checks,
and a production build before each deployment. See [`SECURITY.md`](./SECURITY.md)
for the reporting process and full deployment checklist. These controls are
defense in depth; CDN/WAF rules, least-privilege provider scopes, secret rotation,
monitoring, backups, and Shopify customer-account policy remain deployment
responsibilities.

## Project structure

```text
src/
  app/                       Storefront route group, embedded Studio, and global CSS
  components/account/        Customer account forms and shared account layout
  components/commerce/       Product, collection, cart, and predictive-search UI
  components/editorial/      Sanity page-builder and interactive editorial UI
  components/layout/         Responsive global header, footer, and mobile drawer
  components/ui/             shadcn/ui component source
  components/storefront/     Reusable storefront and Motion presentation
  lib/sanity/                Sanity env, GROQ, caching, and Zod validation
  lib/klaviyo/               Server-only newsletter config and subscription service
  lib/locations/             Cached country and province/state validation
  lib/security/              Request identity and distributed abuse limits
  lib/shopify/client.ts      Storefront GraphQL transport and response validation
  lib/shopify/graphql/       Fragments, queries, and generated operation artifacts
  lib/shopify/schemas/       Runtime Zod schemas and inferred TypeScript types
  lib/shopify/services/      Reusable Shopify data-access functions
  lib/validation/            Shared input and external-response boundaries
studio/
  src/schemaTypes/           Page builder, homepage, settings, navigation, and footer schemas
  sanity.config.ts           Standalone Studio and singleton configuration
```

The homepage waits for an incoming request before reading environment variables,
which makes the same deployment build usable with different runtime store
configuration. The Shopify homepage catalog is cached for five minutes, while
the public Sanity banner is cached independently for 60 seconds and editorial
pages use a five-minute tagged cache with an hourly sitemap read. Collection
browse responses use Next.js's persistent fetch cache with 60-second
revalidation, filter-, sort-, and cursor-aware cache keys, a global collection
tag, and a handle-specific tag. Cart and customer requests always use `no-store`
and are never placed in the shared cache. Klaviyo subscription mutations are
also uncached.

## Commands

```bash
npm run dev        # start the Turbopack development server
npm run lint       # run ESLint
npm run typecheck  # run TypeScript without emitting files
npm run test       # run Node unit and integration tests
npm run test:e2e   # run Playwright journeys in headless Chromium
npm run test:e2e:ui # open the Playwright interactive test runner
npm run graphql:codegen # validate operations against Shopify and regenerate artifacts
npm run build      # create a production build
npm run start      # serve the production build
npm run studio:dev       # start standalone Sanity Studio on localhost:3333
npm run studio:typecheck # type-check the Studio workspace
npm run studio:build     # build Studio (requires Studio env values)
```

## Testing and continuous integration

Unit and integration tests use Node's built-in test runner with `tsx` as the
TypeScript loader. They cover application and security boundaries including
cart behavior, Shopify response handling, customer sessions, content
normalization, environment validation, rate limiting, and signed Shopify and
Sanity webhooks. Provider requests are mocked, and the shared test setup rejects
unexpected `fetch` calls so these tests do not require real credentials or
contact Shopify, Sanity, Klaviyo, or other external services.

Playwright covers configured storefront journeys in desktop and mobile
Chromium. Copy the E2E placeholders from `.env.example` into the ignored
`.env.e2e.local` file and use only a designated development or staging Shopify
store and Sanity dataset. The suite validates its approved hosts and provider
identifiers before launching a browser, intercepts checkout before Shopify is
loaded, and does not place orders or publish content. See
[`TESTING.md`](./TESTING.md) for the required fixture data and safety rules.

The basic GitHub Actions workflow runs for pushes and pull requests targeting
`main`, `staging`, or `clean/shopify-sanity-core`. Separate Ubuntu and Windows
jobs use Node 24.11.1 and run:

```bash
npm ci
npm run test
npm run lint
npm run typecheck
npm run build
```

The workflow has read-only repository permissions and receives no storefront,
customer, CMS, newsletter, Redis, or deployment credentials. Playwright remains
outside CI until a protected staging environment and appropriately scoped
secrets are configured; run `npm run test:e2e` locally for the current browser
suite.

## Vercel deployment workflow

Use separate Vercel projects for staging and production. The staging project
tracks the protected `staging` branch and uses only development or staging
Shopify, Sanity, Klaviyo, and Upstash resources. Feature branches may create
preview deployments in that project, while the stable staging hostname is the
only preview-side destination for Shopify and Sanity webhooks. Run the browser
suite against that stable hostname before promoting the same tested changes to
`main`.

The production project tracks only `main`. Assign production credentials only
to its Production environment; leave its Preview environment unconfigured or
connect it exclusively to non-production services. Never assign production
customer credentials to Vercel or the E2E suite. Keep webhook secrets, rate-limit
salts, provider tokens, and datasets distinct between projects.

For both projects, use the repository root, the detected Next.js framework,
`npm ci` as the install command, `npm run build` as the build command, and Node
24.x. Set `STOREFRONT_BASE_URL` to each project's stable public origin. On
Vercel, use `x-vercel-forwarded-for` as the trusted proxy IP header and normally
leave `SERVER_ACTION_ALLOWED_ORIGINS` unset unless a reviewed reverse proxy
changes the request host relationship.

Recommended promotion flow:

1. Open a pull request from a feature branch into `staging`.
2. Require Ubuntu and Windows CI before merging.
3. Verify the stable staging deployment and run `npm run test:e2e` against it.
4. Open a pull request from `staging` into `main`.
5. Require CI again, review the deployment diff, and merge only with explicit
   production approval.

Vercel CLI linkage and project settings are local or dashboard state and are
not committed. The ignored `.vercel/`, `.env.local`, and `.env.e2e.local` paths
must remain outside source control.

## Extending the storefront

- Add GraphQL documents to `src/lib/shopify/graphql` and regenerate their
  artifacts with `npm run graphql:codegen`.
- Add matching Zod schemas to `src/lib/shopify/schemas`; inferred types keep
  API data and UI props synchronized.
- Keep every Sanity request in `src/lib/sanity` and update its projected GROQ and
  Zod schema together whenever homepage, header, or footer fields change.
- Call `shopifyFetch` only from server-side modules. Pass a buyer IP when making
  buyer-driven private-token requests so Shopify can apply buyer-level traffic
  protection correctly.
- Add shadcn/ui components with `npx shadcn@latest add <component>`.
- Keep Shopify product images on `cdn.shopify.com`, or add narrowly scoped image
  hosts to `next.config.ts` when an integration returns another trusted domain.

## Change documentation

Every feature, fix, dependency change, configuration adjustment, and meaningful
documentation update must be recorded in [`changes.md`](./changes.md). The same
rule is included in `AGENTS.md` for future coding-agent sessions.

## Official references

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Shopify Storefront API setup](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started)
- [Shopify Storefront API reference](https://shopify.dev/docs/api/storefront/latest)
- [Shopify customer email consent](https://shopify.dev/docs/storefronts/themes/customer-engagement/email-consent)
- [Shopify customerUpdate mutation](https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate)
- [Sanity with Next.js](https://www.sanity.io/docs/nextjs)
- [Sanity Structure Builder](https://www.sanity.io/docs/studio/structure-builder-reference)
- [Klaviyo API authentication](https://developers.klaviyo.com/en/v2026-01-15/docs/authenticate_)
- [Klaviyo bulk profile subscription](https://developers.klaviyo.com/en/reference/bulk_subscribe_profiles)
- [shadcn/ui for Next.js](https://ui.shadcn.com/docs/installation/next)
- [Motion for React](https://motion.dev/docs/react)
- [Embla Carousel for React](https://www.embla-carousel.com/get-started/react/)
- [Zod documentation](https://zod.dev/)
- [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database)

Country and state/province data is provided by the Countries States Cities
Database under the Open Database License (ODbL) v1.0.
