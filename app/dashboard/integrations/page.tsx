"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { SocialMediaConnectionItem } from "@/api/social-media/social-media.api";
import { formatConnectedDate } from "@/api/social-media/social-media.api";
import {
  Button,
  DashboardCard,
  DataTable,
  FormModal,
  SearchBar,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsCardTitleRow,
  integrationsCardToolbar,
  integrationsFooterRow,
  integrationsHeaderActions,
  integrationsMainCardSx,
  integrationsPageHeader,
  integrationsPageWrapper,
  integrationsPaginationWrapper,
  integrationsSearchFieldWrapper,
  integrationsSearchRow,
  integrationsSectionIconBox,
} from "./integrations.styles";
import { SocialMediaListFilterPanel } from "@/features/social-media/components/SocialMediaListFilterPanel";
import {
  SOCIAL_MEDIA_ROUTES,
  clearSocialMediaWizardDraft,
} from "@/features/social-media";
import {
  useDeleteSocialMediaConnectionMutation,
  useSocialMediaConnectionsQuery,
} from "@/features/social-media/hooks/useSocialMediaQueries";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

const PAGE_SIZE = 10;

type SocialIntegrationRow = SocialMediaConnectionItem & Record<string, unknown>;

function statusBadge(theme: AppTheme, status: string) {
  const online = status === "active";
  const color = online ? theme.palette.success.main : theme.app.dashboard.textMuted;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: "9999px",
        bgcolor: alpha(color, theme.palette.mode === "light" ? 0.16 : 0.12),
        border: `1px solid ${alpha(color, theme.palette.mode === "light" ? 0.3 : 0.28)}`,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: online ? theme.app.dashboard.accentGreen : color,
          flexShrink: 0,
        }}
      />
      <Typography
        component="span"
        variant="body2"
        sx={{
          color: online
            ? theme.palette.mode === "light"
              ? "#166534"
              : theme.palette.success.light
            : theme.app.dashboard.textMuted,
          fontWeight: 600,
          fontSize: "0.8125rem",
          textTransform: "capitalize",
        }}
      >
        {online ? "Online" : status.replace(/_/g, " ")}
      </Typography>
    </Box>
  );
}

export default function IntegrationsPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { hasOperational } = useAuth();
  const canCreate = hasOperational(OP.socialMedia.create);
  const canDelete = hasOperational(OP.socialMedia.delete);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [disconnectTarget, setDisconnectTarget] = useState<SocialIntegrationRow | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");

  const scope = useWebsiteAssignmentScopeFilters();

  const listQuery = useSocialMediaConnectionsQuery({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    resellerId: scope.filterResellerId.trim() || undefined,
    parentCompanyId: scope.filterParentCompanyId.trim() || undefined,
    childCompanyId: scope.filterChildCompanyId.trim() || undefined,
    platform:
      filterPlatform === "facebook_messenger" ||
      filterPlatform === "instagram_dm" ||
      filterPlatform === "whatsapp"
        ? filterPlatform
        : undefined,
  });

  const deleteMutation = useDeleteSocialMediaConnectionMutation();

  const hasActiveFilters = Boolean(filterPlatform.trim() || scope.hasScopeFilters);

  const clearAllFilters = () => {
    scope.clearScopeFilters();
    setFilterPlatform("");
  };

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterPlatform,
    scope.filterResellerId,
    scope.filterParentCompanyId,
    scope.filterChildCompanyId,
  ]);

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.pagination.total ?? 0;
  const totalPages = listQuery.data?.pagination.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const columns = useMemo<DataTableColumn<SocialIntegrationRow>[]>(
    () => [
      { id: "clientOf", label: "Client of" },
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "platformLabel", label: "Platform" },
      {
        id: "accountName",
        label: "Account Name",
        cellVariant: "muted",
        render: (_v, row) => row.accountName?.trim() || row.externalAccountId,
      },
      {
        id: "connectedDate",
        label: "Connected Date",
        cellVariant: "muted",
        render: (_v, row) => formatConnectedDate(row.connectedDate),
      },
      {
        id: "status",
        label: "Status",
        render: (_v, row) => statusBadge(theme, row.status),
      },
    ],
    [theme],
  );

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await deleteMutation.mutateAsync(disconnectTarget.id);
      publishAppToast({ variant: "success", message: "Social account disconnected." });
      setDisconnectTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not disconnect account."),
      });
    }
  };

  const actionColumn = useMemo(
    () =>
      canDelete
        ? {
            label: "Actions",
            render: (row: SocialIntegrationRow) => (
              <IconButton
                type="button"
                size="small"
                aria-label="Disconnect integration"
                sx={{
                  ...dataTableActionButton,
                  color: theme.app.dashboard.accentRedLight,
                }}
                onClick={() => setDisconnectTarget(row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            ),
          }
        : undefined,
    [canDelete, theme.app.dashboard.accentRedLight],
  );

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            All social media integrations.
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 480 }}>
            Connect Facebook, Instagram, or WhatsApp per website. Messages appear in the same agent inbox as live chat.
          </Typography>
        </Box>
        {canCreate ? (
          <Box sx={integrationsHeaderActions}>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
              onClick={() => {
                clearSocialMediaWizardDraft();
                router.push(SOCIAL_MEDIA_ROUTES.addOrg);
              }}
            >
              Add Social Media
            </Button>
          </Box>
        ) : null}
      </Box>

      <DashboardCard sx={integrationsMainCardSx}>
        <Box sx={integrationsCardToolbar}>
          <Box sx={integrationsCardTitleRow}>
            <Box sx={integrationsSectionIconBox} aria-hidden>
              <Typography
                sx={{
                  color: theme.app.dashboard.white95,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  lineHeight: 1,
                }}
              >
                $
              </Typography>
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ textAlign: "left" }}>
              All social media integrations.
            </Typography>
          </Box>
          <Box sx={integrationsSearchRow}>
            <Box sx={integrationsSearchFieldWrapper}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search reseller, company, website, account…"
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <ToolbarFilterPopover
              open={filterPopoverOpen}
              onOpenChange={setFilterPopoverOpen}
              active={hasActiveFilters}
            >
              <SocialMediaListFilterPanel
                {...scope}
                filterPlatform={filterPlatform}
                onFilterPlatformChange={setFilterPlatform}
                hasActiveFilters={hasActiveFilters}
                onClearAll={clearAllFilters}
                onClose={() => setFilterPopoverOpen(false)}
              />
            </ToolbarFilterPopover>
          </Box>
        </Box>

        {listQuery.isError ? (
          <Typography color="error" sx={{ px: 2, pb: 2 }}>
            Could not load social media integrations.
          </Typography>
        ) : (
          <>
            <DataTable<SocialIntegrationRow>
              columns={columns}
              rows={items as SocialIntegrationRow[]}
              getRowId={(row) => row.id}
              minWidth={1400}
              size="medium"
              actionColumn={actionColumn}
            />

            <Box sx={integrationsFooterRow}>
              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                Showing {rangeStart} to {rangeEnd} of {total} entries
              </Typography>
              <Box sx={integrationsPaginationWrapper}>
                <TablePagination
                  page={page}
                  pageCount={Math.max(1, totalPages)}
                  onPageChange={setPage}
                />
              </Box>
            </Box>
          </>
        )}
      </DashboardCard>

      <FormModal
        open={Boolean(disconnectTarget)}
        title="Disconnect social account?"
        description={
          disconnectTarget
            ? `Remove ${disconnectTarget.platformLabel} (${disconnectTarget.accountName ?? disconnectTarget.externalAccountId}) from ${disconnectTarget.website}?`
            : undefined
        }
        onClose={() => !deleteMutation.isPending && setDisconnectTarget(null)}
        onSave={() => void handleDisconnect()}
        primaryButtonLabel={deleteMutation.isPending ? "Disconnecting…" : "Disconnect"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={deleteMutation.isPending || !canDelete}
        cancelButtonLabel="Cancel"
        maxWidth={480}
      />
    </Box>
  );
}
