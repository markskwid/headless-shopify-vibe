# Headless Shopify Store

## Architecture

- Shopify is the source of truth for commerce data.
- Sanity is the source of truth for editorial content.
- Use the Next.js App Router with strict TypeScript.
- Prefer React Server Components.
- Add Client Components only when genuine browser-side interaction is required.
- Keep components in their designated folders according to their responsibility.
- Do not place data-fetching logic, GraphQL operations, or business logic directly inside presentational components.
- Store the cart ID and customer access token in secure HTTP-only cookies.
- Use Shopify's `checkoutUrl` for checkout.
- Validate all external inputs and API responses at their boundaries using Zod.
- Cache public, read-heavy data with explicit revalidation rules.
- Do not cache carts, customer sessions, authentication data, mutations, or other user-specific and frequently changing data.

## Shopify organization

- All Shopify API requests must go through `src/lib/shopify`.
- Do not make direct Shopify API calls from components, pages, layouts, Server Actions, or Route Handlers.
- Server Actions and Route Handlers must call reusable Shopify service functions.
- Keep the Shopify GraphQL client and request configuration in `src/lib/shopify/client.ts`.
- Keep all GraphQL operations under `src/lib/shopify/graphql`.
- Do not define inline GraphQL operations inside components, pages, Server Actions, or Route Handlers.
- Store GraphQL artifacts according to their operation type:
  - Fragments: `src/lib/shopify/graphql/fragments`
  - Queries: `src/lib/shopify/graphql/queries`
  - Mutations: `src/lib/shopify/graphql/mutations`
  - Generated types and artifacts: `src/lib/shopify/graphql/generated`
- Keep reusable Shopify business and data-access functions in `src/lib/shopify/services`.
- Do not manually edit generated GraphQL files.
- Regenerate GraphQL artifacts after changing queries, mutations, fragments, or the Storefront API version.
- Handle HTTP errors, GraphQL errors, and Shopify `userErrors` explicitly.

The expected Shopify structure is:

```text
src/lib/shopify/
├── client.ts
├── config.ts
├── graphql/
│   ├── fragments/
│   ├── queries/
│   ├── mutations/
│   └── generated/
├── schemas/
├── services/
└── utils/
```

## Sanity organization

- All Sanity requests must go through `src/lib/sanity`.
- Do not define inline GROQ queries inside components, pages, layouts, Server Actions, or Route Handlers.
- Keep the Sanity client configuration in `src/lib/sanity/client.ts`.
- Keep GROQ queries in `src/lib/sanity/queries`.
- Keep reusable Sanity data-access functions in `src/lib/sanity/services`.
- Keep Sanity validation schemas in `src/lib/sanity/schemas`.
- Components must receive prepared data from Sanity service functions rather than querying Sanity directly.

The expected Sanity structure is:

```text
src/lib/sanity/
├── client.ts
├── config.ts
├── queries/
├── schemas/
├── services/
├── image.ts
└── utils/
```

## Security

- Never expose private tokens through `NEXT_PUBLIC_*` environment variables.
- Never log access tokens, customer tokens, cookie values, or complete authenticated API responses.
- Keep private Shopify and Sanity requests server-only.
- Commit an `.env.example` containing placeholders, but never commit `.env.local` or real credentials.

## UI

- Define colors, typography, spacing, breakpoints, and border radii as shared design tokens.
- Use shadcn components as editable UI primitives.
- Use Motion only in small, focused Client Components.
- Support `prefers-reduced-motion`.
- Use a mobile-first responsive implementation.
- Keep presentational, commerce, layout, and editorial components in separate designated folders.

## Verification

After meaningful changes, run:

- `npm run lint`
- `npm run build`
- Relevant automated tests
- GraphQL code generation when GraphQL operations have changed

Do not declare a task complete while the build, linting, code generation, or relevant tests are failing.

## Change documentation

- Record every code, configuration, dependency, and documentation change in `changes.md`.
- Include both major features and minor maintenance changes.
- Record GraphQL schema, query, mutation, fragment, generated-artifact, and API-version changes.
- Each entry should briefly explain what changed, why it changed, and any required migration or environment updates.
