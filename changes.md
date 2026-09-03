# Changes

All notable changes to this project are documented here. Add an entry for every
major or minor code, configuration, dependency, and documentation change.

## 2026-09-03 - Phase 2 Playwright end-to-end test foundation

- Corrected the browser suite after its first live development-store run:
  collection sorting now waits for client hydration before interaction, the
  server-driven sort transition has a bounded parallel-run timeout, the
  cart journey targets visible drawer quantity headings instead of the
  accessibility-hidden page background, and mobile Sanity navigation entries
  remain semantic links while closing the menu after navigation. Variant
  selection also tolerates valid sold-out alternatives whose action label
  changes. The portable
  mobile journey uses Shopify's built-in all-products collection and its first
  available product rather than depending on a store-specific Sanity child-link
  URL or product pagination position.
- Replaced the deprecated default `@sanity/image-url` builder import with the
  supported named export, without changing generated image URLs.
- Added Playwright as a development-only dependency with separate headless and
  UI scripts, desktop Chromium and mobile Chromium projects, local web-server
  startup, two-worker concurrency and network-aware journey timeouts, and
  failure-focused screenshots, videos, and traces.
- Added fail-fast E2E environment validation that rejects the declared
  production storefront, requires HTTPS for external targets, and requires
  explicit Shopify store and Sanity project/dataset approvals before a browser
  starts. Real values stay in the ignored `.env.e2e.local` file.
- Added isolated browser journeys for storefront landmarks and navigation,
  collection sorting and malformed filters, product pricing and availability,
  cart quantity/subtotal/removal behavior, intercepted checkout handoff,
  predictive search and invalid queries, Sanity editorial content, the 404
  experience, and mobile navigation/cart usability and overflow.
- Added accessible product-price and cart-subtotal labels so browser tests and
  assistive technology can identify changing commerce values without relying
  on generated classes or DOM structure.
- Documented the development/staging test-data contract, browser installation,
  safe future CI integration, ignored Playwright artifacts, and deferred
  authentication, Firefox, WebKit, and visual-regression coverage.

## 2026-09-03 - Phase 1 unit and integration test infrastructure

- Added the development-only `tsx` loader so Node's built-in test runner can
  execute the storefront's TypeScript module graph without introducing another
  test framework. Updated the cross-platform test command to use Node test
  discovery, React Server export conditions, and built-in ESM module mocks.
- Added shared test setup that rejects unexpected external `fetch` requests
  immediately and restores Node mocks and modified environment variables after
  every test. Updated the testing guide with the actual runner, isolation, and
  network-mocking conventions.
- Added integration coverage for Shopify request authentication, caching,
  response validation, HTTP/GraphQL/network failures, cart creation, quantity
  updates, line removal, mutation warnings and user errors, customer login, and
  secure cart/customer session cookies. All provider requests use deterministic
  in-process mocks.
- Added boundary coverage for collection filters, sorting, price ranges,
  pagination cursors, search and handle inputs, discounted cart subtotals,
  Shopify and Sanity environment parsing, Sanity response validation and
  missing-content fallbacks, Sanity fetch cache settings, and authenticated
  Shopify webhook rejection paths.
- Added integration coverage that signs synthetic Sanity webhook payloads with
  `@sanity/webhook` and exercises the real `next-sanity` `parseBody()` path for
  valid, tampered, missing-signature, and wrong-secret requests. Declared the
  signing toolkit as a development dependency because tests import it directly
  instead of relying on `next-sanity`'s transitive dependency.
- Added explicit malformed Shopify GraphQL-envelope cases and replaced the
  subtotal test's partial cart line with a production-valid fixture.
- Aligned the secured `main` branch cart-cookie test with its existing
  high-priority cookie protection so the assertion covers the hardened option.
- Deferred blocking non-`fetch` network transports until tests introduce a
  client that uses them. Also deferred reconsidering the test command's broad
  `ExperimentalWarning` suppression; neither safeguard is claimed as present.
- Updated `package-lock.json` for the approved test-only dependencies. No
  production runtime behavior, environment configuration, Shopify GraphQL
  operation, generated artifact, or API version changed.

## 2026-09-03 - Sanity announcement bar

- Added an optional announcement bar to the Sanity `siteSettings` singleton
  with up to five ordered messages and optional editorial-page, internal-path,
  or HTTPS external destinations. Published fields are explicitly projected by
  GROQ and validated with Zod at the existing server-only Sanity boundary.
- Added a compact responsive header announcement component. One message renders
  statically; two or more use the existing Embla dependency for dragging,
  previous/next and pause/play controls, and five-second autoplay that pauses
  on hover, focus, or a hidden tab and remains disabled for reduced-motion
  visitors.
- Added a shared total site-header height token so product, collection, cart,
  and homepage sticky/viewport layouts account for the optional bar without
  changing the existing navigation height. Updated Sanity authoring guidance.
  No dependency, environment, Shopify GraphQL artifact, API-version, or content
  migration change is required; configure and publish the existing Site
  settings singleton to opt in.

## 2026-09-01 - Dual secured and provider-neutral distributions

- Established `clean/shopify-sanity-core` as a clean branch based directly on
  the pre-hardening storefront. It now includes the current Sanity editorial
  page builder, editorial navigation references, Shopify/Sanity SEO, robots and
  sitemap generation, and authenticated cache webhooks without inheriting the
  combined security commit in its branch history.
- Removed Upstash dependencies and environment keys, application-wide rate
  limiting, proxy-specific client-IP trust, global CSP/security middleware,
  hardened-cookie migration, and security deployment documentation from the
  core distribution. Required provider webhook signature verification,
  bounded payload handling, HTTP-only identifiers, and Zod boundary validation
  remain part of their corresponding reusable features.
- Added persistent branch policy to both distributions: generally reusable
  Shopify, Sanity, editorial, SEO, and webhook features must stay in parity,
  while deployment-specific security choices remain exclusive to secured
  `main`. Documented the distinction in both READMEs.
- Made the root layout type-check without relying on generated global route
  helper types, improving fresh-clone verification in both branches. No
  environment migration, Shopify GraphQL operation, generated artifact, or API
  version changed on secured `main`.

## 2026-09-01 - Mobile menu trigger semantics

- Corrected the mobile navigation Sheet trigger's Base UI contract by marking
  its rendered shadcn/Base UI Button as a native button and explicitly setting
  `type="button"`. This removes the development warning about applying
  non-native button behavior to an actual `<button>` and avoids unintended
  ARIA/role attributes while preserving the existing appearance and drawer
  interaction.
- No dependency, environment, content, Shopify GraphQL artifact, or API-version
  change is required. Restart an already-running development server if its
  compiled client still displays the previous warning.

## 2026-09-01 - Local environment template parity

- Synchronized the ignored local environment file with every key currently
  documented by `.env.example` without changing or exposing existing provider
  credentials. Added the active localhost storefront origin and the default
  trusted proxy header; optional Upstash distributed-rate-limit values, its
  conditional salt, and exceptional Server Action proxy origins remain blank
  until their corresponding production infrastructure is configured.
- No application code, dependency, external service, Shopify GraphQL artifact,
  or API-version change was required. Restart the development server so Next.js
  loads the added environment values.

## 2026-09-01 - Sanity editorial and legal page builder

- Added a reusable Sanity `editorialPage` document for root-level About,
  Contact, FAQ, Shipping and returns, Privacy policy, Terms, and future
  editorial pages. Documents include validated non-reserved slugs, ordered
  page-builder sections, page-specific SEO fallbacks, social images, and an
  optional `noindex` setting; no existing content migration is required.
- Added focused Page hero, rich-text, FAQ, contact-details, and callout object
  types with accessible authoring constraints, stable array keys, required
  image alternative text, secure rich-text links, clear block previews, and a
  maximum of one first-position hero per page.
- Added an Editorial pages Studio list and expanded reusable navigation fields
  with strong editorial-page references. Header links, nested header links,
  footer links, homepage CTAs, and editorial CTAs now resolve current page slugs
  through GROQ while retaining existing internal-path and HTTPS destinations.
- Added a validated, server-only editorial-page query and service with explicit
  projections, five-minute fallback revalidation, provider/page/slug cache
  tags, and graceful behavior when Sanity is not configured. Portable Text,
  every builder block, images, links, metadata, sitemap records, and route slugs
  are validated with Zod at the Sanity boundary.
- Added a responsive root `/<slug>` Server Component route with page-builder
  rendering, eager above-the-fold hero images, semantic headings, native FAQ
  disclosures, contact links, safe external-link behavior, canonical metadata,
  social cards, `noindex` support, breadcrumb structured data, and the existing
  branded 404 behavior for invalid, missing, or unpublished pages.
- Added indexable editorial pages to the generated sitemap with Sanity update
  timestamps and expanded the recommended Sanity webhook filter to include
  `editorialPage`, allowing published changes and deletions to invalidate the
  shared Sanity cache after deployment. Updated README authoring, navigation,
  caching, webhook, and project-structure guidance. No dependency, environment,
  Shopify GraphQL artifact, or API-version change was required.

## 2026-09-01 - Authenticated Shopify and Sanity cache webhooks

- Added `POST /api/webhooks/shopify` for HTTPS webhook deliveries. The handler
  reads the untouched bounded JSON body, verifies Shopify's base64 HMAC-SHA256
  in constant time with a server-only app client secret, validates delivery
  headers and payloads with Zod, and rejects deliveries whose shop domain does
  not match the configured `myshopify.com` store.
- Added `POST /api/webhooks/sanity` using `next-sanity`'s signed-body parser,
  Content Lake propagation delay, configured-dataset verification, bounded JSON
  bodies, and Zod validation. The recommended GROQ filter targets only the
  published `siteSettings`, `homePage`, and `editorialPage` documents consumed by the
  storefront, avoiding draft-keystroke webhook traffic.
- Added a provider-wide `sanity` tag to every cached Sanity fetch, matching the
  existing provider-wide `shopify` tag. Valid Shopify deliveries immediately
  expire all public Shopify fetch caches and the generated sitemap; valid Sanity
  deliveries immediately expire all Sanity fetch caches. Existing time-based
  revalidation remains the outage/misconfiguration fallback, while carts,
  customer sessions, authenticated data, and mutations remain uncached.
- Expanded product-detail, recommendation, and storefront-home cache tags so
  inventory, product, collection, and store-identity changes also participate
  in granular invalidation and future webhook routing.
- Added `SHOPIFY_WEBHOOK_SECRET` and `SANITY_REVALIDATE_SECRET` placeholders and
  documented their distinct ownership, HTTPS endpoints, recommended Shopify
  catalog topics, Sanity filter/projection, testing, delivery monitoring, and
  production checklist requirements. Existing deployments must configure both
  secrets and create the external subscriptions before on-demand invalidation
  becomes active; no content or data migration is required.
- Added regression tests for exact raw-body Shopify HMAC verification, tamper
  rejection, JSON content-type enforcement, and declared/actual webhook body
  limits. No dependency, Shopify Storefront GraphQL operation, generated
  artifact, or API-version change was required.
- Retained the Next.js 16.3 development server's managed `AGENTS.md` guidance,
  which directs future coding work to the installed version-specific framework
  docs and prevents `next dev` from repeatedly dirtying the working tree.

## 2026-09-01 - Storefront SEO and Next development indicator fix

- Added a validated `STOREFRONT_BASE_URL` setting for the public headless origin
  used by canonical metadata, structured data, `robots.txt`, and `sitemap.xml`.
  Existing deployments should set it to their customer-facing HTTPS domain;
  Vercel production URLs and localhost remain development/platform fallbacks.
- Added Sanity-editable global SEO defaults for the homepage title, description,
  and social sharing image. The existing Site settings singleton now owns these
  optional overrides, with Shopify shop identity and safe starter copy as
  fallbacks. No existing Sanity content migration is required.
- Added canonical URLs plus Open Graph and X/Twitter cards to the homepage,
  products, and collections. Product and collection pages use Shopify's native
  SEO fields before their normal title/description, while featured images are
  validated and reused for social previews. Collection canonicals intentionally
  omit sorting, filtering, and cursor parameters.
- Added nonce-bearing, HTML-safe JSON-LD for the storefront Organization and
  WebSite, product Offer availability/pricing, and product/collection
  breadcrumbs. Account, authentication, cart, and search pages remain excluded
  from indexing.
- Added generated `robots.txt` and an hourly cached sitemap containing the home
  and all-products routes plus Shopify Storefront sitemap resources for every
  implemented product and collection page. Empty Shopify sitemap pages are
  handled using `hasNextPage`, responses are Zod-validated, and user-specific
  data is never cached into the sitemap.
- Expanded the Shopify product, collection, variant, and shop operations and
  matching Zod schemas with SEO, product type, SKU, and description data.
  Regenerated and validated all 29 Storefront operations against API version
  2026-07; no Storefront API version or dependency changed.
- Fixed the malformed Next.js development indicator by allowing its
  runtime-injected inline styles only in development. Production retains the
  strict nonce-only `style-src` policy, so this compatibility adjustment does
  not weaken the deployed storefront CSP.
- Documented SEO ownership, sitemap caching, structured data, canonical URL
  behavior, Sanity authoring, the required public URL, and the development-only
  CSP exception in README.

## 2026-09-01 - Storefront security hardening

- Added layered abuse protection to login, registration, password recovery,
  authenticated account writes, cart mutations, newsletter signup, predictive
  search, and location lookups. Authentication uses independent per-IP and
  HMAC-pseudonymized per-account sliding-window buckets to cover both targeted
  and credential-stuffing patterns; cart and account writes also use independent
  resource/session buckets.
- Added `@upstash/ratelimit` 2.0.8 and `@upstash/redis` 1.38.3 for shared
  production limits, plus a bounded in-process fallback that remains active in
  local development or during a transient Redis failure. Added server-only
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
  `RATE_LIMIT_KEY_SALT`, and trusted-proxy configuration placeholders. Existing
  deployments must add the three Upstash/salt values for multi-instance limits.
- Centralized buyer-IP extraction behind one explicitly selected proxy header.
  Shopify buyer traffic, account pages, footer personalization, and abuse
  limits now use the same validated IP boundary rather than trusting an
  arbitrary first matching forwarding header.
- Added a nonce-based storefront Content Security Policy and global HSTS
  (production), same-origin framing, MIME-sniffing, referrer, browser-feature,
  opener, resource, and legacy cross-domain policy headers. Disabled the
  framework branding header and limited Server Action bodies to 64 KB while
  preserving Next.js's built-in same-origin CSRF check and optional trusted
  reverse-proxy origins.
- Hardened production cart and customer cookies with `__Host-` names and high
  priority while retaining read/clear compatibility for legacy cookie names.
  Existing sessions remain readable and migrate on their next cookie write; no
  manual data migration is required.
- Restricted Shopify response, Sanity image/social, checkout, order-status, and
  editorial external URLs to HTTPS. Internal CMS links now reject
  protocol-relative and control-character destinations, and Studio validation
  guides editors to secure external URLs.
- Added finite Shopify, Sanity, and Klaviyo request timeouts, generic predictive
  search validation responses, no-store search responses, and generic
  authentication errors that reduce account enumeration and validation-detail
  disclosure.
- Added Node regression tests for allowed HTTPS/internal editorial links,
  rejected insecure/executable/protocol-relative links, HTTPS-only external
  response URLs, and strict trusted-header IPv4/IPv6 parsing.
- Added `SECURITY.md` with private reporting guidance and a production security
  checklist, and documented rate limiting, proxy trust, Server Action origins,
  CSP scope, cookie migration, and residual CDN/provider responsibilities in
  README. The final full `npm audit` reported zero known advisories across all
  1,537 dependencies. No Shopify GraphQL operation, generated artifact, or
  Storefront API version changed.

## 2026-08-28 - Collection cursor pagination

- Added Shopify cursor pagination to every collection route, including
  `/collections/all`, with 24 products per page and responsive Previous/Next
  controls. Pagination URLs retain the selected sort value and every validated
  Shopify Search & Discovery filter, including price range filters.
- Added strict `after` and `before` query-parameter parsing with length limits
  and ambiguous-cursor rejection. Applying filters or changing the automatic
  sort intentionally removes the cursor and returns the customer to the first
  page of the new result set.
- Expanded the `Collection` and `AllProducts` Storefront API queries with
  nullable forward/backward cursor variables and a reusable `PageInfo`
  fragment. Added matching Zod response validation, directional `first`/`last`
  service variables, cursor-aware cached request bodies, and safe empty-state
  pagination metadata.
- Validated and regenerated all 28 Shopify Storefront operations against API
  version 2026-07. Updated README browsing and caching documentation and
  corrected its stale add-to-cart description. No dependency, environment
  variable, content migration, or API-version change was required.

## 2026-08-28 - Sanity homepage banner carousel and image delivery fix

- Replaced the single homepage banner editor with a reorderable Sanity array of
  up to five banner instances. Each slide retains its own enable toggle, image
  and alternative text, title, description, and optional internal or external
  CTA; the Storefront uses Sanity's stable array `_key` values throughout.
- Preserved the former `banner` field as read-only deprecated content and added
  a GROQ fallback that renders it as one slide until editors add the new
  carousel array. No destructive content migration is required.
- Rebuilt the storefront hero as a draggable, looping Embla carousel with fixed
  desktop previous/next controls, mobile-friendly swipe navigation, direct
  slide selectors, reduced-motion-aware navigation, live slide announcements,
  and one page-level heading. The first image remains eager and high priority;
  later images load lazily.
- Fixed the Sanity image 500 response by removing the forced 2400x960 upstream
  crop and the second `/_next/image` optimization pass. Responsive image URLs
  now load directly from Sanity's CDN, preserve crop and hotspot intent, use
  LQIP placeholders, and cap requested widths at the uploaded asset's actual
  cropped width to prevent upscaling.
- Updated the root and Studio READMEs with the five-slide limit, ordering,
  enablement, fallback, caching, and image-delivery behavior. No dependency,
  environment variable, Shopify GraphQL, generated artifact, or Storefront API
  version changed.

## 2026-08-28 - Sanity-managed homepage banner

- Added a dedicated **Homepage** singleton to Sanity Studio with a guarded
  enable toggle, hotspot-aware image and required alternative text, title,
  description, and one optional internal or external CTA. The singleton is
  protected from duplicate creation and appears directly in Studio navigation.
- Added an explicitly projected GROQ query, strict Zod response validation, a
  server-only data service, and an independent 60-second `sanity-home-page`
  cache tag. Disabled, incomplete, invalid, unpublished, or unavailable banner
  content safely falls back to the existing Shopify store introduction.
- Added a responsive full-width storefront banner that honors Sanity crop and
  hotspot metadata, uses an eager LQIP-backed hero image for LCP, and preserves
  the existing products and recent collections below it.
- Added `@sanity/image-url` 2.1.1 as a direct dependency for Sanity-aware image
  transformation and updated the npm lockfile. Updated the root and Studio
  READMEs with banner authoring, fallback, and caching instructions.
- No Shopify GraphQL operation, generated artifact, Storefront API version,
  environment variable, or content migration changed. Editors only need to
  create and publish the new Homepage singleton when they want the banner.

## 2026-08-28 — LCP image loading and Home-link guidance

- Added an explicit eager-loading option to reusable product and collection
  cards. The first desktop row on home and search now loads eagerly because any
  of those responsive cards can become the page's LCP element, while lower
  catalog rows, related-product slides, and normally below-fold collections
  remain lazy to avoid unnecessary bandwidth competition.
- Changed the collection hero, header logo, and first product-gallery slide from
  the deprecated Next.js 16 `priority` prop to explicit eager loading. Later
  gallery slides and thumbnails remain lazy.
- Clarified the shared Sanity navigation fields with distinct “Internal store
  path” and “External website URL” choices, documented `/` as the Home path,
  and added targeted validation that redirects `/` and `#` values away from the
  external URL field. Updated README with the exact Home-link editing steps.
- No Shopify GraphQL, generated artifact, dependency, environment variable,
  content migration, or API-version change was required.

## 2026-08-28 — Shopify and Klaviyo newsletter synchronization

- Prefilled the footer newsletter input with the authenticated Shopify
  customer's email. Added a minimal, user-specific customer newsletter query
  that fetches only email and marketing status with `no-store`, preserving the
  existing cache for public Sanity footer content and avoiding the account
  dashboard's order and address payload.
- Updated footer submissions to subscribe every valid address through Klaviyo
  and also set Shopify `acceptsMarketing: true` when the submitted address
  matches the signed-in customer's account email. Different addresses never
  mutate the account, guest signups remain Klaviyo-only, and partial provider
  failures or double-opt-in confirmation states now receive explicit messages.
- Fixed the newsletter email field collapsing on mobile by removing its
  vertical `flex-1` behavior, enforcing a 48-pixel minimum control height, and
  using mobile-safe text sizing. The submit button now matches that height and
  fills the mobile row while retaining the prior responsive desktop layout.
- Added Zod schemas and reusable Shopify services for the customer newsletter
  profile and marketing opt-in. Validated and regenerated 28 Storefront API
  2026-07 operations, including the new `CustomerNewsletterProfile` query, and
  updated README behavior and API documentation. No dependency, environment,
  Sanity schema, or store migration is required.

## 2026-08-28 — Sanity footer and Klaviyo newsletter signup

- Added a responsive global footer to every storefront route with a left-side
  logo/name fallback, short description, social icons, configurable center link
  columns, a right-side newsletter form, and a compact copyright row. Removed
  the homepage-only placeholder footer to avoid duplicate site chrome.
- Expanded the existing Sanity `siteSettings` singleton with nested footer,
  social-link, link-column, single-level link, and newsletter schemas. Added
  field limits, HTTP(S) validation, unique social-platform validation, editor
  previews, and footer-specific logo alt-text enforcement.
- Added an explicit projected GROQ footer query with stable array `_key` values,
  matching Zod response validation, a reusable server-only data service, and the
  existing 60-second `sanity-site-settings` cache policy. Footer logo, site name,
  navigation columns, social profiles, and newsletter copy have safe fallbacks
  before the singleton is configured and published.
- Added a Zod-validated, server-only Klaviyo integration using the current bulk
  profile subscription job, a dated API revision, explicit provider-error
  handling, bot-trap input, and `no-store` mutation requests. The footer keeps
  submitted values after errors and provides accessible pending, success, and
  failure states.
- Added server-only `KLAVIYO_LIST_ID` and `KLAVIYO_API_KEY` configuration. The
  ignored local environment is configured for development; `.env.example`
  contains safe placeholders. Deployments must provide a private API key with
  `lists:write`, `profiles:write`, and `subscriptions:write` scopes.
- Added `react-icons` 5.7.0 for accurate social brand marks and updated the npm
  lockfile. Updated the root and Studio READMEs for footer editing, caching,
  Klaviyo opt-in behavior, environment setup, and security. No Shopify GraphQL,
  Storefront API version, or generated-artifact changes were required.

## 2026-08-28 — Guest-route guards and custom 404

- Added server-side session guards to `/account/login` and `/account/register`.
  Customers with an active secure session cookie are now redirected to their
  `/account` dashboard before either guest form renders. Added `/login` and
  `/register` aliases that route guests to the canonical account URLs and send
  authenticated customers directly to the dashboard.
- Added reusable branded 404 content with home and shop-all recovery actions,
  plus root and storefront-segment `not-found.tsx` boundaries. Unknown URLs and
  explicit product/collection `notFound()` responses now render the same theme;
  unmatched routes retain HTTP 404 while streamed boundaries use Next.js's
  built-in noindex not-found response.
- Extracted the existing header, cart provider, and cart drawer into a reusable
  `StorefrontShell` so global 404 responses keep the normal storefront chrome
  without duplicating commerce/session logic.
- Updated README and this change log. No GraphQL, generated artifact,
  dependency, environment-variable, or migration change is required.

## 2026-08-28 — Customer names, passwords, and marketing confirmation

- Expanded the customer-details editor with editable first and last names plus
  optional new-password and confirmation fields. Password visibility controls,
  boundary validation, matching confirmation, and controlled values preserve
  input after failures; password fields reset only after a successful update.
- Expanded `CustomerUpdateInput` validation and the existing `customerUpdate`
  mutation to request Shopify's replacement customer access token. Password
  changes now replace the secure HTTP-only session cookie and refresh the cart's
  buyer identity because Shopify invalidates every previous customer token.
- Added a secure HTTP-only remember-mode cookie so future replacement tokens
  preserve whether the customer selected the seven-day Remember me session.
  Logout clears both customer session cookies.
- Clarified marketing opt-in behavior by checking Shopify's returned customer
  state. If a requested subscription remains false, the form now explains that
  Shopify double opt-in might require email confirmation instead of reporting a
  misleading generic subscription success.
- Regenerated all 27 Shopify Storefront API 2026-07 operations and updated
  README. No dependency, environment-variable, or store migration is required.

## 2026-08-28 — Editable customer contact preferences

- Added an account-details editor for changing or removing the customer's phone
  number and opting in or out of email marketing. The controlled form retains
  values after validation or Shopify errors, validates phone numbers in E.164
  format, and refreshes the account view immediately after a successful update.
- Added Shopify's `customerUpdate` mutation, `CustomerUpdateInput` boundary
  schema, response validation, reusable uncached customer service, and an
  authenticated Server Action. Expired sessions and Shopify `customerUserErrors`
  receive explicit customer-facing messages.
- Regenerated the Shopify Storefront API 2026-07 artifact with 27 validated
  operations and updated README. The existing `unauthenticated_write_customers`
  permission is required; no dependency or environment-variable change is needed.

## 2026-08-28 — Fulfilled-order account metric

- Fixed the account summary showing Shopify's separate `numberOfOrders` profile
  value even when the fully loaded order history contained orders.
- The account metric now counts the fully paginated order connection and includes
  only orders whose Shopify fulfillment status is exactly `FULFILLED`. Renamed
  the card to “Total fulfilled orders” so partially fulfilled, pending,
  restocked, and unfulfilled orders are clearly excluded.
- Removed the unused `numberOfOrders` field from the customer GraphQL fragment
  and Zod schema, added a reusable customer-order metric utility, regenerated
  all 26 Storefront API operations, and updated README. No dependency,
  environment-variable, or store migration is required.

## 2026-08-28 — Editable cities, address deletion, and compact cards

### Address location behavior

- Changed city back to a normal, freely editable input because the offline
  dataset's city coverage is not reliable enough to constrain Shopify shipping
  addresses. The field is no longer populated or semantically validated from
  the community database; its submitted value is trimmed at the server boundary.
- Retained cascading country and state/province options and their server-side
  normalization. Removed city response schemas, cached city lookups, and the
  `cities` mode from `/api/locations` so unused location data is not exposed.
- Removed the location-data attribution from inside the address form to keep the
  form compact. The required project-level ODbL attribution remains in README.

### Saved-address actions and layout

- Added Shopify's `customerAddressDelete` GraphQL mutation, Zod response schema,
  uncached customer service, and authenticated Server Action. Deletion handles
  Shopify `userErrors`, expired sessions, and transport failures explicitly.
- Added a delete icon beside edit on every address and an accessible confirmation
  dialog before the destructive action runs.
- Reworked saved-address cards so edit and delete stay absolutely positioned at
  the top right without reserving blank header space. The Primary badge and Make
  primary action now occupy the same compact footer position on every card.

### GraphQL and documentation

- Regenerated the Shopify Storefront API 2026-07 artifact with 26 validated
  operations after adding address deletion.
- Updated README and this change log. No dependency, environment-variable, or
  store migration is required for these adjustments.

## 2026-08-28 — Order items and complete address management

### Order-history details

- Expanded the authenticated customer order fragment with up to 250 line items
  per order, including the historical combined item name, discounted line total,
  and variant image when the product still has one.
- Added a compact image, name, and price list inside every order-history card,
  with a small local icon fallback when a deleted variant or missing product
  image leaves the order line without media.

### Address editing and primary selection

- Added Shopify's `customerAddressUpdate` mutation, response validation, reusable
  customer service, and Server Action so existing customer addresses can be
  edited without bypassing the Shopify data layer.
- Added an edit icon to every saved-address card. Editing opens the shared form
  with the existing recipient, company, street, location, postal code, phone,
  and primary status prefilled; values remain intact after validation errors.
- Added a pending-aware “Make primary” action to every non-primary address and
  retained the optional primary-address control while creating or editing.
  Shopify `userErrors`, expired sessions, and partial update/default failures
  now receive explicit customer-facing messages.

### Validated country, province, and city selection

- Added `@countrystatecity/countries` 1.0.9 as a server-only, offline location
  dataset. The package is externalized from the Next.js server bundle so its
  lazy-loaded files remain available without adding a large browser bundle,
  third-party API key, or runtime CDN dependency.
- Added a Zod-validated `/api/locations` endpoint and cached location services.
  Countries, states/provinces, and cities are cached for 24 hours with a
  seven-day stale-while-revalidate browser window; only the selected hierarchy
  is loaded.
- Replaced free-text location fields with cascading country → state/province →
  city selectors. Selecting the Philippines now loads its 99 available
  administrative areas and then the chosen area's cities. Countries without a
  subdivision/city list retain a manual field, and a manual fallback remains
  available if location options cannot load.
- Added server-side semantic validation and normalization of country,
  state/province, and city values before address create/update mutations, plus
  in-form and README attribution required by the ODbL data license.

### GraphQL and maintenance

- Regenerated the Shopify Storefront API 2026-07 artifact with 25 validated
  operations after adding order line items and address updates.
- Updated `package.json`, `package-lock.json`, `next.config.ts`, README, and this
  change log. The install audit reports zero known vulnerabilities; no new
  environment variables or store migration are required.

## 2026-08-28 — Account dashboard, addresses, and cart identity

### Authentication form fixes

- Converted login, registration, and recovery inputs to controlled Client
  Component state so values and checkbox selections remain intact when field or
  Shopify errors return from a Server Action.
- Added accessible show/hide controls to every login and registration password
  field, including independent controls for password confirmation.

### Customer-aware carts

- Added `cartBuyerIdentityUpdate` and now associates an existing cart with the
  authenticated customer access token after login. New carts also receive the
  buyer identity during `cartCreate`, and authenticated add-to-cart requests
  repair the association before adding a line.
- Logout clears the cart's customer access token before revoking the customer
  token and deleting the local session cookie. Cart synchronization is
  best-effort for stale carts and Shopify outages so account login/logout cannot
  be trapped by an unavailable cart.
- Kept cart IDs and customer access tokens in separate secure, HTTP-only cookies;
  all cart identity and customer operations remain server-only and uncached.

### Orders and saved addresses

- Expanded the account page with lifetime order count, net customer spend after
  refunds, and pending-order count. Complete order history is paginated in
  100-order Storefront API pages, remains uncached, and preserves separate totals
  for different Shopify Markets currencies.
- Added a responsive order-history modal with processed date, payment and
  fulfillment status, total, and Shopify's authenticated order-status link.
- Added the customer's primary shipping address to account details and a
  responsive address modal that lists all saved addresses, identifies the
  primary address, and contains a validated add-address form with an optional
  “set as primary” choice.
- Added shared Base UI/shadcn-style dialog primitives with focus-managed modal
  behavior, responsive scrolling, reduced-motion handling, and accessible close
  controls.

### Shopify API and documentation

- Added customer account/address/order fragments, a paginated customer-orders
  query, customer-address creation and default-address mutations, cart buyer
  identity mutation, Zod request/response schemas, and explicit Shopify
  `userErrors` handling.
- Regenerated the Storefront API 2026-07 artifact with 24 validated operations.
  No dependency or environment changes are required; the existing customer read
  and write Storefront scopes cover these features.
- Updated the README with cart/customer synchronization, account overview,
  order-history, spend, and address-management behavior.

## 2026-08-28 — Legacy customer accounts and collection cache policy

### Customer authentication

- Replaced the header account link with a responsive click menu. Signed-out
  visitors receive Sign in and Create account options; signed-in sessions receive
  My account and Sign out actions.
- Added theme-native `/account/login`, `/account/register`,
  `/account/forgot-password`, and `/account` routes with responsive layouts,
  accessible errors, pending states, browser autocomplete metadata, and account
  details for authenticated customers.
- Added login fields for email, password, and Remember me, plus password recovery
  and registration links. Remembered sessions persist for seven days; unchecked
  sessions remain browser-session cookies.
- Added registration fields for every Storefront `CustomerCreateInput` value:
  first and last names, email, optional E.164 phone, password and confirmation,
  and email-marketing consent.

### Shopify customer API and security

- Added Storefront API operations for customer creation, access-token creation,
  recovery, authenticated profile retrieval, and access-token deletion. Added
  explicit Shopify customer user-error handling and regenerated the Shopify
  2026-07 manifest with 20 validated operations.
- Added strict Zod validation for all form inputs, Storefront customer responses,
  customer IDs, access tokens, expiration timestamps, user errors, and optional
  buyer IP addresses.
- Added a secure, HTTP-only, same-site, high-priority customer-token cookie. The
  token remains server-only and customer requests, credentials, session data,
  and mutations are always uncached and never logged.
- Forwarded a validated buyer IP to private-token customer requests when one is
  supplied by the deployment platform. Sign-out revokes the Shopify token when
  possible and always clears the local session, including during Shopify outages.
- Password recovery uses a generic success response to prevent customer-account
  enumeration.

### Collection caching and setup documentation

- Confirmed collection browsing uses Next.js's persistent fetch cache with
  query-variable-specific POST cache keys and 60-second revalidation, while the
  homepage collection list remains cached for five minutes.
- Expanded collection cache tags with a shared `shopify-collections` tag and
  handle-specific tags, including `shopify-collection:all`, so future webhook or
  admin-driven revalidation can invalidate either one collection or the catalog.
- Documented legacy customer-account mode, required customer read/write
  Storefront permissions, session behavior, account fields, and cache policy in
  the README and `.env.example`. No new environment variables or dependencies
  are required; stores using new customer accounts must use Shopify's passwordless
  Customer Account API flow instead.

## 2026-08-28 — Collection sorting and price-filter fixes

- Replaced the collection sorting form button with an accessible Client
  Component that updates the URL and product order immediately when the selected
  sort option changes, while retaining all active Shopify filters.
- Replaced the incorrectly rendered price checkbox with a dual-thumb price-range
  slider. The control uses Shopify's `PRICE_RANGE` bounds, supports cent-level
  values, formats both amounts in the shop's primary currency, submits a single
  valid Shopify price filter, and can reset to the complete range. A lightweight
  unfiltered facet connection preserves the catalog's full bounds after a price
  filter is applied.
- Added the Storefront API payment currency to collection and all-products
  queries and response validation, then regenerated and revalidated all 15
  Shopify 2026-07 GraphQL operations.
- Added one retry for transient network failures on cacheable Shopify reads.
  Cart queries and mutations remain uncached and single-attempt so mutations can
  never be duplicated. Persistent route failures now render a safe retry screen
  instead of exposing a raw server stack trace.
- Updated collection filter parsing to expose a validated selected price range
  to the UI and updated the README capability summary. No dependency,
  environment, or migration changes are required.

## 2026-08-28 — Shopify collection discovery and filtering

### Homepage collections

- Added the six most recently updated Shopify collections to the homepage, with
  reusable collection cards that show the collection title, description, and
  featured image.
- Added a local responsive SVG fallback for collections without featured images,
  so missing Shopify media never leaves an empty card or collection hero.

### Collection browsing

- Added dynamic `/collections/[handle]` pages and rebuilt `/collections/all`
  around a shared, mobile-first collection browser with responsive product grids,
  collection imagery, empty states, and mobile/desktop filter controls.
- Added Shopify-native Search & Discovery filters with Shopify-provided labels,
  result counts, and filter inputs. Selected filters and sorting are stored in
  validated URL parameters, making browse states server-rendered, refresh-safe,
  shareable, and resilient to invalid or duplicate filter parameters.
- Added featured, best-selling, newest, price, and alphabetical sort options using
  Shopify's collection sort keys. `/collections/all` now uses Shopify's built-in
  `all` collection because the Storefront API exposes native product filtering on
  collection product connections rather than the root products query.
- Added strict Zod validation for collection handles, collection responses,
  images, Shopify filter metadata, filter JSON, filter counts, sort values, and
  user-controlled URL parameters. Public collection reads use explicit
  60-second revalidation and collection-specific cache tags.

### GraphQL and documentation

- Added collection-card and product-filter fragments, a collection query, and
  filter/sort variables to the all-products query. Expanded the homepage query
  with recent collections and regenerated the Shopify 2026-07 manifest after
  validating 15 operations against Shopify's official schema.
- Updated the README with collection discovery/filtering capabilities and
  corrected the cart drawer direction to match the current right-side UI.
- No dependency, environment, or migration changes are required. To expose
  filter choices, merchants configure them in Shopify Search & Discovery.

## 2026-08-28 — Cart drawer item redesign

- Redesigned each drawer cart item to match the supplied reference: a rounded
  square product image on the left, stacked title, variant, and price details in
  the middle, and a pill quantity selector with a standalone delete action on
  the right.
- Increased quantity-control touch targets and added responsive image, text, and
  spacing adjustments so the single-row composition remains usable across
  mobile and desktop drawer widths.
- No environment, API, dependency, or migration changes are required.

## 2026-08-28 — Cart drawer layout adjustments

- Moved the cart drawer from the left edge to the right edge while preserving its
  full-height responsive width, fixed header/footer, and scrollable body.
- Reorganized compact cart-line actions so the line price sits on the left and
  the quantity controls and delete button form a tight group on the right,
  removing the excessive horizontal gap between the controls.
- No environment, API, dependency, or migration changes are required.

## 2026-08-28 — Shopify cart, drawer, and cart page

### Cart API and session security

- Added Shopify Storefront Cart API operations for cart retrieval and creation,
  line addition, quantity updates, line removal, note updates, and discount-code
  updates, with up to 250 cart lines and shared fields for merchandise, images,
  pricing, allocations, applicable codes, checkout URL, note, and total quantity.
- Added strict Zod validation for cart IDs, inputs, cart lines, costs, mutation
  payloads, user errors, warnings, and all external Shopify responses.
- Added reusable cart services that explicitly surface Shopify mutation
  `userErrors`, preserve non-fatal warnings, and keep every cart operation
  uncached. Updated the shared Shopify client so `revalidate: false` uses
  `no-store` rather than the public read cache.
- Added a 30-day, secure, same-site, HTTP-only cart cookie. The complete Shopify
  cart ID and its secret key remain server-only; Client Components receive a
  sanitized cart snapshot without the cart ID.
- Added validated Server Actions for product addition, quantity changes,
  removal, notes, discount application/removal, stale-cart detection, and safe
  public error responses.

### Cart experience

- Connected the product variant Add to cart button to Shopify and made a
  successful addition open a left-side cart drawer.
- Replaced the header cart link outside `/cart` with an accessible drawer
  trigger and live quantity badge. On `/cart`, the action remains a normal cart
  link and never opens the drawer.
- Added a full-height responsive cart drawer with fixed header and footer,
  scrollable line-item body, variant images, quantity and removal controls,
  empty-cart messaging, and a `/collections/all` CTA.
- Added dynamic subtotal presentation using Shopify discount allocations. When
  the effective subtotal is lower, the original subtotal is struck through;
  View cart, Shopify checkout, and tax/shipping messaging remain in the footer.
- Added a responsive `/cart` page with a semantic mobile/desktop item table,
  quantity and removal controls, live subtotal, order-note editing, discount
  application/removal, applied-code state, checkout, shared errors, and the same
  empty-cart message and CTA as the drawer.
- Added a working, request-rendered `/collections/all` product grid backed by a
  five-minute cached Shopify all-products query so empty-cart CTAs never lead to
  a missing route and store environment changes do not require a rebuild.

### Generated artifacts and documentation

- Regenerated the Shopify 2026-07 GraphQL manifest after validating 14 total
  operations against Shopify's official schema, and expanded money formatting
  to support calculated numeric totals as well as API decimal strings.
- Updated the README cart capability and security summary. No new environment
  values or migration steps are required.

## 2026-08-28 — Embla carousel migration

- Replaced the product gallery's custom native scroll and pointer handlers with
  Embla Carousel React, providing reliable mouse dragging, touch swiping, snap
  selection, thumbnail navigation, variant-image navigation, and synchronized
  arrow and image-counter state without changing the gallery styling.
- Migrated the related-products slider to Embla while retaining the existing
  mobile, tablet, and desktop card widths, arrow controls, visual styling, and
  static four-column desktop layout when four or fewer products are returned.
- Kept programmatic carousel navigation immediate for visitors who prefer
  reduced motion and added carousel/slide accessibility descriptions.
- Added `embla-carousel-react` 8.6.0 to root dependencies and updated the npm
  lockfile; installation reports zero known vulnerabilities.
- Updated the README feature and dependency references. This supersedes the
  earlier native-gallery implementation; no environment or migration changes
  are required.

## 2026-08-28 — Product gallery interaction fixes

- Replaced the product page's hard-coded “Back to search” link with browser
  history navigation, while retaining the homepage as a safe direct-entry
  fallback and preserving normal modified-link behavior.
- Fixed previous/next gallery controls shifting vertically when pressed by
  separating their centered positioning from the shared button press transform.
- Added desktop mouse dragging to the existing native scroll-snap image gallery;
  touch swiping, keyboard-accessible controls, reduced-motion behavior, and the
  current visual styling remain unchanged, so no carousel dependency was needed.
- Smoothed active thumbnail changes with coordinated border, opacity, scale, and
  shadow transitions, with transitions disabled when reduced motion is preferred.
- No environment changes or migrations are required.

## 2026-08-28 — Full product detail experience

### Product gallery and variants

- Rebuilt `/products/[handle]` as a responsive product-detail page with a
  swipeable, scroll-snap gallery containing every Shopify product and
  variant-specific image.
- Added previous/next gallery controls, an active-image counter, and a horizontally
  scrollable thumbnail strip that updates the main image.
- Added accessible option groups for every non-default Shopify product option;
  impossible option combinations are disabled based on the fetched variant set.
- Made variant selection update the active Shopify variant image, current price,
  compare-at price, and stock state immediately in the browser.
- Added vendor and plain-text product description content plus a deliberately
  disabled add-to-cart control and explicit note that cart behavior is not wired
  yet.

### Related product carousel

- Added Shopify's `productRecommendations` query with `RELATED` intent and
  preserved Shopify recommendation tracking parameters on product links.
- Added a responsive related-products carousel using native scroll snapping and
  reduced-motion-aware controls. Tablet and mobile always use the slider;
  desktop uses a four-column grid for up to four items and switches to a slider
  above four.
- Made recommendation failures non-blocking so the core product page still
  renders when Shopify has no recommendations or the secondary request fails.

### Shopify data and artifacts

- Expanded the product query to fetch Shopify's maximum page of 250 images and
  250 variants, selected
  options, variant images, price and compare-at price, option values, and vendor.
- Added Zod validation and inferred TypeScript types for product images, variants,
  options, recommendations, and the expanded product response.
- Regenerated the Shopify 2026-07 operation manifest; six Storefront operations
  now validate against Shopify's official schema.
- Updated the README product-page summary. No environment or migration changes
  are required.

## 2026-08-27 — Shopify predictive product search

### Header search experience

- Added a search action before the account icon in desktop and mobile headers.
- Added an accessible top-sheet search interface with automatic focus, a 300 ms
  debounce, aborted stale requests, a six-product predictive result limit, and
  reduced-motion-aware loading placeholders.
- Added product thumbnails, availability, prices, explicit API-error messaging,
  and a helpful no-products state to the predictive result list.
- Added a final “View all results” action that carries the current term to the
  full `/search` results page.
- Tightened extra-small-screen header sizing so the new search, account, and cart
  actions do not collide with the centered mobile brand.

### Shopify search and product routes

- Added a Zod-validated `/api/search/predictive` Route Handler that delegates to
  reusable Shopify services and returns safe public error messages without
  exposing credentials or upstream responses.
- Added Shopify Storefront API predictive search, full product search, and
  product-by-handle queries using the 2026-07 schema, with explicit 60-second
  search caching and 300-second product caching.
- Added a complete `/search` page with query validation, result counts, product
  cards, empty states, and an upstream-failure state.
- Added `/products/[handle]` detail pages so predictive and full-search product
  links resolve inside the headless theme rather than leading to missing routes.
- Moved the reusable product card into the commerce component layer and linked
  homepage product cards to their product routes.

### GraphQL organization and maintenance

- Reorganized Shopify fragments, queries, Zod schemas, services, and utilities
  into the repository's required `graphql`, `schemas`, `services`, and `utils`
  directory structure.
- Added a project-owned `graphql:codegen` workflow using GraphQL 17 that fetches
  Shopify's official 2026-07 schema, validates every named operation, and writes
  a deterministic generated operation manifest under `graphql/generated`.
- Generated and recorded five validated Storefront operations: home, identity,
  predictive product search, full product search, and product-by-handle.
- Evaluated Shopify's current codegen preset but removed it after its transitive
  dependency tree introduced unpatched high-severity lodash advisories; the
  minimal GraphQL validator retains zero known npm vulnerabilities.
- Updated the README with search behavior, the current Shopify module layout,
  and the GraphQL artifact regeneration command. No new environment variables or
  store migration steps are required.

## 2026-08-27 — Embedded Sanity Studio route

- Added an optional embedded Sanity Studio at `/studio` so the editor is
  available through the main Next.js development server instead of returning a
  404.
- Added a validated setup screen at `/studio` when the root Sanity public
  environment values are missing or invalid, keeping unconfigured theme builds
  usable.
- Extracted a shared Studio config factory so the embedded and standalone
  editors use the same schema, singleton structure, document actions, and Vision
  tooling without duplicating content-model configuration.
- Isolated the embedded editor behind a browser-only dynamic boundary so Sanity's
  client bundle is not evaluated through Next 16's React Server Component export
  conditions during production builds.
- Moved storefront-only pages into an App Router route group and moved the global
  header into that group's layout, preventing storefront chrome and data fetching
  from appearing inside Sanity Studio.
- Kept the standalone Studio on port 3333 as the faster schema-development
  workflow and documented both editor entry points in the root and Studio
  READMEs.

## 2026-08-27 — Sanity header and Node 24 refresh

### Responsive global header

- Added a sticky, mobile-first site header with a desktop brand/navigation/actions
  layout and a mobile hamburger/centered-brand/account-cart layout.
- Added editable navigation dropdowns with one level of child links on desktop
  and collapsible child groups in the mobile menu.
- Added account and cart icon links with accessible labels and touch-friendly
  targets on the right side of the header.
- Added the shadcn/ui Sheet primitive and configured it as an accessible left-side
  mobile drawer with full-width slide animation and reduced-motion handling.
- Added a shared header-height token, loading fallback, Sanity logo image support,
  and page scroll offset for the default products link.
- Removed the page-specific setup header so the global header is consistent
  across connected, setup, loading, and Shopify-error states.

### Sanity integration

- Added a standalone `studio/` npm workspace using Sanity Studio 6, Structure
  Tool, Vision, React 19, strict TypeScript, and Node 24.
- Added a `siteSettings` singleton with editable site-name fallback, hotspot logo,
  required logo alt text, primary navigation, conditional internal/external
  destinations, and validated child links.
- Added singleton-only Studio structure and document actions to prevent duplicate
  site-settings documents.
- Switched Studio icons to Sanity Icons 5's runtime-safe subpath exports after
  the Studio bundle check exposed stale compatibility names in the root typings.
- Added a projected `defineQuery` GROQ header query that includes stable `_key`
  values and resolves only the required logo and navigation fields.
- Added `src/lib/sanity` as the server-only Sanity request boundary with dated API
  configuration, published perspective, optional private-dataset token, 60-second
  caching, cache tags, error handling, and Zod response validation.
- Added a lightweight cached Shopify identity query so the live Shopify store name
  is used when Sanity has no site name or logo.
- Added `cdn.sanity.io` to the narrowly scoped Next.js image allowlist.
- Added root and Studio Sanity env templates plus setup instructions; the actual
  Sanity project remains an explicit user-supplied environment value.

### Dependency and environment maintenance

- Updated the project runtime declaration and `.nvmrc` from Node 20.19 to Node
  24.11.1, pinned npm 11.6.2 metadata, and updated Node types to the 24.x line.
- Audited all root and Studio packages against the npm registry. Next.js, React,
  Tailwind CSS, shadcn/ui, Motion, Zod, and existing runtime packages were already
  current.
- Updated TypeScript from 5.9 to 6.0.3, the newest release supported by the
  current `typescript-eslint` chain. Retained ESLint 9.39.5 because Next's current
  React, import, and accessibility plugins do not yet accept ESLint 10.
- Added current compatible releases of `next-sanity`, Sanity Studio, Vision,
  Sanity icons, and styled-components in a single npm workspace lockfile.
- Added targeted patched overrides for Sanity CLI's stale transitive `js-yaml`,
  `smol-toml`, and `uuid` pins; the resulting npm audit reports zero known
  vulnerabilities.
- Moved the populated Shopify environment values out of the committable
  `.env.example` and into ignored `.env.local`, then restored safe placeholders.
- Added root scripts for Studio development, type-checking, building, and deploy.
- Excluded generated Sanity Studio build artifacts from ESLint so verification
  remains focused on authored source and configuration files.
- Added standalone Studio and Sanity integration instructions to both README files.

## 2026-08-27 — Initial project foundation

### Project foundation

- Initialized a Next.js 16 App Router project with React 19, TypeScript, ESLint,
  Tailwind CSS 4, a `src/` directory, and the `@/*` import alias.
- Declared Node.js 20.19+ in `package.json` and `.nvmrc` to satisfy the installed
  Next.js tooling and shadcn/ui CLI dependency requirements.
- Added a `typecheck` npm script alongside the generated development, lint,
  build, and start commands.
- Added a project description to package metadata.

### UI and motion

- Initialized shadcn/ui with its current Base Nova preset and CSS-variable theme.
- Added shadcn/ui Button, Card, Badge, and Skeleton component source files.
- Installed and integrated Motion through a small, reduced-motion-aware client
  reveal component for page and product entrance animation.
- Replaced the default Next.js page with theme-ready setup, connected-store,
  API-error, empty-catalog, and loading states.
- Added a responsive live product preview with Shopify CDN image optimization,
  availability labels, and localized price formatting.
- Updated site metadata, font token wiring, global antialiasing, and base visual
  styling.

### Shopify integration

- Added `.env.example` with store domain, private-token, public-token, and API
  version placeholders, while keeping real environment files ignored.
- Added Zod-validated server-only environment loading that normalizes Shopify
  domains and supports private, public, or tokenless Storefront API requests.
- Added a reusable Storefront GraphQL client with authentication headers,
  buyer-IP support, HTTP and GraphQL error handling, five-minute caching, cache
  tags, and runtime Zod response validation.
- Added a Storefront API 2026-07 home query, response schemas, inferred TypeScript
  types, and a high-level `getStorefrontHome` data function.
- Configured Next.js Image to accept HTTPS assets from `cdn.shopify.com`.
- Made the homepage request-time rendered so store environment values can be
  changed without rebuilding the application artifact.

### Documentation and maintenance

- Corrected the repository verification commands for the root-level project and
  used a neutral private-token placeholder in the onboarding example.
- Adjusted the homepage request error boundary flow so JSX is rendered outside
  the data-fetch `try` block, satisfying React 19's error-boundary lint rule.
- Rewrote the README with prerequisites, local setup, Shopify connection steps,
  environment-variable guidance, architecture, commands, extension notes, and
  official reference links.
- Added this change log and a persistent `AGENTS.md` rule requiring future major
  and minor changes to be recorded here.
- Installed Zod, Motion, server-only, and shadcn/ui's generated runtime
  dependencies; the resulting npm lockfile records exact resolved versions.
