import { z } from "zod";

export const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "Use a valid ISO country code.");

export const stateCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{1,10}$/, "Use a valid state or province code.");

export const locationCountrySchema = z.object({
  code: countryCodeSchema,
  name: z.string().trim().min(1).max(120),
  emoji: z.string().max(16),
});

export const locationStateSchema = z.object({
  code: stateCodeSchema,
  name: z.string().trim().min(1).max(120),
});

export const locationCountriesResponseSchema = z.object({
  countries: z.array(locationCountrySchema),
});

export const locationStatesResponseSchema = z.object({
  states: z.array(locationStateSchema),
});

export const locationQuerySchema = z
  .object({
    level: z.enum(["countries", "states"]),
    country: countryCodeSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.level !== "countries" && !value.country) {
      context.addIssue({
        code: "custom",
        path: ["country"],
        message: "A country code is required.",
      });
    }
  });

export type LocationCountry = z.infer<typeof locationCountrySchema>;
export type LocationState = z.infer<typeof locationStateSchema>;
