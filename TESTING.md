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
8. Environment configuration and feature boundary validation

## Commands

Run the complete test suite:

```bash
npm run test
```

The test command loads TypeScript through `tsx`, enables Node's built-in ESM
module mocking, applies the React Server export condition for server-only
modules, and lets Node discover every `*.test.mjs` file. No real provider
credentials or network services are required.

## Continuous integration

The basic GitHub Actions workflow runs unit and integration tests, lint,
typecheck, and a production build on both Ubuntu and Windows with Node
24.11.1. It runs for pushes and pull requests targeting either distribution
branch, uses read-only repository permissions, and does not load provider
credentials.

This provider-neutral branch does not select a rate-limit vendor or include the
secured distribution's deployment-specific hardening tests. Browser tests are
also not part of this branch's current CI suite.
