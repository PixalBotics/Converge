"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { integrationsMainCardSx } from "@/app/dashboard/integrations/integrations.styles";
import { Button, DashboardCard, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { usePlatformEmailSettingsQuery } from "../hooks/useEmailSettings";
import { EmailTestStatusCell } from "./EmailTestStatusCell";
import { PROVIDER_CODE_LABELS } from "../email.constants";
import { departmentsFooterRow, footerMutedText, gradientPrimaryButtonSx } from "../styles/email-page.styles";
import { EmailStatusChip } from "./EmailStatusChip";
import { EmailTableActions } from "./EmailTableActions";
import { EmailTableTextCell } from "./EmailTableTextCell";

type PlatformSummaryRow = {
  id: string;
  provider: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  lastTestMessage?: string | null;
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
      isActive: Boolean(s.isEnabled),
      lastTestStatus: s.lastTestStatus,
      lastTestedAt: s.lastTestedAt,
      lastTestMessage: s.lastTestMessage,
    };
  }, [settingsQuery.data]);

  const columns = useMemo<DataTableColumn<PlatformSummaryRow>[]>(
    () => [
      {
        id: "provider",
        label: "Provider",
        render: (_v, r) => <EmailTableTextCell value={r.provider} />,
      },
      {
        id: "fromEmail",
        label: "From email",
        render: (_v, r) => <EmailTableTextCell value={r.fromEmail} />,
      },
      {
        id: "fromName",
        label: "From name",
        render: (_v, r) => <EmailTableTextCell value={r.fromName} muted />,
      },
      {
        id: "status",
        label: "Sending",
        render: (_v, r) => (
          <Box sx={{ display: "inline-flex", flexShrink: 0 }}>
            <EmailStatusChip active={r.isActive} activeLabel="Active" inactiveLabel="Paused" />
          </Box>
        ),
      },
      {
        id: "lastTest",
        label: "Last test",
        render: (_v, r) => (
          <EmailTestStatusCell
            status={r.lastTestStatus}
            testedAt={r.lastTestedAt}
            message={r.lastTestMessage}
          />
        ),
      },
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
        {row ? "Edit configuration" : "Platform email configuration"}
      </Button>
    ) : null;

  return (
    <DashboardCard sx={{ ...integrationsMainCardSx, mb: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Platform configuration
          </Typography>
          <Typography
            variant="small"
            sx={{ color: theme.app.dashboard.textMuted, mt: 0.25, display: "block", maxWidth: 640 }}
          >
            One global SMTP or API sender for the platform. Resellers on platform mail inherit this configuration.
          </Typography>
        </Box>
        {configureButton ? <Box sx={{ flexShrink: 0 }}>{configureButton}</Box> : null}
      </Box>

      <DataTable<PlatformSummaryRow>
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        minWidth={980}
        emptyState={{
          title: "Not configured yet",
          description: "Set up one platform SMTP or API provider before assigning resellers to platform mail.",
        }}
        actionColumn={
          canConfigure && onConfigure && row
            ? {
                label: "Actions",
                align: "right",
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
          {isLoading
            ? "Loading…"
            : row
              ? "1 platform sender configured"
              : "No platform sender saved yet"}
        </Typography>
      </Box>
    </DashboardCard>
  );
}
