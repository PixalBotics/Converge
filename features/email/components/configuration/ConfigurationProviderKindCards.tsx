"use client";

import type { ElementType } from "react";
import type { EmailProviderKind } from "../../types";
import { PROVIDER_KIND_LABELS } from "../../email.constants";
import {
  EmailConfigKindCard,
  EmailConfigKindGrid,
  EmailSectionLabel,
} from "../../styles/email-configuration.styled";
import { Typography } from "@/components/common";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { iconGlyphSx } from "@/lib/design-system";

const KIND_HINTS: Record<EmailProviderKind, string> = {
  api: "SendGrid, Mailgun, and similar API keys",
  smtp: "Gmail, Microsoft 365, or custom mail server",
};

export function ConfigurationProviderKindCards({
  kinds,
  selectedKind,
  onSelect,
  disabled,
  icons,
}: {
  kinds: EmailProviderKind[];
  selectedKind: EmailProviderKind | null;
  onSelect: (kind: EmailProviderKind) => void;
  disabled?: boolean;
  icons?: Partial<Record<EmailProviderKind, ElementType>>;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <div>
      <EmailSectionLabel component="p">Connection type</EmailSectionLabel>
      <EmailConfigKindGrid role="radiogroup" aria-label="Connection type">
        {kinds.map((kind) => {
          const selected = selectedKind === kind;
          const Icon = icons?.[kind];
          return (
            <EmailConfigKindCard
              key={kind}
              type="button"
              selected={selected}
              disabled={disabled}
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(kind)}
            >
              {Icon ? (
                <Icon
                  sx={{
                    ...(iconGlyphSx("md") as object),
                    color: selected ? theme.palette.primary.main : theme.app.dashboard.iconMuted,
                    mb: 1,
                  }}
                />
              ) : null}
              <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary }}>
                {PROVIDER_KIND_LABELS[kind] ?? kind.toUpperCase()}
              </Typography>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5, display: "block" }}>
                {KIND_HINTS[kind]}
              </Typography>
            </EmailConfigKindCard>
          );
        })}
      </EmailConfigKindGrid>
    </div>
  );
}
