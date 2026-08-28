import "server-only";

import { createRequire } from "node:module";
import { unstable_cache } from "next/cache";
import { z } from "zod";

import {
  countryCodeSchema,
  locationCountrySchema,
  locationStateSchema,
  type LocationCountry,
  type LocationState,
} from "./schemas";

type CountryStateCityLibrary = typeof import("@countrystatecity/countries");

// The package's ESM fallback currently resolves data relative to the caller on
// Node 24. Its documented CommonJS entry resolves its bundled data correctly.
const requireFromHere = createRequire(import.meta.url);
const locationLibrary = requireFromHere(
  "@countrystatecity/countries",
) as CountryStateCityLibrary;

const sourceCountrySchema = z.object({
  name: z.string(),
  iso2: z.string(),
  emoji: z.string(),
});

const sourceStateSchema = z.object({
  name: z.string(),
  iso2: z.string(),
});

function compareNames(left: { name: string }, right: { name: string }) {
  return left.name.localeCompare(right.name, "en", { sensitivity: "base" });
}

const getCountriesCached = unstable_cache(
  async () => {
    const countries = z
      .array(sourceCountrySchema)
      .parse(await locationLibrary.getCountries());

    return countries
      .map((country) =>
        locationCountrySchema.parse({
          code: country.iso2,
          name: country.name,
          emoji: country.emoji,
        }),
      )
      .sort(compareNames);
  },
  ["locations-countries-v1"],
  { revalidate: 86_400, tags: ["locations"] },
);

const getStatesCached = unstable_cache(
  async (countryCode: string) => {
    const states = z
      .array(sourceStateSchema)
      .parse(await locationLibrary.getStatesOfCountry(countryCode));

    return states
      .map((state) =>
        locationStateSchema.parse({ code: state.iso2, name: state.name }),
      )
      .sort(compareNames);
  },
  ["locations-states-v1"],
  { revalidate: 86_400, tags: ["locations"] },
);

export async function getLocationCountries(): Promise<LocationCountry[]> {
  return getCountriesCached();
}

export async function getLocationStates(
  countryCodeInput: unknown,
): Promise<LocationState[]> {
  return getStatesCached(countryCodeSchema.parse(countryCodeInput));
}

function sameName(left: string, right: string) {
  return left.localeCompare(right, "en", { sensitivity: "base" }) === 0;
}

export class LocationInputError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]>,
  ) {
    super(message);
    this.name = "LocationInputError";
  }
}

export async function normalizeAddressLocation(input: {
  country: string;
  province?: string;
  city: string;
}) {
  const countries = await getLocationCountries();
  const country = countries.find(
    (option) =>
      sameName(option.name, input.country) || option.code === input.country,
  );

  if (!country) {
    throw new LocationInputError("Select a country from the list.", {
      country: ["Select a country from the list."],
    });
  }

  const states = await getLocationStates(country.code);
  let province = input.province?.trim();

  if (states.length) {
    const selectedState = states.find(
      (option) =>
        Boolean(province) &&
        (sameName(option.name, province ?? "") || option.code === province),
    );

    if (!selectedState) {
      throw new LocationInputError(
        "Select a state or province from the list.",
        { province: ["Select a state or province from the list."] },
      );
    }

    province = selectedState.name;
  }

  return {
    country: country.name,
    province,
    city: input.city.trim(),
  };
}
