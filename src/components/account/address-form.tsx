"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  addCustomerAddressAction,
  updateCustomerAddressAction,
  type AddressActionState,
} from "@/app/(storefront)/account/actions";
import { Button } from "@/components/ui/button";
import {
  locationCountriesResponseSchema,
  locationStatesResponseSchema,
  type LocationCountry,
  type LocationState,
} from "@/lib/locations/schemas";
import type { CustomerAddress } from "@/lib/shopify/schemas/customer";
import { cn } from "@/lib/utils";

const initialAddressState: AddressActionState = {
  message: null,
  fieldErrors: {},
  success: false,
};

const inputClassName =
  "mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

function sameName(left: string, right: string) {
  return left.localeCompare(right, "en", { sensitivity: "base" }) === 0;
}

async function readLocationResponse(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error("Location options could not be loaded.");

  return response.json() as Promise<unknown>;
}

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;

  return (
    <p id={id} className="mt-1 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

function LocationFields({
  initialCountry,
  initialProvince,
  initialCity,
  fieldErrors,
}: {
  initialCountry: string;
  initialProvince: string;
  initialCity: string;
  fieldErrors: AddressActionState["fieldErrors"];
}) {
  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [states, setStates] = useState<LocationState[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [manualCountry, setManualCountry] = useState(initialCountry);
  const [manualProvince, setManualProvince] = useState(initialProvince);
  const [city, setCity] = useState(initialCity);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialOptions() {
      try {
        const countryPayload = locationCountriesResponseSchema.parse(
          await readLocationResponse(
            "/api/locations?level=countries",
            controller.signal,
          ),
        );

        if (controller.signal.aborted) return;

        setCountries(countryPayload.countries);
        const country = countryPayload.countries.find(
          (option) =>
            sameName(option.name, initialCountry) ||
            option.code === initialCountry,
        );

        if (!country) return;

        setCountryCode(country.code);
        const statePayload = locationStatesResponseSchema.parse(
          await readLocationResponse(
            `/api/locations?level=states&country=${encodeURIComponent(country.code)}`,
            controller.signal,
          ),
        );

        if (controller.signal.aborted) return;

        setStates(statePayload.states);
        const state = statePayload.states.find(
          (option) =>
            sameName(option.name, initialProvince) ||
            option.code === initialProvince,
        );

        if (state) setStateCode(state.code);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) setManualMode(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadInitialOptions();
    return () => controller.abort();
  }, [initialCountry, initialProvince]);

  async function handleCountryChange(value: string) {
    const country = countries.find((option) => option.code === value);
    setCountryCode(value);
    setStateCode("");
    setStates([]);
    setManualCountry(country?.name ?? "");
    setManualProvince("");
    setCity("");

    if (!value) return;

    setLoadingStates(true);

    try {
      const payload = locationStatesResponseSchema.parse(
        await readLocationResponse(
          `/api/locations?level=states&country=${encodeURIComponent(value)}`,
          new AbortController().signal,
        ),
      );
      setStates(payload.states);
    } catch {
      setManualMode(true);
    } finally {
      setLoadingStates(false);
    }
  }

  function handleStateChange(value: string) {
    const state = states.find((option) => option.code === value);
    setStateCode(value);
    setManualProvince(state?.name ?? "");
  }

  const selectedCountry = countries.find(
    (option) => option.code === countryCode,
  );
  const selectedState = states.find((option) => option.code === stateCode);
  const usesStateList = Boolean(countryCode) && states.length > 0;

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
      {manualMode ? (
        <>
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-900 sm:col-span-2 dark:text-amber-100">
            Country and province options are temporarily unavailable. You can
            still enter the shipping location manually.
          </p>
          <div>
            <label htmlFor="address-country" className="text-xs font-medium">
              Country
            </label>
            <input
              id="address-country"
              name="country"
              autoComplete="country-name"
              required
              maxLength={120}
              value={manualCountry}
              onChange={(event) => setManualCountry(event.target.value)}
              aria-invalid={Boolean(fieldErrors.country)}
              aria-describedby={fieldErrors.country ? "address-country-error" : undefined}
              className={inputClassName}
            />
            <FieldError errors={fieldErrors.country} id="address-country-error" />
          </div>
          <div>
            <label htmlFor="address-province" className="text-xs font-medium">
              State / province
            </label>
            <input
              id="address-province"
              name="province"
              autoComplete="address-level1"
              maxLength={120}
              value={manualProvince}
              onChange={(event) => setManualProvince(event.target.value)}
              aria-invalid={Boolean(fieldErrors.province)}
              aria-describedby={fieldErrors.province ? "address-province-error" : undefined}
              className={inputClassName}
            />
            <FieldError errors={fieldErrors.province} id="address-province-error" />
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="address-country-code" className="text-xs font-medium">
              Country
            </label>
            <select
              id="address-country-code"
              required
              value={countryCode}
              disabled={loading}
              onChange={(event) => void handleCountryChange(event.target.value)}
              aria-invalid={Boolean(fieldErrors.country)}
              aria-describedby={fieldErrors.country ? "address-country-error" : undefined}
              className={inputClassName}
            >
              <option value="">
                {loading ? "Loading countries…" : "Select a country"}
              </option>
              {countries.map((country) => (
                <option value={country.code} key={country.code}>
                  {country.emoji} {country.name}
                </option>
              ))}
            </select>
            <input
              type="hidden"
              name="country"
              value={loading ? initialCountry : (selectedCountry?.name ?? "")}
            />
            <FieldError errors={fieldErrors.country} id="address-country-error" />
          </div>

          <div>
            <label htmlFor="address-province-code" className="text-xs font-medium">
              State / province
            </label>
            {usesStateList || loadingStates ? (
              <>
                <select
                  id="address-province-code"
                  required
                  value={stateCode}
                  disabled={!countryCode || loadingStates}
                  onChange={(event) => handleStateChange(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.province)}
                  aria-describedby={fieldErrors.province ? "address-province-error" : undefined}
                  className={inputClassName}
                >
                  <option value="">
                    {loadingStates
                      ? "Loading provinces…"
                      : "Select a state or province"}
                  </option>
                  {states.map((state) => (
                    <option value={state.code} key={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <input
                  type="hidden"
                  name="province"
                  value={loading ? initialProvince : (selectedState?.name ?? "")}
                />
              </>
            ) : (
              <input
                id="address-province-code"
                name="province"
                autoComplete="address-level1"
                maxLength={120}
                disabled={!countryCode}
                value={manualProvince}
                onChange={(event) => setManualProvince(event.target.value)}
                aria-invalid={Boolean(fieldErrors.province)}
                aria-describedby={fieldErrors.province ? "address-province-error" : undefined}
                className={inputClassName}
              />
            )}
            <FieldError errors={fieldErrors.province} id="address-province-error" />
          </div>
        </>
      )}

      <div>
        <label htmlFor="address-city" className="text-xs font-medium">
          City
        </label>
        <input
          id="address-city"
          name="city"
          autoComplete="address-level2"
          required
          maxLength={120}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          aria-invalid={Boolean(fieldErrors.city)}
          aria-describedby={fieldErrors.city ? "address-city-error" : undefined}
          className={inputClassName}
        />
        <FieldError errors={fieldErrors.city} id="address-city-error" />
      </div>
    </div>
  );
}

function AddressSubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
      ) : null}
      {pending ? "Saving…" : editing ? "Update address" : "Save address"}
    </Button>
  );
}

export function AddressForm({
  address,
  isDefault,
  onCancel,
}: {
  address: CustomerAddress | null;
  isDefault: boolean;
  onCancel: () => void;
}) {
  const editing = Boolean(address);
  const [state, action] = useActionState(
    editing ? updateCustomerAddressAction : addCustomerAddressAction,
    initialAddressState,
  );
  const [form, setForm] = useState({
    firstName: address?.firstName ?? "",
    lastName: address?.lastName ?? "",
    company: address?.company ?? "",
    address1: address?.address1 ?? "",
    address2: address?.address2 ?? "",
    zip: address?.zip ?? "",
    phone: address?.phone ?? "",
    setDefault: isDefault,
  });

  function updateField<Key extends keyof typeof form>(
    field: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const fields = [
    ["firstName", "First name", "given-name", true],
    ["lastName", "Last name", "family-name", true],
    ["company", "Company (optional)", "organization", false],
    ["address1", "Address", "address-line1", true],
    ["address2", "Apartment, suite, etc. (optional)", "address-line2", false],
    ["zip", "Postal code", "postal-code", true],
    ["phone", "Phone (optional)", "tel", false],
  ] as const;

  return (
    <form
      action={action}
      noValidate
      className="mt-5 rounded-xl border bg-secondary/30 p-4 sm:p-5"
    >
      {address ? (
        <input type="hidden" name="addressId" value={address.id} />
      ) : null}
      <h3 className="font-semibold">
        {editing ? "Edit address" : "Add a new address"}
      </h3>
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          className={cn(
            "mt-3 rounded-lg border px-3 py-2 text-sm",
            state.success
              ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : "border-destructive/20 bg-destructive/10 text-destructive",
          )}
        >
          {state.message}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.slice(0, 5).map(([field, label, autoComplete, required]) => {
          const errorId = `address-${field}-error`;

          return (
            <div
              key={field}
              className={
                field === "address1" || field === "address2"
                  ? "sm:col-span-2"
                  : undefined
              }
            >
              <label htmlFor={`address-${field}`} className="text-xs font-medium">
                {label}
              </label>
              <input
                id={`address-${field}`}
                name={field}
                autoComplete={autoComplete}
                required={required}
                maxLength={255}
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                aria-invalid={Boolean(state.fieldErrors[field])}
                aria-describedby={state.fieldErrors[field] ? errorId : undefined}
                className={inputClassName}
              />
              <FieldError errors={state.fieldErrors[field]} id={errorId} />
            </div>
          );
        })}

        <LocationFields
          initialCountry={address?.country ?? ""}
          initialProvince={address?.province ?? ""}
          initialCity={address?.city ?? ""}
          fieldErrors={state.fieldErrors}
        />

        {fields.slice(5).map(([field, label, autoComplete, required]) => {
          const errorId = `address-${field}-error`;

          return (
            <div key={field}>
              <label htmlFor={`address-${field}`} className="text-xs font-medium">
                {label}
              </label>
              <input
                id={`address-${field}`}
                name={field}
                type={field === "phone" ? "tel" : "text"}
                autoComplete={autoComplete}
                required={required}
                maxLength={field === "phone" ? 16 : 32}
                placeholder={field === "phone" ? "+16135551111" : undefined}
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                aria-invalid={Boolean(state.fieldErrors[field])}
                aria-describedby={state.fieldErrors[field] ? errorId : undefined}
                className={inputClassName}
              />
              <FieldError errors={state.fieldErrors[field]} id={errorId} />
            </div>
          );
        })}
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="setDefault"
          checked={form.setDefault}
          disabled={isDefault}
          onChange={(event) => updateField("setDefault", event.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-foreground"
        />
        {isDefault
          ? "This is your primary shipping address"
          : "Use as my primary shipping address"}
      </label>
      <div className="mt-5 flex flex-wrap gap-2">
        <AddressSubmitButton editing={editing} />
        <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
