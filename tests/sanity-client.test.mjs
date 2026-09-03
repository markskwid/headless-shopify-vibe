import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

import { z } from "zod";

let clientConfig;
let clientFetch;
let sanityClient;
let importSequence = 0;

beforeEach(async () => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "abc123";
  process.env.NEXT_PUBLIC_SANITY_DATASET = "test_dataset";
  process.env.SANITY_API_VERSION = "2026-09-03";
  process.env.SANITY_API_READ_TOKEN = "test-read-token";
  clientFetch = mock.fn();

  mock.module("next-sanity", {
    namedExports: {
      createClient(config) {
        clientConfig = config;
        return { fetch: clientFetch };
      },
    },
  });

  importSequence += 1;
  sanityClient = await import(
    `../src/lib/sanity/client.ts?sanity-client-test=${importSequence}`
  );
});

test("sanityFetch validates responses and applies cache configuration", async () => {
  clientFetch.mock.mockImplementation(async () => ({ title: "About" }));
  const schema = z.object({ title: z.string() });

  const result = await sanityClient.sanityFetch({
    query: '*[_type == "editorialPage"][0]{title}',
    params: { slug: "about" },
    schema,
    revalidate: 300,
    tags: ["sanity-editorial-pages"],
  });

  assert.deepEqual(result, { title: "About" });
  assert.deepEqual(clientConfig, {
    projectId: "abc123",
    dataset: "test_dataset",
    apiVersion: "2026-09-03",
    token: "test-read-token",
    perspective: "published",
    useCdn: true,
    stega: false,
    timeout: 10_000,
    maxRetries: 2,
  });
  assert.deepEqual(clientFetch.mock.calls[0].arguments, [
    '*[_type == "editorialPage"][0]{title}',
    { slug: "about" },
    {
      next: {
        revalidate: 300,
        tags: ["sanity", "sanity-editorial-pages"],
      },
    },
  ]);
});

test("sanityFetch rejects schema-invalid responses", async () => {
  clientFetch.mock.mockImplementation(async () => ({ title: 123 }));

  await assert.rejects(
    sanityClient.sanityFetch({
      query: "*[]",
      schema: z.object({ title: z.string() }),
    }),
    (error) =>
      error instanceof sanityClient.SanityRequestError &&
      error.message.startsWith("Sanity data validation failed:"),
  );
});

test("sanityFetch wraps provider request failures", async () => {
  clientFetch.mock.mockImplementation(async () => {
    throw new TypeError("connection refused");
  });

  await assert.rejects(
    sanityClient.sanityFetch({ query: "*[]", schema: z.array(z.unknown()) }),
    (error) =>
      error instanceof sanityClient.SanityRequestError &&
      error.message === "Sanity request failed: connection refused",
  );
});
