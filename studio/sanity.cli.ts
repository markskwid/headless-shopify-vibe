import { defineCliConfig } from "sanity/cli";

function requireStudioEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy studio/.env.example to studio/.env.local and add your Sanity project values.`,
    );
  }

  return value;
}

export default defineCliConfig({
  api: {
    projectId: requireStudioEnv("SANITY_STUDIO_PROJECT_ID"),
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
});
