import { defineConfig, devices } from "@playwright/test";

import { e2eEnvironment } from "./tests/e2e/environment";

const baseUrl = new URL(e2eEnvironment.baseUrl);
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const baseHostname = baseUrl.hostname.replace(/^\[|\]$/g, "");
const isLocal = localHosts.has(baseHostname);
const port = baseUrl.port || (baseUrl.protocol === "https:" ? "443" : "80");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: e2eEnvironment.baseUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: isLocal
    ? {
        command: `npm run dev -- --hostname ${baseHostname} --port ${port}`,
        url: e2eEnvironment.baseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: "desktop-chromium",
      testIgnore: "**/mobile.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      testMatch: "**/mobile.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
