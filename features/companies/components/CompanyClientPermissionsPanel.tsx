"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Checkbox,
  DashboardCard,
  Divider,
  InputField,
  Typography,
} from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import {
  CHAT_CLIENT_CAP_PRESET_LABELS,
  CHAT_CLIENT_CAP_PRESET_NAMES,
} from "@/lib/permissions/chat-client-cap-preset";
import { CHAT_BUNDLE_OPTIONS } from "@/lib/permissions/chat-bundles";
import {
  useClientPermissionsQuery,
  useReplaceClientPermissionsMutation,
} from "@/lib/hooks/query/companies/client-permissions";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

const FULL_CHAT_PRESET = [...CHAT_CLIENT_CAP_PRESET_NAMES] as string[];

type Props = {
  parentCompanyId: string;
  parentCompanyName?: string;
};

export function CompanyClientPermissionsPanel({
  parentCompanyId,
  parentCompanyName,
}: Props) {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canManage = hasOperational(OP.client.permissions);

  const id = parentCompanyId.trim();
  const query = useClientPermissionsQuery(id, { enabled: canManage && id.length > 0 });
  const replace = useReplaceClientPermissionsMutation(id);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!query.data) return;
    const next: Record<string, boolean> = {};
    for (const code of query.data) next[code] = true;
    setSelected(next);
  }, [query.data]);

  const capActive = (query.data?.length ?? 0) > 0;

  const toggleableCodes = useMemo(() => {
    const bundleCodes = CHAT_BUNDLE_OPTIONS.map((b) => b.code);
    const preset = [...FULL_CHAT_PRESET];
    return Array.from(new Set([...bundleCodes, ...preset])).sort((a, b) =>
      a.localeCompare(b),
    );
  }, []);

  const filteredCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return toggleableCodes;
    return toggleableCodes.filter((code) => {
      const label = CHAT_CLIENT_CAP_PRESET_LABELS[code] ?? code;
      return code.toLowerCase().includes(q) || label.toLowerCase().includes(q);
    });
  }, [search, toggleableCodes]);

  const selectedNames = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected],
  );

  const dirty =
    query.isSuccess &&
    JSON.stringify([...selectedNames].sort()) !==
      JSON.stringify([...(query.data ?? [])].sort());

  if (!canManage) return null;

  const save = (names: string[]) => {
    replace.mutate(names, {
      onSuccess: () =>
        publishAppToast({
          message: names.length ? "Client permission cap saved" : "Permission cap removed",
          variant: "success",
        }),
      onError: (e) =>
        publishAppToast({
          message: extractApiErrorMessageForToast(e, "Could not save cap"),
          variant: "error",
        }),
    });
  };

  return (
    <DashboardCard
      sx={{
        mt: 2.5,
        p: { xs: 2, md: 2.5 },
        borderColor: alpha(theme.app.dashboard.cardBorder, 0.9),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 2 }}>
        <SecurityOutlined sx={{ color: theme.app.dashboard.accentBlue, mt: 0.25 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary }}>
            Client permission ceiling
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.5 }}>
            {parentCompanyName
              ? `Limits what roles and users under “${parentCompanyName}” can ever receive — after reseller cap and before effective /auth/me.`
              : "Limits maximum permissions for users in this parent company org."}
            {!capActive ? " No cap is set — users follow role + reseller rules only." : null}
          </Typography>
        </Box>
      </Box>

      {query.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading cap…</Typography>
      ) : query.isError ? (
        <Typography sx={{ color: theme.palette.error.light }}>
          Could not load client permissions.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Button
              variant="secondary"
              size="small"
              disabled={replace.isPending}
              onClick={() => {
                const next: Record<string, boolean> = {};
                for (const c of FULL_CHAT_PRESET) next[c] = true;
                setSelected(next);
              }}
            >
              Apply full chat preset
            </Button>
            <Button
              variant="secondary"
              size="small"
              disabled={replace.isPending}
              onClick={() => setSelected({})}
            >
              Clear selection
            </Button>
            <Button
              variant="secondary"
              size="small"
              color="error"
              disabled={replace.isPending || !capActive}
              onClick={() => save([])}
            >
              Remove cap
            </Button>
          </Box>

          <InputField
            label="Search permissions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. chat:bundle:agent, page:chat-inbox"
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              maxHeight: 320,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              pr: 0.5,
            }}
          >
            {filteredCodes.map((code) => {
              const label = CHAT_CLIENT_CAP_PRESET_LABELS[code] ?? code;
              return (
                <Box
                  key={code}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 0.25 }}
                >
                  <Checkbox
                    checked={Boolean(selected[code])}
                    onChange={(_, checked) =>
                      setSelected((prev) => ({ ...prev, [code]: checked }))
                    }
                  />
                  <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
                    {label}{" "}
                    <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
                      ({code})
                    </Typography>
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {selectedNames.length} code{selectedNames.length === 1 ? "" : "s"} selected
              {dirty ? " · unsaved" : ""}
            </Typography>
            <Button
              variant="primary"
              size="small"
              disabled={replace.isPending || !dirty}
              onClick={() => save(selectedNames)}
            >
              {replace.isPending ? "Saving…" : "Save ceiling"}
            </Button>
          </Box>
        </>
      )}
    </DashboardCard>
  );
}
