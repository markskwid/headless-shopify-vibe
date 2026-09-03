import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

let importSequence = 0;
let parseResult;
let sanityWebhook;

function requestFor(body, dataset = "test_dataset") {
  return new Request("https://storefront.example/api/webhooks/sanity", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "sanity-dataset": dataset,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "abc123";
  process.env.NEXT_PUBLIC_SANITY_DATASET = "test_dataset";
  process.env.SANITY_API_VERSION = "2026-09-03";
  parseResult = {
    body: { _id: "siteSettings", _type: "siteSettings" },
    isValidSignature: true,
  };

  mock.module("next-sanity/webhook", {
    namedExports: {
      parseBody: async () => parseResult,
    },
  });

  importSequence += 1;
  sanityWebhook = await import(
    `../src/lib/sanity/services/webhook.ts?sanity-webhook-test=${importSequence}`
  );
});

test("parseSanityWebhook accepts content when signature parsing reports valid", async () => {
  assert.deepEqual(
    await sanityWebhook.parseSanityWebhook(
      requestFor(parseResult.body),
      "test-secret-with-at-least-32-characters",
    ),
    { documentId: "siteSettings", documentType: "siteSettings" },
  );
});

test("parseSanityWebhook rejects invalid signatures and datasets", async () => {
  parseResult = { body: { _id: "homePage" }, isValidSignature: false };
  await assert.rejects(
    sanityWebhook.parseSanityWebhook(
      requestFor(parseResult.body),
      "test-secret-with-at-least-32-characters",
    ),
    (error) =>
      error instanceof sanityWebhook.SanityWebhookError && error.status === 401,
  );

  parseResult = { body: { _id: "homePage" }, isValidSignature: true };
  await assert.rejects(
    sanityWebhook.parseSanityWebhook(
      requestFor(parseResult.body, "wrong_dataset"),
      "test-secret-with-at-least-32-characters",
    ),
    (error) =>
      error instanceof sanityWebhook.SanityWebhookError && error.status === 401,
  );
});

test("parseSanityWebhook rejects malformed projected payloads", async () => {
  parseResult = {
    body: { _id: "x".repeat(513), _type: "editorialPage" },
    isValidSignature: true,
  };

  await assert.rejects(
    sanityWebhook.parseSanityWebhook(
      requestFor(parseResult.body),
      "test-secret-with-at-least-32-characters",
    ),
    (error) =>
      error instanceof sanityWebhook.SanityWebhookError && error.status === 400,
  );
});
