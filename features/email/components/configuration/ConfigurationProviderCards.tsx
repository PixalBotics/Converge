"use client";

import type { EmailProvider } from "../../types";
import { PROVIDER_CODE_LABELS } from "../../email.constants";
import {
  EmailConfigProviderCard,
  EmailConfigProviderGrid,
  EmailSectionLabel,
} from "../../styles/email-configuration.styled";
import { Typography } from "@/components/common";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export function ConfigurationProviderCards({
  providers,
  selectedId,
  onSelect,
  disabled,
}: {
  providers: EmailProvider[];
  selectedId: string | null;
  onSelect: (provider: EmailProvider) => void;
  disabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;

  if (providers.length === 0) {
    return (
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
        No providers available for this type.
      </Typography>
    );
  }

  return (
    <div>
      <EmailSectionLabel component="p">Provider</EmailSectionLabel>
      <EmailConfigProviderGrid role="radiogroup" aria-label="Email provider">
        {providers.map((provider) => {
          const selected = provider.id === selectedId;
          return (
            <EmailConfigProviderCard
              key={provider.id}
              type="button"
              selected={selected}
              disabled={disabled}
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(provider)}
            >
              <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                {provider.name}
              </Typography>
              <Typography
                variant="small"
                sx={{
                  mt: 0.5,
                  color: theme.app.dashboard.textMuted,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {PROVIDER_CODE_LABELS[provider.code] ?? provider.code}
              </Typography>
            </EmailConfigProviderCard>
          );
        })}
      </EmailConfigProviderGrid>
    </div>
  );
}
