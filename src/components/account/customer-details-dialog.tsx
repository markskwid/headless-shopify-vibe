"use client";

import { Eye, EyeOff, LoaderCircle, Pencil } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateCustomerDetailsAction,
  type CustomerDetailsActionState,
} from "@/app/(storefront)/account/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const initialState: CustomerDetailsActionState = {
  message: null,
  fieldErrors: {},
  success: false,
  revision: 0,
};

const inputClassName =
  "mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

function SaveCustomerDetailsButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
      ) : null}
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;

  return (
    <p id={id} className="mt-1 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

function PasswordFields({
  fieldErrors,
}: {
  fieldErrors: CustomerDetailsActionState["fieldErrors"];
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const fields = [
    {
      id: "customer-password",
      name: "password",
      label: "New password",
      value: password,
      visible: passwordVisible,
      setValue: setPassword,
      setVisible: setPasswordVisible,
    },
    {
      id: "customer-confirm-password",
      name: "confirmPassword",
      label: "Confirm new password",
      value: confirmPassword,
      visible: confirmVisible,
      setValue: setConfirmPassword,
      setVisible: setConfirmVisible,
    },
  ] as const;

  return (
    <fieldset className="mt-5 rounded-xl border p-4">
      <legend className="px-1 text-sm font-medium">Change password</legend>
      <p className="text-xs leading-5 text-muted-foreground">
        Leave both fields blank to keep your current password. Changing it signs
        out other customer sessions while keeping this browser signed in.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const error = fieldErrors[field.name];
          const errorId = `${field.id}-error`;

          return (
            <div key={field.name}>
              <label htmlFor={field.id} className="text-xs font-medium">
                {field.label}
              </label>
              <div className="relative">
                <input
                  id={field.id}
                  name={field.name}
                  type={field.visible ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={field.value}
                  onChange={(event) => field.setValue(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className={cn(inputClassName, "pr-11")}
                />
                <button
                  type="button"
                  aria-label={field.visible ? "Hide password" : "Show password"}
                  aria-controls={field.id}
                  aria-pressed={field.visible}
                  onClick={() => field.setVisible(!field.visible)}
                  className="absolute right-1 bottom-0.5 flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {field.visible ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <FieldError errors={error} id={errorId} />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CustomerDetailsDialog({
  firstName,
  lastName,
  phone,
  acceptsMarketing,
}: {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
}) {
  const [state, action] = useActionState(
    updateCustomerDetailsAction,
    initialState,
  );
  const [form, setForm] = useState({
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    phone: phone ?? "",
    acceptsMarketing,
  });

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        <Pencil aria-hidden="true" />
        Edit details
      </DialogTrigger>
      <DialogContent className="max-h-[min(90dvh,52rem)] max-w-xl overflow-y-auto p-6 sm:p-7">
        <DialogTitle>Edit customer details</DialogTitle>
        <DialogDescription className="mt-1">
          Update your name, phone number, password, and email marketing
          preference.
        </DialogDescription>

        <form action={action} noValidate className="mt-6">
          {state.message ? (
            <p
              role={state.success ? "status" : "alert"}
              className={cn(
                "mb-4 rounded-lg border px-3 py-2 text-sm",
                state.success
                  ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : "border-destructive/20 bg-destructive/10 text-destructive",
              )}
            >
              {state.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer-first-name" className="text-sm font-medium">
                First name
              </label>
              <input
                id="customer-first-name"
                name="firstName"
                autoComplete="given-name"
                maxLength={80}
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                aria-invalid={Boolean(state.fieldErrors.firstName)}
                aria-describedby={
                  state.fieldErrors.firstName
                    ? "customer-first-name-error"
                    : undefined
                }
                className={inputClassName}
              />
              <FieldError
                errors={state.fieldErrors.firstName}
                id="customer-first-name-error"
              />
            </div>
            <div>
              <label htmlFor="customer-last-name" className="text-sm font-medium">
                Last name
              </label>
              <input
                id="customer-last-name"
                name="lastName"
                autoComplete="family-name"
                maxLength={80}
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                aria-invalid={Boolean(state.fieldErrors.lastName)}
                aria-describedby={
                  state.fieldErrors.lastName
                    ? "customer-last-name-error"
                    : undefined
                }
                className={inputClassName}
              />
              <FieldError
                errors={state.fieldErrors.lastName}
                id="customer-last-name-error"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="customer-phone" className="text-sm font-medium">
              Phone number
            </label>
            <input
              id="customer-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={16}
              placeholder="+16135551111"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              aria-invalid={Boolean(state.fieldErrors.phone)}
              aria-describedby={
                state.fieldErrors.phone
                  ? "customer-phone-error customer-phone-help"
                  : "customer-phone-help"
              }
              className={inputClassName}
            />
            <p
              id="customer-phone-help"
              className="mt-1.5 text-xs text-muted-foreground"
            >
              Use international E.164 format. Leave blank to remove the number.
            </p>
            <FieldError
              errors={state.fieldErrors.phone}
              id="customer-phone-error"
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border bg-secondary/30 p-4">
            <input
              type="checkbox"
              name="acceptsMarketing"
              checked={form.acceptsMarketing}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  acceptsMarketing: event.target.checked,
                }))
              }
              className="mt-0.5 size-4 rounded border-input accent-foreground"
            />
            <span>
              <span className="block text-sm font-medium">Email marketing</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Receive store news, product updates, and promotional emails.
                Shopify might require email confirmation when double opt-in is
                enabled.
              </span>
            </span>
          </label>

          <PasswordFields
            key={state.revision}
            fieldErrors={state.fieldErrors}
          />

          <div className="mt-6 flex justify-end gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <SaveCustomerDetailsButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
