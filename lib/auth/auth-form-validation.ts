import type { FieldPath, FieldValues, RegisterOptions } from "react-hook-form";

/** Shared across login, forgot-password, and any future auth email fields. */
export const AUTH_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_EMAIL_MESSAGES = {
  required: "Email is required",
  invalid: "Enter a valid email address",
} as const;

/**
 * react-hook-form rules for a required, reasonably validated email field.
 * Pass your form value type and field name so `Controller`/`register` inference stays strict.
 */
export function getAuthEmailRules<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(): RegisterOptions<TFieldValues, TFieldName> {
  return {
    required: AUTH_EMAIL_MESSAGES.required,
    pattern: {
      value: AUTH_EMAIL_REGEX,
      message: AUTH_EMAIL_MESSAGES.invalid,
    },
  };
}
