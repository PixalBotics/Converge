"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { ClientServicesAccessRow } from "@/api/companies/services-access.api";
import { ModuleChips, OfferingTypeChip } from "./services-shared";
import { ServicesDialogShell } from "./ServicesDialogShell";

type Props = {
  open: boolean;
  row: ClientServicesAccessRow | null;
  moduleLabels: Record<string, string>;
  canEditReseller: boolean;
  onClose: () => void;
  onEditReseller: (resellerId: string, resellerName: string) => void;
};

export function ClientServicesDetailModal({
  open,
  row,
  moduleLabels,
  canEditReseller,
  onClose,
  onEditReseller,
}: Props) {
  const theme = useTheme() as AppTheme;

  return (
    <ServicesDialogShell
      open={open}
      onClose={onClose}
      title={row ? `Client access — ${row.name}` : "Client access"}
      maxWidth={560}
    >
      {!row ? null : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Reseller
            </Typography>
            <Typography fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.resellerName}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Offering type
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <OfferingTypeChip type={row.offeringType} />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Active modules (inherited from reseller)
            </Typography>
            <Box sx={{ mt: 1 }}>
              <ModuleChips moduleCodes={row.moduleCodes} moduleLabels={moduleLabels} max={20} />
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Client modules currently mirror the reseller ceiling. Edit the reseller to add or remove
            product access for all clients under that agency.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {canEditReseller ? (
              <Button
                variant="primary"
                onClick={() => {
                  onEditReseller(row.resellerId, row.resellerName);
                  onClose();
                }}
              >
                Edit reseller modules
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      )}
    </ServicesDialogShell>
  );
}
