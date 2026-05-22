"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import DnsOutlined from "@mui/icons-material/DnsOutlined";
import ApiOutlined from "@mui/icons-material/ApiOutlined";
import type { MailProviderSettings } from "../../types";
import { ConfigurationProviderKindCards } from "../configuration/ConfigurationProviderKindCards";
import { ConfigurationProviderCards } from "../configuration/ConfigurationProviderCards";
import type { useOwnMailProviderForm } from "../../hooks/useOwnMailProviderForm";

type FormState = ReturnType<typeof useOwnMailProviderForm>;

export function OwnMailProviderForm({
  form,
  disabled,
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
    </Box>
  );
}
