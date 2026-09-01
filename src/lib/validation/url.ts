import { z } from "zod";

export const httpsUrlSchema = z.url().refine(
  (value) => new URL(value).protocol === "https:",
  "Use a secure HTTPS URL.",
);

export const safeLinkDestinationSchema = z.string().trim().min(1).refine(
  (value) => {
    if (value.startsWith("#")) return !/[\u0000-\u001F\u007F]/.test(value);
    if (value.startsWith("/") && !value.startsWith("//")) {
      return !/[\u0000-\u001F\u007F]/.test(value);
    }

    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  },
  "Use an internal path, anchor, or secure HTTPS URL.",
);
