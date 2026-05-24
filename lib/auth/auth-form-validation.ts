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

export const AUTH_PASSWORD_MESSAGES = {
  required: "Password is required",
  minLength: "Password must be at least 8 characters",
  mismatch: "Passwords do not match",
} as const;

export function getAuthPasswordRules<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(): RegisterOptions<TFieldValues, TFieldName> {
  return {
    required: AUTH_PASSWORD_MESSAGES.required,
    minLength: { value: 8, message: AUTH_PASSWORD_MESSAGES.minLength },
  };
}

export const AUTH_OTP_MESSAGES = {
  required: "Verification code is required",
  invalid: "Enter the 6-digit code from your email",
} as const;

export function getAuthOtpRules<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(): RegisterOptions<TFieldValues, TFieldName> {
  return {
    required: AUTH_OTP_MESSAGES.required,
    pattern: {
      value: /^\d{6}$/,
      message: AUTH_OTP_MESSAGES.invalid,
    },
  };
}
