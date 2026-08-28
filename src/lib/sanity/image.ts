import "server-only";

import createImageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";

import { requireSanityConfig } from "./env";

export function buildSanityImageUrl(source: SanityImageSource) {
  const { dataset, projectId } = requireSanityConfig();
  return createImageUrlBuilder({ dataset, projectId }).image(source);
}
