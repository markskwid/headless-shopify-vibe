"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginCustomerAction,
  recoverCustomerAction,
  registerCustomerAction,
  type AccountActionState,
} from "@/app/(storefront)/account/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: AccountActionState = {
  message: null,
  fieldErrors: {},
  success: false,
};

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

function FieldError({
  errors,
  id,
}: {
  errors: string[] | undefined;
  id: string;
}) {
  if (!errors?.length) return null;

  return (
    <p id={id} className="mt-1.5 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

function FormMessage({ state }: { state: AccountActionState }) {
  if (!state.message) return null;

  return (
    <p
      role={state.success ? "status" : "alert"}
      className={cn(
        "mb-5 rounded-lg border px-3 py-2.5 text-sm leading-6",
        state.success
          ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      {state.message}
    </p>
  );
}

function PasswordInput({
  className,
  id,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { id: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-2">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={cn(inputClassName, "mt-0 pr-11", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
      ) : null}
      {pending ? "Please wait…" : children}
    </Button>
  );
}

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState(loginCustomerAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <form action={action} noValidate>
      {notice ? (
        <p className="mb-5 rounded-lg border border-emerald-600/20 bg-emerald-500/10 px-3 py-2.5 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
          {notice}
        </p>
      ) : null}
      <FormMessage state={state} />

      <div>
        <label htmlFor="login-email" className="text-sm font-medium">Email</label>
        <input
          id="login-email" name="email" type="email" autoComplete="email"
          required maxLength={254} value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "login-email-error" : undefined}
          className={inputClassName}
        />
        <FieldError errors={state.fieldErrors.email} id="login-email-error" />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="login-password" className="text-sm font-medium">Password</label>
          <Link href="/account/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password" name="password" autoComplete="current-password"
          required maxLength={128} value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(state.fieldErrors.password)}
          aria-describedby={state.fieldErrors.password ? "login-password-error" : undefined}
        />
        <FieldError errors={state.fieldErrors.password} id="login-password-error" />
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox" name="remember" checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-foreground"
        />
        <span>
          Remember me
          <span className="block text-xs text-muted-foreground">Keep this browser signed in for seven days.</span>
        </span>
      </label>

      <div className="mt-7"><SubmitButton>Sign in</SubmitButton></div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New customer?{" "}
        <Link href="/account/register" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerCustomerAction, initialState);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "",
    confirmPassword: "", acceptsMarketing: false,
  });

  function updateField<Key extends keyof typeof form>(field: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form action={action} noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="register-first-name" className="text-sm font-medium">First name</label>
          <input
            id="register-first-name" name="firstName" autoComplete="given-name"
            required maxLength={80} value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            aria-invalid={Boolean(state.fieldErrors.firstName)}
            aria-describedby={state.fieldErrors.firstName ? "register-first-name-error" : undefined}
            className={inputClassName}
          />
          <FieldError errors={state.fieldErrors.firstName} id="register-first-name-error" />
        </div>
        <div>
          <label htmlFor="register-last-name" className="text-sm font-medium">Last name</label>
          <input
            id="register-last-name" name="lastName" autoComplete="family-name"
            required maxLength={80} value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            aria-invalid={Boolean(state.fieldErrors.lastName)}
            aria-describedby={state.fieldErrors.lastName ? "register-last-name-error" : undefined}
            className={inputClassName}
          />
          <FieldError errors={state.fieldErrors.lastName} id="register-last-name-error" />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="register-email" className="text-sm font-medium">Email</label>
        <input
          id="register-email" name="email" type="email" autoComplete="email"
          required maxLength={254} value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "register-email-error" : undefined}
          className={inputClassName}
        />
        <FieldError errors={state.fieldErrors.email} id="register-email-error" />
      </div>

      <div className="mt-5">
        <label htmlFor="register-phone" className="text-sm font-medium">
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="register-phone" name="phone" type="tel" autoComplete="tel"
          placeholder="+16135551111" maxLength={16} value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          aria-invalid={Boolean(state.fieldErrors.phone)}
          aria-describedby={state.fieldErrors.phone ? "register-phone-error" : undefined}
          className={inputClassName}
        />
        <FieldError errors={state.fieldErrors.phone} id="register-phone-error" />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="register-password" className="text-sm font-medium">Password</label>
          <PasswordInput
            id="register-password" name="password" autoComplete="new-password"
            required minLength={8} maxLength={128} value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={Boolean(state.fieldErrors.password)}
            aria-describedby={state.fieldErrors.password ? "register-password-error" : undefined}
          />
          <FieldError errors={state.fieldErrors.password} id="register-password-error" />
        </div>
        <div>
          <label htmlFor="register-confirm-password" className="text-sm font-medium">Confirm password</label>
          <PasswordInput
            id="register-confirm-password" name="confirmPassword" autoComplete="new-password"
            required minLength={8} maxLength={128} value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            aria-invalid={Boolean(state.fieldErrors.confirmPassword)}
            aria-describedby={state.fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined}
          />
          <FieldError errors={state.fieldErrors.confirmPassword} id="register-confirm-password-error" />
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox" name="acceptsMarketing" checked={form.acceptsMarketing}
          onChange={(event) => updateField("acceptsMarketing", event.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-foreground"
        />
        <span>Email me about new products, releases, and store updates.</span>
      </label>

      <div className="mt-7"><SubmitButton>Create account</SubmitButton></div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/account/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}

export function RecoverPasswordForm() {
  const [state, action] = useActionState(recoverCustomerAction, initialState);
  const [email, setEmail] = useState("");

  return (
    <form action={action} noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="recovery-email" className="text-sm font-medium">Account email</label>
        <input
          id="recovery-email" name="email" type="email" autoComplete="email"
          required maxLength={254} value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "recovery-email-error" : undefined}
          className={inputClassName}
        />
        <FieldError errors={state.fieldErrors.email} id="recovery-email-error" />
      </div>
      <div className="mt-7"><SubmitButton>Send reset instructions</SubmitButton></div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/account/login" className="font-medium text-foreground underline-offset-4 hover:underline">Back to sign in</Link>
      </p>
    </form>
  );
}
