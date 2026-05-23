"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Checkbox, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAuth } from "@/lib/auth";
import { useClientPermissionsQuery, useReplaceClientPermissionsMutation } from "@/lib/hooks/query/companies/client-permissions";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { OP, canRoleAction } from "@/lib/permissions";
import {
  CHAT_CLIENT_CAP_PRESET_LABELS,
  CHAT_CLIENT_CAP_PRESET_NAMES,
} from "@/lib/permissions/chat-client-cap-preset";
import { departmentsCard } from "../../website-assigning/website-assigning.styles";

type ClientPermissionsCapPanelProps = {
  parentCompanyId: string;
  parentCompanyName?: string;
};

export function ClientPermissionsCapPanel({
  parentCompanyId,
  parentCompanyName,
}: ClientPermissionsCapPanelProps) {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canEdit = canRoleAction(hasOperational) || hasOperational(OP.client.permissions);

  const capQuery = useClientPermissionsQuery(parentCompanyId, {
    enabled: parentCompanyId.trim().length > 0,
  });
  const saveMutation = useReplaceClientPermissionsMutation(parentCompanyId);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const assigned = capQuery.data ?? [];
    const next: Record<string, boolean> = {};
    for (const code of CHAT_CLIENT_CAP_PRESET_NAMES) next[code] = false;
    const presetSet = new Set<string>(CHAT_CLIENT_CAP_PRESET_NAMES);
    for (const code of assigned) {
      if (presetSet.has(code)) next[code] = true;
    }
    setSelected(next);
  }, [capQuery.data]);

  const selectedNames = useMemo(
    () => CHAT_CLIENT_CAP_PRESET_NAMES.filter((c) => selected[c]),
    [selected],
  );

  const applyPreset = () => {
    const next: Record<string, boolean> = {};
    for (const code of CHAT_CLIENT_CAP_PRESET_NAMES) next[code] = true;
    setSelected(next);
  };

  const handleSave = () => {
    if (selectedNames.length === 0) {
      publishAppToast({ variant: "error", message: "Select at least one cap permission or bundle." });
      return;
    }
    saveMutation.mutate(selectedNames, {
      onSuccess: () =>
        publishAppToast({ variant: "success", message: "Client permission cap saved." }),
      onError: (e) =>
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(e) ?? "Could not save client cap.",
        }),
    });
  };

  if (!canEdit && (capQuery.data?.length ?? 0) === 0) {
    return null;
  }

  return (
    <DashboardCard
      sx={{
        ...departmentsCard,
        p: { xs: 2, sm: 2.5 },
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.95)}`,
      }}
    >
      <Typography variant="mediumLarge" color="white" fontWeight={700} sx={{ mb: 0.5 }}>
        Chat permission cap
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, lineHeight: 1.55 }}>
        External users: effective access = role ∩ reseller cap ∩ this company cap. Prefer chat bundles
        below; backend treats <code>chat:access</code> in the cap as covering{" "}
        <code>chat:bundle:agent</code> on the role.
        {parentCompanyName ? ` (${parentCompanyName})` : null}
      </Typography>

      {capQuery.isError ? (
        <Typography sx={{ color: theme.palette.error.light, mb: 1 }}>
          {extractApiErrorMessageForToast(capQuery.error) ?? "Could not load client permissions."}
        </Typography>
      ) : null}

      {capQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading cap…</Typography>
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
            {canEdit ? (
              <Button type="button" variant="outlined" size="small" onClick={applyPreset}>
                Apply full chat preset
              </Button>
            ) : null}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {CHAT_CLIENT_CAP_PRESET_NAMES.map((code) => (
              <Box key={code} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <Checkbox
                  checked={Boolean(selected[code])}
                  disabled={!canEdit || saveMutation.isPending}
                  onChange={(_, checked) => setSelected((p) => ({ ...p, [code]: checked }))}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {CHAT_CLIENT_CAP_PRESET_LABELS[code] ?? code}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: "monospace", color: theme.app.dashboard.textMuted }}>
                    {code}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {canEdit ? (
            <Button
              type="button"
              variant="primary"
              sx={{ ...gradientPrimaryButtonSx, mt: 2 }}
              disabled={saveMutation.isPending}
              onClick={handleSave}
            >
              {saveMutation.isPending ? "Saving…" : "Save client cap"}
            </Button>
          ) : null}
        </>
      )}
    </DashboardCard>
  );
}
