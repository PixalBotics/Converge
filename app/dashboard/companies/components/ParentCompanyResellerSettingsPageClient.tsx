"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { useParentCompanyQuery } from "@/lib/hooks/query";
import { useAuth } from "@/lib/auth";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { pageWrapper } from "../overview.styles";
import { ResellerModulesPanel } from "@/features/companies/components/ResellerModulesPanel";

export function ParentCompanyResellerSettingsPageClient() {
  const theme = useTheme() as AppTheme;
  const { hasPage } = useAuth();
  const canViewModules =
    hasPage("page:resellers") || hasPage("page:clients") || hasPage("page:account-setup");
  const canEditModules = hasPage("page:resellers");
  const params = useParams<{ parentId: string }>();
  const parentId = decodeURIComponent(String(params?.parentId ?? "")).trim();

  const parentQuery = useParentCompanyQuery(parentId, { enabled: parentId.length > 0 });
  const detail = parentQuery.data?.success ? parentQuery.data.data : undefined;
  const reseller = detail?.parentCompany.reseller;

  const backToEditHref =
    parentId.length > 0
      ? `/dashboard/companies/${encodeURIComponent(parentId)}/edit?step=1`
      : "/dashboard/companies";

  const errorMessage = !parentQuery.isError
    ? null
    : extractApiErrorMessageForToast(parentQuery.error) ?? "Could not load company.";

  return (
    <Box sx={pageWrapper}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.25, flexWrap: "wrap" }}>
        <Button component={Link} href={backToEditHref} variant="secondary">
          ← Back to edit company
        </Button>
      </Box>

      <Box>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Reseller settings
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
          Manage reseller services/modules separately from child-company editing.
        </Typography>
      </Box>

      {parentQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading reseller settings…</Typography>
      ) : null}

      {errorMessage ? (
        <Typography sx={{ color: "rgba(248,113,113,0.95)" }}>{errorMessage}</Typography>
      ) : null}

      {!parentQuery.isLoading && !errorMessage && !reseller ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          No reseller is linked to this parent company.
        </Typography>
      ) : null}

      {reseller && canViewModules ? (
        <ResellerModulesPanel
          resellerId={String(reseller.id)}
          resellerName={reseller.name ?? undefined}
          readOnly={!canEditModules}
        />
      ) : null}

      {!parentQuery.isLoading && !errorMessage && reseller && !canViewModules ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          You do not have permission to view reseller product modules.
        </Typography>
      ) : null}
    </Box>
  );
}

