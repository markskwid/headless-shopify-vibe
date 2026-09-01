import assert from "node:assert/strict";
import test from "node:test";

import {
  httpsUrlSchema,
  safeLinkDestinationSchema,
} from "../src/lib/validation/url.ts";
import { parseBuyerIp } from "../src/lib/shopify/utils/buyer-ip.ts";

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
