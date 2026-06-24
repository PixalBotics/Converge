"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  FormModal,
  SearchBar,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  getCrmIntegration,
  type CrmIntegrationListItem,
} from "@/api/crm/crm-integration.api";
import { CRM_ROUTES } from "../crm.constants";
import { CrmIntegrationListFilterPanel } from "../components/CrmIntegrationListFilterPanel";
import { clearCrmWizardDraft } from "../wizard-storage";
import {
  useCrmIntegrationsQuery,
  useDeleteCrmIntegrationMutation,
} from "../hooks/useCrmIntegrationQueries";
import { crmWizardStepHref } from "../utils/crm-wizard-nav";
import {
  defaultCrmEditStep,
  hydrateCrmWizardFromDetail,
} from "../utils/hydrate-wizard-from-detail";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";

const PAGE_SIZE = 10;

type Row = CrmIntegrationListItem & Record<string, unknown>;

export function CrmIntegrationListPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { hasOperational } = useAuth();
  const canCreate = hasOperational(OP.crmIntegration.create);
  const canUpdate = hasOperational(OP.crmIntegration.update);
  const canDelete = hasOperational(OP.crmIntegration.delete);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");
  const scope = useWebsiteAssignmentScopeFilters();

  const listQuery = useCrmIntegrationsQuery({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    resellerId: scope.filterResellerId.trim() || undefined,
    parentCompanyId: scope.filterParentCompanyId.trim() || undefined,
    childCompanyId: scope.filterChildCompanyId.trim() || undefined,
    platformCode: filterPlatform.trim() || undefined,
  });

  const deleteMutation = useDeleteCrmIntegrationMutation();

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
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const columns = useMemo<DataTableColumn<Row>[]>(
    () => [
      { id: "clientOf", label: "Client of" },
      { id: "parentCompany", label: "Parent company" },
      { id: "childCompany", label: "Child company" },
      { id: "website", label: "Website" },
      { id: "platformName", label: "CRM" },
      { id: "connectionMethodLabel", label: "Connection" },
      {
        id: "mappingCount",
        label: "Mappings",
        render: (_v, row) => String(row.mappingCount),
      },
    ],
    [],
  );

  const handleAdd = () => {
    clearCrmWizardDraft();
    router.push(CRM_ROUTES.configure);
  };

  const handleEdit = async (row: Row) => {
    try {
      const detail = await getCrmIntegration(row.id);
      hydrateCrmWizardFromDetail(detail, row.websiteId);
      const step = defaultCrmEditStep(detail);
      router.push(crmWizardStepHref(step));
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not open CRM integration for edit."),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      publishAppToast({ variant: "success", message: "CRM integration removed." });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not delete CRM integration."),
      });
    }
  };

  const actionColumn = useMemo(
    () => ({
      label: "Actions",
      render: (row: Row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          {canUpdate ? (
            <IconButton
              size="small"
              sx={dataTableActionButton}
              aria-label="Edit CRM integration"
              onClick={() => void handleEdit(row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canDelete ? (
            <IconButton
              size="small"
              sx={{
                ...dataTableActionButton,
                color: theme.app.dashboard.accentRedLight,
              }}
              aria-label="Delete CRM integration"
              onClick={() => setDeleteTarget(row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      ),
    }),
    [canUpdate, canDelete, theme.app.dashboard.accentRedLight],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
            <Typography fontWeight={700} sx={{ fontSize: 22, lineHeight: "22px", mb: 0.5 }}>
              CRM integration
            </Typography>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              View configured CRM connections by reseller, company, and website.
            </Typography>
          </Box>
          {canCreate ? (
            <Button
              type="button"
              variant="primary"
              startIcon={<Add />}
              sx={gradientPrimaryButtonSx}
              onClick={handleAdd}
            >
              Add CRM integration
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search client, company, website, CRM…"
            sx={{ flex: "0 1 420px", minWidth: { xs: "100%", sm: 240 }, maxWidth: 420 }}
          />
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <CrmIntegrationListFilterPanel
              {...scope}
              filterPlatform={filterPlatform}
              onFilterPlatformChange={setFilterPlatform}
              hasActiveFilters={hasActiveFilters}
              onClearAll={clearAllFilters}
              onClose={() => setFilterPopoverOpen(false)}
            />
          </ToolbarFilterPopover>
        </Box>

        {listQuery.isError ? (
          <Typography color="error">Could not load CRM integrations.</Typography>
        ) : (
          <>
            <DataTable<Row>
              columns={columns}
              rows={items as Row[]}
              getRowId={(row) => row.id}
              actionColumn={canUpdate || canDelete ? actionColumn : undefined}
              minWidth={1080}
            />
            <Box sx={integrationsFooterRow}>
              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                Showing {rangeStart} to {rangeEnd} of {total} entries
              </Typography>
              <Box sx={integrationsPaginationWrapper}>
                <TablePagination page={page} pageCount={Math.max(1, totalPages)} onPageChange={setPage} />
              </Box>
            </Box>
          </>
        )}
      </DashboardCard>

      <FormModal
        open={Boolean(deleteTarget)}
        title="Delete CRM integration?"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.platformName} for ${deleteTarget.childCompany}? This cannot be undone.`
            : undefined
        }
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        onSave={() => void handleDelete()}
        primaryButtonLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={deleteMutation.isPending || !canDelete}
        cancelButtonLabel="Cancel"
        maxWidth={480}
      />
    </Box>
  );
}
