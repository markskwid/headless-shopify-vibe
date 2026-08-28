import { z } from "zod";

export const newsletterEmailSchema = z
  .string({ error: "Enter your email address." })
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Email address is too long.")
  .pipe(z.email("Enter a valid email address."))
  .transform((email) => email.toLowerCase());

export const klaviyoErrorResponseSchema = z.object({
  errors: z.array(
    z.object({
      id: z.string().optional(),
      status: z.string().optional(),
      code: z.string().optional(),
      title: z.string().optional(),
      detail: z.string().optional(),
    }),
  ),
});
