import assert from "node:assert/strict";
import test from "node:test";

test("unexpected external requests fail immediately", async () => {
  await assert.rejects(
    fetch("https://example.com/should-never-be-requested"),
    (error) =>
      error instanceof Error &&
      error.message ===
        "Unexpected network request during tests: https://example.com/should-never-be-requested",
  );
});
