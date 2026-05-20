"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import DnsOutlined from "@mui/icons-material/DnsOutlined";
import ApiOutlined from "@mui/icons-material/ApiOutlined";
import type { MailProviderSettings } from "../../types";
import { DynamicSmtpFieldsForm } from "../DynamicSmtpFieldsForm";
import { ConfigurationProviderKindCards } from "../configuration/ConfigurationProviderKindCards";
import { ConfigurationProviderCards } from "../configuration/ConfigurationProviderCards";
import type { useOwnMailProviderForm } from "../../hooks/useOwnMailProviderForm";

type FormState = ReturnType<typeof useOwnMailProviderForm>;

export function OwnMailProviderForm({
  form,
  disabled,
  existingFields,
}: {
  form: FormState;
  disabled?: boolean;
  existingFields?: MailProviderSettings["fields"];
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {form.providersQuery.isLoading ? (
        <Skeleton variant="rounded" height={88} />
      ) : (
        <ConfigurationProviderKindCards
          kinds={form.availableKinds}
          selectedKind={form.providerKind}
          onSelect={form.handleKindSelect}
          disabled={disabled}
          icons={{ smtp: DnsOutlined, api: ApiOutlined }}
        />
      )}

      {form.providerKind ? (
        <ConfigurationProviderCards
          providers={form.providersForKind}
          selectedId={form.providerId}
          onSelect={form.handleProviderSelect}
          disabled={disabled}
        />
      ) : null}

      {form.providerId && form.schemaQuery.isLoading ? (
        <Skeleton variant="rounded" height={80} />
      ) : form.schemaQuery.data ? (
        <DynamicSmtpFieldsForm
          fields={form.schemaQuery.data.fields}
          schema={form.schemaQuery.data}
          values={form.fieldValues}
          existingFields={existingFields}
          onChange={(key, value) => {
            form.setFieldValues((prev) => ({ ...prev, [key]: value }));
          }}
          disabled={disabled}
          showGmailTip={form.showGmailTip}
        />
      ) : null}
    </Box>
  );
}
