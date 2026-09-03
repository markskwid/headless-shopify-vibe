import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

import {
  encodeSignatureHeader,
  SIGNATURE_HEADER_NAME,
} from "@sanity/webhook";

import {
  parseSanityWebhook,
  SanityWebhookError,
} from "../src/lib/sanity/services/webhook.ts";

const TEST_SECRET = "synthetic-sanity-webhook-secret-32-chars";
const OTHER_SECRET = "different-synthetic-webhook-secret-32";
const SIGNATURE_TIMESTAMP = 1_700_000_000_000;
const payload = JSON.stringify({
  _id: "siteSettings",
  _type: "siteSettings",
});

function setSanityTestEnvironment() {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "abc123";
  process.env.NEXT_PUBLIC_SANITY_DATASET = "test_dataset";
  process.env.SANITY_API_VERSION = "2026-09-03";
}

function requestFor(body, signature) {
  const headers = new Headers({
    "content-type": "application/json",
    "sanity-dataset": "test_dataset",
  });
  if (signature) headers.set(SIGNATURE_HEADER_NAME, signature);

  return new Request("https://storefront.example/api/webhooks/sanity", {
    method: "POST",
    headers,
    body,
  });
}

async function signatureFor(body, secret = TEST_SECRET) {
  return encodeSignatureHeader(body, SIGNATURE_TIMESTAMP, secret);
}

function isUnauthorizedSanityWebhookError(error) {
  return error instanceof SanityWebhookError && error.status === 401;
}

beforeEach(() => {
  setSanityTestEnvironment();
});

test("real Sanity parseBody accepts a correctly signed request", async () => {
  const signature = await signatureFor(payload);

  assert.deepEqual(
    await parseSanityWebhook(requestFor(payload, signature), TEST_SECRET),
    { documentId: "siteSettings", documentType: "siteSettings" },
  );
});

test("real Sanity parseBody rejects a payload modified after signing", async () => {
  const signature = await signatureFor(payload);
  const modifiedPayload = JSON.stringify({
    _id: "homePage",
    _type: "homePage",
  });

  await assert.rejects(
    parseSanityWebhook(
      requestFor(modifiedPayload, signature),
      TEST_SECRET,
    ),
    isUnauthorizedSanityWebhookError,
  );
});

test("real Sanity parseBody rejects a request without a signature", async () => {
  const consoleError = mock.method(console, "error", () => {});

  await assert.rejects(
    parseSanityWebhook(requestFor(payload), TEST_SECRET),
    isUnauthorizedSanityWebhookError,
  );
  assert.equal(consoleError.mock.callCount(), 1);
});

test("real Sanity parseBody rejects a request signed with another secret", async () => {
  const signature = await signatureFor(payload, OTHER_SECRET);

  await assert.rejects(
    parseSanityWebhook(requestFor(payload, signature), TEST_SECRET),
    isUnauthorizedSanityWebhookError,
  );
});
