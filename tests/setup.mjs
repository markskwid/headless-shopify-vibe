import { afterEach, mock } from "node:test";

const initialEnvironment = { ...process.env };

async function rejectUnexpectedNetworkRequest(input) {
  const destination =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input?.url ?? "unknown destination";

  throw new Error(`Unexpected network request during tests: ${destination}`);
}

Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  writable: true,
  value: rejectUnexpectedNetworkRequest,
});

afterEach(() => {
  mock.restoreAll();

  for (const key of Object.keys(process.env)) {
    if (!(key in initialEnvironment)) delete process.env[key];
  }

  Object.assign(process.env, initialEnvironment);
});
