"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";

import {
  subscribeToNewsletterAction,
  type NewsletterActionState,
} from "@/app/(storefront)/newsletter/actions";
import { cn } from "@/lib/utils";

const initialState: NewsletterActionState = {
  message: null,
  fieldErrors: {},
  success: false,
};

type NewsletterFormProps = {
  buttonLabel: string;
  consentNote: string;
  emailPlaceholder: string;
  initialEmail: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-background/85 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-background/40 disabled:pointer-events-none disabled:opacity-60 sm:w-auto lg:w-full xl:w-auto"
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight className="size-4" aria-hidden="true" />
      )}
      {pending ? "Subscribing…" : label}
    </button>
  );
}

export function NewsletterForm({
  buttonLabel,
  consentNote,
  emailPlaceholder,
  initialEmail,
}: NewsletterFormProps) {
  const [state, action] = useActionState(
    subscribeToNewsletterAction,
    initialState,
  );
  const [email, setEmail] = useState(initialEmail);
  const error = state.fieldErrors.email?.[0];

  return (
    <form action={action} className="mt-5" noValidate>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="newsletter-company">Company</label>
        <input
          id="newsletter-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:flex-col xl:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={emailPlaceholder}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error || state.message ? "newsletter-form-message" : undefined
          }
          className="h-12 min-h-12 w-full flex-none appearance-none rounded-lg border border-background/20 bg-background/10 px-3.5 py-3 text-base leading-6 text-background outline-none transition-colors placeholder:text-background/50 hover:border-background/35 focus:border-background/55 focus:ring-3 focus:ring-background/15 aria-invalid:border-red-300 sm:min-w-0 sm:flex-1 lg:flex-none xl:min-w-0 xl:flex-1"
        />
        <SubmitButton label={buttonLabel} />
      </div>
      {state.message ? (
        <p
          id="newsletter-form-message"
          role={state.success ? "status" : "alert"}
          className={cn(
            "mt-3 text-xs",
            state.success ? "text-emerald-200" : "text-red-200",
          )}
        >
          {error || state.message}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-background/55">
        {consentNote}
      </p>
    </form>
  );
}
