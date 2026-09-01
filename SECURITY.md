# Security policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Send the repository
owner a private GitHub security advisory with the affected route or component,
reproduction steps, impact, and any suggested mitigation. Do not include real
customer data, access tokens, cookies, or other secrets in the report.

## Supported version

Security fixes are applied to the current `main` branch. Deployments should stay
on the current lockfile and rerun the verification commands after every update.

## Production checklist

- Terminate TLS at a trusted edge and redirect HTTP to HTTPS before enabling
  production traffic. Confirm HSTS is appropriate for every subdomain.
- Configure Upstash Redis and a unique `RATE_LIMIT_KEY_SALT`; do not rely on the
  in-memory fallback across multiple processes or serverless instances.
- Configure `TRUSTED_PROXY_IP_HEADER` only for a header the edge removes and
  rewrites. Never trust an arbitrary client-supplied forwarding header.
- Leave `SERVER_ACTION_ALLOWED_ORIGINS` empty unless a trusted reverse proxy
  requires an explicit additional hostname.
- Keep all private tokens out of `NEXT_PUBLIC_*`, source control, build logs,
  browser bundles, analytics, and error-report payloads. Rotate any secret that
  may have been exposed.
- Grant Shopify, Sanity, Klaviyo, and Redis credentials only the permissions the
  storefront needs. Use separate credentials for development and production.
- Restrict Sanity project CORS origins and Studio access to the intended domains
  and team members.
- Enable provider and platform logs, alert on repeated 429/401/403 responses,
  and review authentication, newsletter, and checkout anomalies.
- Add edge WAF or bot challenges for distributed credential stuffing; per-IP
  and per-account application limits are one layer, not a complete bot system.
- Run `npm audit`, `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run studio:typecheck`, and `npm run build` before release.
- Test security headers and the Content Security Policy against the production
  domain whenever a new script, image host, analytics provider, or embedded
  service is introduced.

## Data and session boundaries

Cart IDs and customer access tokens are held in secure HTTP-only cookies and are
never intentionally exposed to browser JavaScript. Cart and customer requests,
authentication, mutations, and newsletter submissions are uncached. Public
catalog and editorial data may be cached with explicit revalidation.

Shopify owns commerce and customer authorization, Sanity owns editorial
content, and Klaviyo owns newsletter delivery. A compromise or policy change in
one of those services remains outside the protections this application can
enforce, so provider-side access reviews, MFA, audit logs, and backups are still
required.
