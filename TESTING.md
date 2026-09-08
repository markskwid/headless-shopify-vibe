# Testing Guide

## Test structure

- Unit and integration tests are stored under `tests/`.
- Test files use the `.test.mjs` naming convention.
- End-to-end tests are stored under `tests/e2e/`.
- Use the Node test runner for unit and integration tests.
- Use `tsx` only as the TypeScript execution loader for application modules;
  Node remains the test runner.
- Use Playwright for end-to-end tests.

## Testing principles

- Test public and observable behavior.
- Include successful, invalid-input, and external-service failure cases.
- Avoid tests that depend heavily on internal implementation details.
- Mock all external network requests in unit and integration tests.
- The shared test setup rejects every unexpected `fetch` call immediately.
  Install a per-test mock before exercising code that intentionally makes a
  provider request.
- Restore mocks and modified environment variables after every test. The
  shared setup provides this cleanup automatically for Node mock-tracker mocks
  and `process.env` changes.
- Never use production Shopify, Sanity, Klaviyo, or customer credentials.
- End-to-end tests must use designated development or staging services.

## Priority areas

1. Cart and secure cart-cookie behavior
2. Checkout redirects
3. Shopify GraphQL errors and response validation
4. Customer authentication and sessions
5. Search, filtering, and pagination
6. Sanity response validation and fallbacks
7. Webhook verification
8. Environment configuration and rate limiting

## Commands

Run the complete test suite:

```bash
npm run test
```

The test command loads TypeScript through `tsx`, enables Node's built-in ESM
module mocking, applies the React Server export condition for server-only
modules, and lets Node discover every `*.test.mjs` file. No real provider
credentials or network services are required.

## Playwright end-to-end tests

Browser tests live under `tests/e2e/`, use the `.spec.ts` naming convention,
and run in desktop Chromium or a mobile Chromium device profile. The suite is
limited to two workers so concurrent development-store traffic does not
overwhelm the local Next.js server or Shopify API. Install the single required
browser engine after installing dependencies:

```bash
npx playwright install chromium
```

Copy the E2E placeholders from `.env.example` into the ignored
`.env.e2e.local` file. Use only a designated development or staging Shopify
store and Sanity project/dataset. The configured collection must expose the
available test product on its first page, the search term must return that
product, and the unavailable handle must identify a sold-out product. Mobile
navigation must expose Shopify's built-in `/collections/all` destination, whose
first page must contain at least one available product. The editorial slug and
heading must identify published test content.

The E2E configuration fails before browser startup when required data is
missing, the base URL matches the declared production hostname, an external
URL does not use HTTPS, or the explicit Shopify/Sanity approval values do not
match the app configuration. Checkout tests intercept the approved HTTPS
checkout URL before it reaches Shopify and never enter checkout or place an
order. Tests never publish or mutate Sanity content or modify customer data.

Run the browser suite headlessly:

```bash
npm run test:e2e
```

Open Playwright's interactive UI:

```bash
npm run test:e2e:ui
```

Playwright reports, results, traces, videos, screenshots, and any future saved
authentication state are ignored by Git. Authentication coverage remains
deferred until both optional customer variables identify an approved
development-store account.

The basic GitHub Actions workflow runs unit and integration tests, lint,
typecheck, and a production build on both Ubuntu and Windows with Node
24.11.1. It runs for pushes and pull requests targeting `main`, `staging`, or
`clean/shopify-sanity-core`, uses only read access to repository contents, and
does not load provider credentials.

Playwright is intentionally excluded from CI until a protected staging
environment and its secrets are configured. Future E2E jobs must not expose
secrets to pull requests from forks and should install only Chromium with
`npx playwright install --with-deps chromium`.
