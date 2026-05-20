"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  EmailProvider,
  EmailProviderKind,
  EmailTestResult,
  MailProviderSettings,
  MailProviderSettingsBody,
} from "../types";
import { schemaFieldKey } from "../utils/schema-fields";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { groupProvidersByKind } from "../utils/group-providers-by-kind";
import { resolveProviderKind } from "../utils/email-settings-normalize";
import {
  buildFieldsPayload,
  normalizeFieldValuesForDisplay,
  validateRequiredMailFields,
} from "../utils/email-fields-payload";
import {
  extractEmailTestErrorMessage,
  validateTestToEmail,
} from "../utils/email-test.utils";
import { useEmailProvidersQuery, useEmailProviderSchemaQuery } from "./useEmailProviders";
export function useOwnMailProviderForm({
  enabled,
  settings,
  onSave,
  onTest,
}: {
  enabled: boolean;
  settings: MailProviderSettings | undefined;
  onSave: (body: MailProviderSettingsBody) => Promise<unknown>;
  onTest: (body: { toEmail?: string }) => Promise<EmailTestResult>;
}) {
  const [providerKind, setProviderKind] = useState<EmailProviderKind | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [testToEmail, setTestToEmail] = useState("");
  const [savedOnce, setSavedOnce] = useState(false);

  const providersQuery = useEmailProvidersQuery({ enabled });
  const schemaQuery = useEmailProviderSchemaQuery(providerId, { enabled: enabled && Boolean(providerId) });

  const providerGroups = useMemo(
    () => groupProvidersByKind(providersQuery.data ?? []),
    [providersQuery.data],
  );

  const providersForKind = useMemo(() => {
    if (!providerKind) return [];
    return providerGroups.find((g) => g.kind === providerKind)?.providers ?? [];
  }, [providerGroups, providerKind]);

  const selectedProvider = useMemo(
    () => (providersQuery.data ?? []).find((p) => p.id === providerId) ?? null,
    [providersQuery.data, providerId],
  );

  useEffect(() => {
    if (!settings) return;
    setProviderId(settings.emailProviderId);
    setFromEmail(settings.fromEmail ?? "");
    setFromName(settings.fromName ?? "");
    setIsEnabled(Boolean(settings.isEnabled));
    setFieldValues(normalizeFieldValuesForDisplay(settings.fields ?? {}));
    setSavedOnce(Boolean(settings.emailProviderId));
    if (settings.emailProviderId) {
      const fromList = (providersQuery.data ?? []).find((x) => x.id === settings.emailProviderId);
      if (fromList) {
        setProviderKind(resolveProviderKind(fromList) ?? "api");
      } else if (settings.providerKind) {
        setProviderKind(settings.providerKind);
      } else if (settings.providerCode) {
        setProviderKind(resolveProviderKind({ code: settings.providerCode }) ?? "api");
      }
    }
  }, [settings, providersQuery.data]);

  useEffect(() => {
    const fields = schemaQuery.data?.fields;
    if (!fields?.length || !providerId) return;
    setFieldValues((prev) => {
      const next = { ...normalizeFieldValuesForDisplay(prev, fields) };
      for (const f of fields) {
        const fk = schemaFieldKey(f);
        if (!next[fk]?.trim()) next[fk] = f.defaultValue ?? "";
      }
      return next;
    });
  }, [schemaQuery.data?.fields, providerId]);

  const handleKindSelect = (kind: EmailProviderKind) => {
    setProviderKind(kind);
    setProviderId(null);
    setFieldValues({});
  };

  const handleProviderSelect = (provider: EmailProvider) => {
    if (provider.id !== providerId) setFieldValues({});
    setProviderId(provider.id);
    setProviderKind(resolveProviderKind(provider) ?? providerKind);
  };

  const handleSave = useCallback(async () => {
    if (!providerId) {
      publishAppToast({ variant: "error", message: "Select a provider." });
      return;
    }
    const schemaFields = schemaQuery.data?.fields ?? [];
    const validationError = validateRequiredMailFields(schemaFields, fieldValues, settings?.fields);
    if (validationError) {
      publishAppToast({ variant: "error", message: validationError });
      return;
    }
    try {
      await onSave({
        emailProviderId: providerId,
        fromEmail: fromEmail.trim(),
        fromName: fromName.trim() || undefined,
        isEnabled,
        fields: buildFieldsPayload(schemaFields, fieldValues, settings?.fields),
      });
      setSavedOnce(true);
      publishAppToast({ variant: "success", message: "Mail settings saved." });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not save mail settings.",
      });
    }
  }, [
    providerId,
    schemaQuery.data?.fields,
    fieldValues,
    settings?.fields,
    fromEmail,
    fromName,
    isEnabled,
    onSave,
  ]);

  const handleTest = useCallback(async () => {
    const validationError = validateTestToEmail(testToEmail);
    if (validationError) {
      publishAppToast({ variant: "error", message: validationError });
      throw new Error(validationError);
    }
    try {
      const result = await onTest({ toEmail: testToEmail.trim() || undefined });
      const msg = result?.message?.trim() || (result?.success ? "Test email sent." : "Test failed.");
      publishAppToast({
        variant: result?.success ? "success" : "error",
        message: msg,
      });
      return result;
    } catch (err) {
      const message = extractEmailTestErrorMessage(err);
      publishAppToast({ variant: "error", message });
      throw err;
    }
  }, [onTest, testToEmail]);

  return {
    providerKind,
    providerId,
    availableKinds: providerGroups.map((g) => g.kind),
    providersForKind,
    selectedProvider,
    fromEmail,
    setFromEmail,
    fromName,
    setFromName,
    isEnabled,
    setIsEnabled,
    fieldValues,
    setFieldValues,
    testToEmail,
    setTestToEmail,
    providersQuery,
    schemaQuery,
    handleKindSelect,
    handleProviderSelect,
    handleSave,
    handleTest,
    savedOnce,
    showGmailTip: selectedProvider?.code === "smtp",
  };
}
