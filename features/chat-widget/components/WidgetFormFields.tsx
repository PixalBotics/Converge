"use client";

import { useMemo, useState } from "react";
import { InputField } from "@/components/common";
import type { InputFieldProps } from "@/components/common/InputField/InputField.types";
import {
  clampIntegerString,
  FIELD_MAX,
  normalizeSingleUrlInput,
  parseDomainListInput,
  validateDomainListInput,
  validateSingleHttpUrl,
  validateVideoEmbedUrl,
} from "@/lib/chat-widget/widget-field-validation";

type BaseProps = Omit<InputFieldProps, "type" | "onChange" | "value" | "error" | "helperText">;

export function WidgetTextField({
  value,
  onChange,
  maxLength = FIELD_MAX.message,
  showCharCount,
  validate,
  helperText,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showCharCount?: boolean;
  validate?: (value: string) => string | null;
}) {
  const [touched, setTouched] = useState(false);
  const validationError = useMemo(
    () => (touched && validate ? validate(value) : null),
    [touched, validate, value],
  );
  const countHint =
    showCharCount && maxLength
      ? `${value.length}/${maxLength}`
      : null;
  const mergedHelper = validationError ?? helperText ?? countHint ?? undefined;

  return (
    <InputField
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setTouched(true)}
      error={Boolean(validationError)}
      helperText={mergedHelper}
      inputProps={{ maxLength }}
    />
  );
}

export function WidgetUrlField({
  value,
  onChange,
  required,
  videoEmbed,
  helperText,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** YouTube / Vimeo only */
  videoEmbed?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const validationError = useMemo(() => {
    if (!touched) return null;
    if (videoEmbed) return validateVideoEmbedUrl(value);
    return validateSingleHttpUrl(value, {
      required,
      label: rest.label || "URL",
    });
  }, [touched, value, required, videoEmbed, rest.label]);

  return (
    <InputField
      {...rest}
      type="text"
      value={value}
      onChange={(e) => onChange(normalizeSingleUrlInput(e.target.value))}
      onBlur={() => setTouched(true)}
      error={Boolean(validationError)}
      helperText={validationError ?? helperText}
      placeholder={rest.placeholder ?? "https://"}
      inputProps={{
        maxLength: FIELD_MAX.url,
        inputMode: "url",
        autoComplete: "url",
        spellCheck: false,
      }}
    />
  );
}

export function WidgetDomainListField({
  value,
  onChange,
  helperText,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
}) {
  const [touched, setTouched] = useState(false);
  const validationError = useMemo(() => {
    if (!touched || !value.trim()) return null;
    return validateDomainListInput(value);
  }, [touched, value]);

  return (
    <InputField
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        setTouched(true);
        const normalized = formatDomainListOnBlur(value);
        if (normalized !== value) onChange(normalized);
      }}
      error={Boolean(validationError)}
      helperText={
        validationError ??
        helperText ??
        "Hostnames only, comma-separated — e.g. example.com, www.example.com"
      }
      placeholder={rest.placeholder ?? "example.com, app.example.com"}
      inputProps={{ maxLength: FIELD_MAX.domainList }}
    />
  );
}

function formatDomainListOnBlur(raw: string): string {
  const hosts = parseDomainListInput(raw);
  return hosts.join(", ");
}

export function WidgetNumericField({
  value,
  onChange,
  min,
  max,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
}) {
  return (
    <InputField
      {...rest}
      type="text"
      value={value}
      onChange={(e) => onChange(clampIntegerString(e.target.value, min, max))}
      helperText={rest.helperText ?? `Between ${min} and ${max}`}
      inputProps={{
        inputMode: "numeric",
        pattern: "[0-9]*",
        min,
        max,
      }}
    />
  );
}
