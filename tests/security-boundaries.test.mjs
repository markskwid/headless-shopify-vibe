import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  httpsUrlSchema,
  safeLinkDestinationSchema,
} from "../src/lib/validation/url.ts";
import { parseBuyerIp } from "../src/lib/shopify/utils/buyer-ip.ts";
import { verifyShopifyWebhookSignature } from "../src/lib/shopify/utils/webhook.ts";
import {
  readBoundedJsonBody,
  WebhookRequestError,
} from "../src/lib/security/webhook-request.ts";

test("safe editorial links allow local destinations and HTTPS", () => {
  for (const destination of [
    "/",
    "/collections/all?sort=best-selling",
    "#products",
    "https://example.com/path",
  ]) {
    assert.equal(
      safeLinkDestinationSchema.safeParse(destination).success,
      true,
      destination,
    );
  }
});

test("safe editorial links reject executable, insecure, and protocol-relative URLs", () => {
  for (const destination of [
    "//example.com",
    "http://example.com",
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "/safe\u0000unsafe",
  ]) {
    assert.equal(
      safeLinkDestinationSchema.safeParse(destination).success,
      false,
      destination,
    );
  }
});

test("external response URLs require HTTPS", () => {
  assert.equal(httpsUrlSchema.safeParse("https://example.com").success, true);
  assert.equal(httpsUrlSchema.safeParse("http://example.com").success, false);
  assert.equal(httpsUrlSchema.safeParse("javascript:alert(1)").success, false);
});

test("buyer IP parsing accepts only the first valid IPv4 or IPv6 address", () => {
  assert.equal(
    parseBuyerIp("203.0.113.10, 10.0.0.1"),
    "203.0.113.10",
  );
  assert.equal(parseBuyerIp("2001:db8::1"), "2001:db8::1");
  assert.equal(parseBuyerIp("203.0.113.999"), undefined);
  assert.equal(parseBuyerIp("not-an-ip, 203.0.113.10"), undefined);
  assert.equal(parseBuyerIp(undefined), undefined);
});

test("Shopify webhook signatures require an exact raw-body HMAC", () => {
  const secret = "a-secure-test-secret-that-is-at-least-32-characters";
  const body = new TextEncoder().encode('{"id":123,"handle":"test"}');
  const signature = createHmac("sha256", secret).update(body).digest("base64");

  assert.equal(
    verifyShopifyWebhookSignature({ body, secret, signature }),
    true,
  );
  assert.equal(
    verifyShopifyWebhookSignature({
      body: new TextEncoder().encode('{"id":124,"handle":"test"}'),
      secret,
      signature,
    }),
    false,
  );
  assert.equal(
    verifyShopifyWebhookSignature({ body, secret, signature: "invalid" }),
    false,
  );
});

test("webhook bodies require JSON and enforce declared and actual size limits", async () => {
  const valid = new Request("https://example.com/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"ok":true}',
  });
  assert.deepEqual(
    new TextDecoder().decode(await readBoundedJsonBody(valid, 64)),
    '{"ok":true}',
  );

  const oversized = new Request("https://example.com/webhook", {
    method: "POST",
    headers: {
      "content-length": "100",
      "content-type": "application/json",
    },
    body: "{}",
  });
  await assert.rejects(
    readBoundedJsonBody(oversized, 64),
    (error) => error instanceof WebhookRequestError && error.status === 413,
  );

  const wrongType = new Request("https://example.com/webhook", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "{}",
  });
  await assert.rejects(
    readBoundedJsonBody(wrongType, 64),
    (error) => error instanceof WebhookRequestError && error.status === 415,
  );
});
