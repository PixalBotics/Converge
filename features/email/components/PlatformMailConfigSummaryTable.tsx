"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { iconGlyphSx } from "@/lib/design-system";
import { Button, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { usePlatformEmailSettingsQuery } from "../hooks/useEmailSettings";
import { formatLastTestLabel } from "../utils/extract-email-list";
import { PROVIDER_CODE_LABELS } from "../email.constants";
import { EmailConfigTableCard } from "../styles/email-configuration.styled";
import { departmentsFooterRow, footerMutedText, gradientPrimaryButtonSx } from "../styles/email-page.styles";
import { emailPlatformSummaryTableSx } from "../styles/email-table.styles";
import { EmailStatusChip } from "./EmailStatusChip";
import { EmailTableActions } from "./EmailTableActions";
import { EmailTableCardHeader } from "./EmailTableCardHeader";

type PlatformSummaryRow = {
  id: string;
  provider: string;
  fromEmail: string;
  fromName: string;
  status: string;
  lastTest: string;
  isActive: boolean;
};

export function PlatformMailConfigSummaryTable({
  enabled,
  onConfigure,
  canConfigure = false,
}: {
  enabled?: boolean;
  onConfigure?: () => void;
  canConfigure?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const settingsQuery = usePlatformEmailSettingsQuery({ enabled: enabled ?? true });
  const row = useMemo((): PlatformSummaryRow | null => {
    const s = settingsQuery.data;
    if (!s?.emailProviderId) return null;
    const providerLabel =
      s.providerName ??
      PROVIDER_CODE_LABELS[s.providerCode ?? ""] ??
      s.providerCode ??
      "Configured";
    return {
      id: "platform",
      provider: providerLabel,
      fromEmail: s.fromEmail?.trim() || "—",
      fromName: s.fromName?.trim() || "—",
      status: s.isEnabled ? "Active" : "Paused",
      isActive: Boolean(s.isEnabled),
      lastTest: formatLastTestLabel(s.lastTestStatus, s.lastTestedAt),
    };
  }, [settingsQuery.data]);

  const columns = useMemo<DataTableColumn<PlatformSummaryRow>[]>(
    () => [
      { id: "provider", label: "Provider" },
      { id: "fromEmail", label: "From email" },
      { id: "fromName", label: "From name" },
      {
        id: "status",
        label: "Sending",
        render: (_, r) => <EmailStatusChip active={r.isActive} />,
      },
      { id: "lastTest", label: "Last test" },
    ],
    [],
  );

  const isLoading = settingsQuery.isLoading;
  const rows = row ? [row] : [];

  const configureButton =
    canConfigure && onConfigure ? (
      <Button
        type="button"
        variant="primary"
        startIcon={<SettingsOutlined sx={{ fontSize: 20 }} />}
        sx={gradientPrimaryButtonSx}
        onClick={onConfigure}
      >
        Platform email configuration
      </Button>
    ) : null;

  return (
    <EmailConfigTableCard elevation={0} sx={{ mb: 0 }}>
      <EmailTableCardHeader
        icon={
          <SettingsOutlined
            sx={{
              ...(iconGlyphSx("sm") as object),
              color: theme.app.dashboard.white95,
            }}
          />
        }
        title="Platform configuration"
        subtitle="Default SMTP or API used by the platform and inherited by assigned resellers."
        action={configureButton}
      />

      <DataTable<PlatformSummaryRow>
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        minWidth={720}
        tableSx={emailPlatformSummaryTableSx}
        emptyState={{
          title: "Not configured yet",
          description: "Use Platform email configuration to set up SMTP or API before assigning resellers.",
        }}
        actionColumn={
          canConfigure && onConfigure && row
            ? {
                label: "Action",
                render: () => (
                  <EmailTableActions
                    editLabel="Edit platform configuration"
                    deleteLabel="Remove platform configuration"
                    canEdit
                    canDelete={false}
                    onEdit={onConfigure}
                  />
                ),
              }
            : undefined
        }
      />

      <Box sx={departmentsFooterRow}>
        <Typography variant="medium" sx={footerMutedText(theme)}>
          {isLoading ? "Loading…" : row ? "1 active configuration" : "No saved configuration"}
        </Typography>
      </Box>
    </EmailConfigTableCard>
  );
}
